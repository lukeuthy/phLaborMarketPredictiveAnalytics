import express from "express"
import pool from "../config/database.js"

const router = express.Router()

// Start preprocessing pipeline
router.post("/start/:datasetId", async (req, res) => {
  try {
    const { datasetId } = req.params
    const connection = await pool.getConnection()

    const steps = ["data_validation", "missing_values", "outlier_detection", "normalization", "feature_engineering"]

    for (const step of steps) {
      await connection.query(
        `INSERT INTO preprocessing_logs (dataset_id, step, status, details)
         VALUES (?, ?, ?, ?)`,
        [datasetId, step, "pending", JSON.stringify({ message: `${step} pending` })],
      )
    }

    connection.release()

    res.json({
      success: true,
      datasetId,
      steps,
      message: "Preprocessing pipeline started",
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get preprocessing status
router.get("/status/:datasetId", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [logs] = await connection.query("SELECT * FROM preprocessing_logs WHERE dataset_id = ? ORDER BY created_at", [
      req.params.datasetId,
    ])
    connection.release()

    const completed = logs.filter((l) => l.status === "completed").length
    const total = logs.length

    res.json({
      datasetId: req.params.datasetId,
      logs,
      progress: total > 0 ? (completed / total) * 100 : 0,
      completed,
      total,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update preprocessing step
router.put("/step/:stepId", async (req, res) => {
  try {
    const { status, details } = req.body
    const connection = await pool.getConnection()

    await connection.query("UPDATE preprocessing_logs SET status = ?, details = ? WHERE id = ?", [
      status,
      JSON.stringify(details),
      req.params.stepId,
    ])

    connection.release()

    res.json({ success: true, message: "Step updated" })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
