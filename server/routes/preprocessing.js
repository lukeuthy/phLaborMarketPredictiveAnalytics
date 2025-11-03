import express from "express"
import pool from "../config/database.js"
import {
  validateData,
  handleMissingValues,
  detectOutliers,
  normalizeData,
  engineerFeatures,
} from "../services/data-preprocessor.js"
import { asyncHandler, ApiError } from "../middleware/error-handler.js"

const router = express.Router()

// Start preprocessing pipeline with real processing
router.post(
  "/start/:datasetId",
  asyncHandler(async (req, res) => {
    const { datasetId } = req.params
    const connection = await pool.getConnection()

    try {
      // Get dataset
      const [dataset] = await connection.query("SELECT * FROM datasets WHERE id = ?", [datasetId])
      if (dataset.length === 0) {
        throw new ApiError("Dataset not found", 404)
      }

      const [data] = await connection.query("SELECT * FROM labor_data WHERE dataset_id = ? ORDER BY year, quarter", [
        datasetId,
      ])

      if (data.length === 0) {
        throw new ApiError("No data found in dataset", 400)
      }

      // Define preprocessing steps
      const steps = [
        { name: "data_validation", label: "Validating Data" },
        { name: "missing_values", label: "Handling Missing Values" },
        { name: "outlier_detection", label: "Detecting Outliers" },
        { name: "normalization", label: "Normalizing Data" },
        { name: "feature_engineering", label: "Engineering Features" },
      ]

      // Create preprocessing log entries
      const logIds = []
      for (const step of steps) {
        const [result] = await connection.query(
          `INSERT INTO preprocessing_logs (dataset_id, step, label, status, details, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [datasetId, step.name, step.label, "pending", JSON.stringify({ message: `${step.label} pending` })],
        )
        logIds.push(result.insertId)
      }

      // Process each step
      let processedData = data
      const startTime = Date.now()
      const results = {}

      // Step 1: Data Validation
      const validationResult = validateData(processedData)
      await connection.query(
        `UPDATE preprocessing_logs SET status = ?, details = ?, completed_at = NOW() WHERE id = ?`,
        ["completed", JSON.stringify(validationResult), logIds[0]],
      )
      results.validation = validationResult

      // Step 2: Handle Missing Values
      const missingResult = handleMissingValues(processedData)
      processedData = missingResult.data
      await connection.query(
        `UPDATE preprocessing_logs SET status = ?, details = ?, completed_at = NOW() WHERE id = ?`,
        ["completed", JSON.stringify(missingResult.stats), logIds[1]],
      )
      results.missing = missingResult.stats

      // Step 3: Detect Outliers
      const outlierResult = detectOutliers(processedData)
      await connection.query(
        `UPDATE preprocessing_logs SET status = ?, details = ?, completed_at = NOW() WHERE id = ?`,
        ["completed", JSON.stringify(outlierResult), logIds[2]],
      )
      results.outliers = outlierResult

      // Step 4: Normalize Data
      const normalizedResult = normalizeData(processedData)
      processedData = normalizedResult.data
      await connection.query(
        `UPDATE preprocessing_logs SET status = ?, details = ?, completed_at = NOW() WHERE id = ?`,
        ["completed", JSON.stringify(normalizedResult.stats), logIds[3]],
      )
      results.normalization = normalizedResult.stats

      // Step 5: Feature Engineering
      const featureResult = engineerFeatures(processedData)
      processedData = featureResult.data
      await connection.query(
        `UPDATE preprocessing_logs SET status = ?, details = ?, completed_at = NOW() WHERE id = ?`,
        ["completed", JSON.stringify(featureResult.stats), logIds[4]],
      )
      results.features = featureResult.stats

      // Save preprocessed data
      const processingTime = Date.now() - startTime
      const [preprocessResult] = await connection.query(
        `INSERT INTO preprocessing_results 
        (dataset_id, original_records, processed_records, processing_time, results, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [datasetId, data.length, processedData.length, processingTime, JSON.stringify(results)],
      )

      res.json({
        success: true,
        datasetId,
        preprocessingId: preprocessResult.insertId,
        steps: steps.map((s) => s.name),
        results,
        processingTime,
        message: "Preprocessing completed successfully",
      })
    } catch (error) {
      throw new ApiError(`Preprocessing failed: ${error.message}`, 500)
    } finally {
      connection.release()
    }
  }),
)

// Get preprocessing status
router.get(
  "/status/:datasetId",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [logs] = await connection.query(
        "SELECT * FROM preprocessing_logs WHERE dataset_id = ? ORDER BY created_at",
        [req.params.datasetId],
      )

      const completed = logs.filter((l) => l.status === "completed").length
      const total = logs.length

      res.json({
        datasetId: req.params.datasetId,
        logs,
        progress: total > 0 ? (completed / total) * 100 : 0,
        completed,
        total,
      })
    } finally {
      connection.release()
    }
  }),
)

// Get preprocessing results
router.get(
  "/results/:datasetId",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [results] = await connection.query(
        "SELECT * FROM preprocessing_results WHERE dataset_id = ? ORDER BY created_at DESC LIMIT 1",
        [req.params.datasetId],
      )

      if (results.length === 0) {
        throw new ApiError("No preprocessing results found", 404)
      }

      res.json({
        ...results[0],
        results: JSON.parse(results[0].results),
      })
    } finally {
      connection.release()
    }
  }),
)

export default router
