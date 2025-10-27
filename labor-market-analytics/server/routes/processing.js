import express from "express"
import pool from "../config/database.js"
import {
  processARIMA,
  processSARIMA,
  processSVR,
  processRandomForest,
  processLSTM,
  processGradientBoosting,
} from "../services/algorithms.js"
import { validateAlgorithmComparison } from "../middleware/validation.js"
import { asyncHandler, ApiError } from "../middleware/error-handler.js"

const router = express.Router()

// Run algorithm comparison
router.post(
  "/compare",
  validateAlgorithmComparison,
  asyncHandler(async (req, res) => {
    const { datasetId, algorithms, parameters } = req.body
    const connection = await pool.getConnection()

    try {
      // Get dataset
      const [data] = await connection.query("SELECT * FROM labor_data WHERE dataset_id = ? ORDER BY year, quarter", [
        datasetId,
      ])

      if (data.length === 0) {
        throw new ApiError("Dataset not found or empty", 404)
      }

      const results = {}
      const startTime = Date.now()

      // Run selected algorithms
      if (algorithms.includes("ARIMA")) {
        results.ARIMA = await processARIMA(data, parameters?.ARIMA)
      }
      if (algorithms.includes("SARIMA")) {
        results.SARIMA = await processSARIMA(data, parameters?.SARIMA)
      }
      if (algorithms.includes("SVR")) {
        results.SVR = await processSVR(data, parameters?.SVR)
      }
      if (algorithms.includes("RandomForest")) {
        results.RandomForest = await processRandomForest(data, parameters?.RandomForest)
      }
      if (algorithms.includes("LSTM")) {
        results.LSTM = await processLSTM(data, parameters?.LSTM)
      }
      if (algorithms.includes("GradientBoosting")) {
        results.GradientBoosting = await processGradientBoosting(data, parameters?.GradientBoosting)
      }

      const processingTime = Date.now() - startTime

      // Save results
      const [resultRecord] = await connection.query(
        `INSERT INTO processing_results 
        (dataset_id, algorithms, results, processing_time, created_at)
        VALUES (?, ?, ?, ?, NOW())`,
        [datasetId, JSON.stringify(algorithms), JSON.stringify(results), processingTime],
      )

      res.json({
        success: true,
        resultId: resultRecord.insertId,
        results,
        processingTime,
        message: "Processing completed",
      })
    } catch (error) {
      throw new ApiError(`Processing failed: ${error.message}`, 500)
    } finally {
      connection.release()
    }
  }),
)

// Get processing results
router.get(
  "/results/:id",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [result] = await connection.query("SELECT * FROM processing_results WHERE id = ?", [req.params.id])

      if (result.length === 0) {
        throw new ApiError("Result not found", 404)
      }

      res.json({
        ...result[0],
        results: JSON.parse(result[0].results),
        algorithms: JSON.parse(result[0].algorithms),
      })
    } finally {
      connection.release()
    }
  }),
)

export default router
