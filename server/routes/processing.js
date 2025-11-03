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

router.post(
  "/compare",
  validateAlgorithmComparison,
  asyncHandler(async (req, res) => {
    const { datasetId, algorithms, parameters } = req.body
    const connection = await pool.getConnection()

    try {
      // Get dataset
      const [data] = await connection.query("SELECT * FROM labor_data WHERE dataset_id = ? ORDER BY year, month", [
        datasetId,
      ])

      if (data.length === 0) {
        throw new ApiError("Dataset not found or empty", 404)
      }

      // Validate minimum data points (at least 12 months for time series)
      if (data.length < 12) {
        throw new ApiError("Insufficient data: minimum 12 months required", 400)
      }

      const results = {}
      const startTime = Date.now()
      const algorithmMetrics = []

      // Run selected algorithms with real processing
      const algorithmFunctions = {
        ARIMA: processARIMA,
        SARIMA: processSARIMA,
        SVR: processSVR,
        RandomForest: processRandomForest,
        LSTM: processLSTM,
        GradientBoosting: processGradientBoosting,
      }

      for (const algo of algorithms) {
        if (algorithmFunctions[algo]) {
          const algoStartTime = Date.now()
          const result = await algorithmFunctions[algo](data, parameters?.[algo])
          const algoTime = Date.now() - algoStartTime

          results[algo] = result
          algorithmMetrics.push({
            algorithm: algo,
            accuracy: result.accuracy,
            rmse: result.rmse,
            mae: result.mae,
            mape: result.mape,
            executionTime: algoTime,
            forecastSteps: result.forecast?.length || 0,
          })
        }
      }

      const totalProcessingTime = Date.now() - startTime

      // Find best performing algorithm
      const bestAlgorithm = algorithmMetrics.reduce((best, current) =>
        current.accuracy > best.accuracy ? current : best,
      )

      const fastestAlgorithm = algorithmMetrics.reduce((fastest, current) =>
        current.executionTime < fastest.executionTime ? current : fastest,
      )

      // Save results to database
      const [resultRecord] = await connection.query(
        `INSERT INTO processing_results 
        (dataset_id, algorithms, results, metrics, best_algorithm, fastest_algorithm, 
         processing_time, data_points, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          datasetId,
          JSON.stringify(algorithms),
          JSON.stringify(results),
          JSON.stringify(algorithmMetrics),
          bestAlgorithm.algorithm,
          fastestAlgorithm.algorithm,
          totalProcessingTime,
          data.length,
        ],
      )

      res.json({
        success: true,
        resultId: resultRecord.insertId,
        results,
        metrics: algorithmMetrics,
        summary: {
          totalAlgorithms: algorithms.length,
          bestAlgorithm: bestAlgorithm.algorithm,
          bestAccuracy: bestAlgorithm.accuracy,
          fastestAlgorithm: fastestAlgorithm.algorithm,
          fastestTime: fastestAlgorithm.executionTime,
          totalProcessingTime,
          dataPoints: data.length,
        },
        message: "Processing completed successfully",
      })
    } catch (error) {
      throw new ApiError(`Processing failed: ${error.message}`, 500)
    } finally {
      connection.release()
    }
  }),
)

// Get processing results with detailed metrics
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
        metrics: JSON.parse(result[0].metrics),
      })
    } finally {
      connection.release()
    }
  }),
)

// Get all results for a dataset
router.get(
  "/dataset/:datasetId/results",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [results] = await connection.query(
        `SELECT id, algorithms, best_algorithm, fastest_algorithm, processing_time, 
                data_points, created_at FROM processing_results 
         WHERE dataset_id = ? ORDER BY created_at DESC`,
        [req.params.datasetId],
      )

      res.json({
        datasetId: req.params.datasetId,
        totalResults: results.length,
        results: results.map((r) => ({
          ...r,
          algorithms: JSON.parse(r.algorithms),
        })),
      })
    } finally {
      connection.release()
    }
  }),
)

// Compare two processing results
router.get(
  "/compare/:resultId1/:resultId2",
  asyncHandler(async (req, res) => {
    const connection = await pool.getConnection()
    try {
      const [result1] = await connection.query("SELECT * FROM processing_results WHERE id = ?", [req.params.resultId1])
      const [result2] = await connection.query("SELECT * FROM processing_results WHERE id = ?", [req.params.resultId2])

      if (result1.length === 0 || result2.length === 0) {
        throw new ApiError("One or both results not found", 404)
      }

      res.json({
        comparison: {
          result1: {
            id: result1[0].id,
            algorithms: JSON.parse(result1[0].algorithms),
            metrics: JSON.parse(result1[0].metrics),
            processingTime: result1[0].processing_time,
            createdAt: result1[0].created_at,
          },
          result2: {
            id: result2[0].id,
            algorithms: JSON.parse(result2[0].algorithms),
            metrics: JSON.parse(result2[0].metrics),
            processingTime: result2[0].processing_time,
            createdAt: result2[0].created_at,
          },
        },
      })
    } finally {
      connection.release()
    }
  }),
)

export default router
