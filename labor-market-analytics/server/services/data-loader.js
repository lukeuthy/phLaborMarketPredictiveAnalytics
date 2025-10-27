/**
 * Data Loader Service
 * Handles loading and initial processing of labor market data
 */

const fs = require("fs")
const path = require("path")
const csv = require("csv-parse/sync")

class DataLoader {
  constructor() {
    this.data = null
    this.metadata = {}
  }

  /**
   * Load data from CSV file
   * @param {string} filePath - Path to CSV file
   * @returns {Array} Loaded data array
   */
  loadCSV(filePath) {
    try {
      console.log(`[DataLoader] Loading data from ${filePath}`)

      const fileContent = fs.readFileSync(filePath, "utf-8")
      const records = csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        cast: (value, context) => {
          if (context.column === "Quarter") return value
          return isNaN(value) ? value : Number.parseFloat(value)
        },
      })

      // Validate required columns
      const requiredColumns = ["Quarter", "LFPR", "ER", "UR", "UER"]
      if (records.length > 0) {
        const missingCols = requiredColumns.filter((col) => !(col in records[0]))
        if (missingCols.length > 0) {
          throw new Error(`Missing required columns: ${missingCols.join(", ")}`)
        }
      }

      // Convert Quarter to Date and sort
      const data = records
        .map((record) => ({
          ...record,
          Date: this.quarterToDate(record.Quarter),
        }))
        .sort((a, b) => new Date(a.Date) - new Date(b.Date))

      // Store metadata
      this.metadata = {
        filePath,
        nRecords: data.length,
        startDate: data[0]?.Quarter,
        endDate: data[data.length - 1]?.Quarter,
        columns: Object.keys(data[0] || {}),
      }

      this.data = data
      console.log(`[DataLoader] Successfully loaded ${data.length} records`)

      return data
    } catch (error) {
      console.error(`[DataLoader] Error loading data: ${error.message}`)
      throw error
    }
  }

  /**
   * Convert quarter string to date
   * @param {string} quarter - Quarter string (e.g., "2024 Q1")
   * @returns {string} ISO date string
   */
  quarterToDate(quarter) {
    const [year, q] = quarter.split(" Q")
    const month = (Number.parseInt(q) - 1) * 3
    return new Date(Number.parseInt(year), month, 1).toISOString().split("T")[0]
  }

  /**
   * Get data for specific indicator
   * @param {string} indicator - Indicator name
   * @returns {Array} Indicator values
   */
  getIndicatorData(indicator) {
    if (!this.data) throw new Error("No data loaded")
    return this.data.map((record) => record[indicator])
  }

  /**
   * Get summary statistics for all indicators
   * @returns {Object} Statistics for each indicator
   */
  getSummaryStatistics() {
    if (!this.data) throw new Error("No data loaded")

    const indicators = ["LFPR", "ER", "UR", "UER"]
    const stats = {}

    indicators.forEach((indicator) => {
      const values = this.getIndicatorData(indicator).filter((v) => v !== null && v !== undefined)
      values.sort((a, b) => a - b)

      stats[indicator] = {
        mean: values.reduce((a, b) => a + b, 0) / values.length,
        median: values[Math.floor(values.length / 2)],
        std: this.calculateStd(values),
        min: Math.min(...values),
        max: Math.max(...values),
        q25: values[Math.floor(values.length * 0.25)],
        q75: values[Math.floor(values.length * 0.75)],
      }
    })

    return stats
  }

  /**
   * Calculate standard deviation
   * @private
   */
  calculateStd(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  getMetadata() {
    return this.metadata
  }
}

module.exports = DataLoader
