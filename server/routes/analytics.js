import express from "express"
import pool from "../config/database.js"
import { calculateStatistics, generateForecasts } from "../services/analytics.js"

const router = express.Router()

// Get analytics for dataset
router.get("/dataset/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [data] = await connection.query("SELECT * FROM labor_data WHERE dataset_id = ? ORDER BY year, quarter", [
      req.params.id,
    ])
    connection.release()

    const stats = calculateStatistics(data)
    const forecasts = generateForecasts(data)

    res.json({
      statistics: stats,
      forecasts,
      dataPoints: data.length,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get sector analysis
router.get("/sectors/:id", async (req, res) => {
  try {
    const connection = await pool.getConnection()
    const [sectors] = await connection.query(
      `SELECT sector, COUNT(*) as count, AVG(employment_rate) as avg_employment,
       AVG(unemployment_rate) as avg_unemployment
       FROM labor_data WHERE dataset_id = ? GROUP BY sector`,
      [req.params.id],
    )
    connection.release()

    res.json(sectors)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
