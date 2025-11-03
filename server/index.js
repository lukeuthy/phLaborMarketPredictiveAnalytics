import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { fileURLToPath } from "url"
import { dirname } from "path"
import dataRoutes from "./routes/data.js"
import preprocessingRoutes from "./routes/preprocessing.js"
import processingRoutes from "./routes/processing.js"
import analyticsRoutes from "./routes/analytics.js"
import { errorHandler } from "./middleware/error-handler.js"
import { requestLogger } from "./middleware/logger.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(requestLogger)

// Routes
app.use("/api/data", dataRoutes)
app.use("/api/preprocessing", preprocessingRoutes)
app.use("/api/processing", processingRoutes)
app.use("/api/analytics", analyticsRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    status: 404,
    path: req.path,
  })
})

// Global error handler
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`[SERVER] Running on http://localhost:${PORT}`)
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || "development"}`)
})
