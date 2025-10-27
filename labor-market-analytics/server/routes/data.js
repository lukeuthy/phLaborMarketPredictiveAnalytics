import express from "express"
import pool from "../config/database.js"
import { validateDataUpload } from "../middleware/validation.js"
import { asyncHandler, ApiError } from "../middleware/error-handler.js"

const router = express.Router()

// Upload labor data
router.post(
  "/upload",
  validateDataUpload,
  asyncHandler(async (req, res) => {
    const { data, metadata } = req.body
    const connection = await pool.getConnection()

    try {
      // Insert metadata
      const [metaResult] = await connection.query(
        "INSERT INTO datasets (name, description, source, upload_date) VALUES (?, ?, ?, NOW())",
        [metadata.name, metadata.description, metadata.source],
      )

      const datasetId = metaResult.insertId

      // Insert data records
      for (const record of data) {
        await connection.query(
          `INSERT INTO labor_data 
          (dataset_id, quarter, year, lfpr, employment_rate, unemployment_rate, underemployment_rate, sector)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            datasetId,
            record.quarter,
            record.year,
            record.lfpr,
            record.employment_rate,
            record.unemployment_rate,
            record.underemployment_rate,
            record.sector || "Overall",
          ],
        )
      }

      res.json({
        success: true,
        datasetId,
        recordsInserted: data.length,
        message: "Data uploaded successfully",
      })
    } catch (error) {
      throw new ApiError(`Upload failed: ${error.message}`, 500)
    } finally {
      connection.release()
    }
  }),
)

// Get all datasets
router.get(
  "/datasets",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [datasets] = await connection.query(
        "SELECT id, name, description, source, upload_date, record_count FROM datasets ORDER BY upload_date DESC",
      )
      res.json(datasets)
    } finally {
      connection.release()
    }
  }),
)

// Get dataset by ID with full data
router.get(
  "/datasets/:id",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [datasetMeta] = await connection.query("SELECT * FROM datasets WHERE id = ?", [req.params.id])

      if (datasetMeta.length === 0) {
        throw new ApiError("Dataset not found", 404)
      }

      const [data] = await connection.query("SELECT * FROM labor_data WHERE dataset_id = ? ORDER BY year, quarter", [
        req.params.id,
      ])

      res.json({
        metadata: datasetMeta[0],
        data,
      })
    } finally {
      connection.release()
    }
  }),
)

// Delete dataset
router.delete(
  "/datasets/:id",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.query("DELETE FROM datasets WHERE id = ?", [req.params.id])

      if (result.affectedRows === 0) {
        throw new ApiError("Dataset not found", 404)
      }

      res.json({ success: true, message: "Dataset deleted" })
    } finally {
      connection.release()
    }
  }),
)

// Get data summary statistics
router.get(
  "/datasets/:id/summary",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [summary] = await connection.query(
        `SELECT 
          COUNT(*) as total_records,
          MIN(year) as start_year,
          MAX(year) as end_year,
          AVG(lfpr) as avg_lfpr,
          AVG(employment_rate) as avg_employment,
          AVG(unemployment_rate) as avg_unemployment,
          AVG(underemployment_rate) as avg_underemployment
         FROM labor_data WHERE dataset_id = ?`,
        [req.params.id],
      )

      if (!summary[0] || summary[0].total_records === 0) {
        throw new ApiError("No data found for this dataset", 404)
      }

      res.json(summary[0])
    } finally {
      connection.release()
    }
  }),
)

// Export dataset as CSV
router.get(
  "/datasets/:id/export",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [data] = await connection.query("SELECT * FROM labor_data WHERE dataset_id = ? ORDER BY year, quarter", [
        req.params.id,
      ])

      if (data.length === 0) {
        throw new ApiError("No data to export", 404)
      }

      const headers = [
        "Quarter",
        "Year",
        "LFPR",
        "Employment Rate",
        "Unemployment Rate",
        "Underemployment Rate",
        "Sector",
      ]
      const rows = data.map((d) => [
        d.quarter,
        d.year,
        d.lfpr,
        d.employment_rate,
        d.unemployment_rate,
        d.underemployment_rate,
        d.sector,
      ])

      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", "attachment; filename=labor_data.csv")
      res.send(csv)
    } finally {
      connection.release()
    }
  }),
)

export default router
