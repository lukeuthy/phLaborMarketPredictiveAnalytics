/**
 * Export utility for labor market data
 * Converts database results to CSV format for analysis and sharing
 */

const fs = require("fs")
const path = require("path")

/**
 * Export dataset to CSV file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Output filename
 * @param {string} outputDir - Output directory path
 * @returns {Promise<string>} Path to created CSV file
 */
async function exportToCSV(data, filename, outputDir = "./exports") {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    if (!data || data.length === 0) {
      throw new Error("No data provided for export")
    }

    // Get headers from first object
    const headers = Object.keys(data[0])

    // Create CSV header row
    const csvHeader = headers.map((h) => `"${h}"`).join(",")

    // Create CSV data rows
    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header]
          // Handle null/undefined, numbers, and strings with commas
          if (value === null || value === undefined) {
            return ""
          }
          if (typeof value === "number") {
            return value
          }
          // Escape quotes and wrap in quotes if contains comma
          const strValue = String(value).replace(/"/g, '""')
          return strValue.includes(",") ? `"${strValue}"` : strValue
        })
        .join(",")
    })

    const csvContent = [csvHeader, ...csvRows].join("\n")

    // Write to file
    const filePath = path.join(outputDir, filename)
    fs.writeFileSync(filePath, csvContent, "utf-8")

    console.log(`[v0] Data exported successfully to ${filePath}`)
    return filePath
  } catch (error) {
    console.error("[v0] Export error:", error.message)
    throw error
  }
}

/**
 * Export results with metadata
 * @param {Array} results - Results data
 * @param {Object} metadata - Metadata about the analysis
 * @param {string} filename - Output filename
 * @returns {Promise<Object>} Export paths for CSV and metadata
 */
async function exportResultsWithMetadata(results, metadata, filename) {
  try {
    const outputDir = "./exports"

    // Export CSV results
    const csvPath = await exportToCSV(results, filename, outputDir)

    // Export metadata as JSON
    const metadataPath = path.join(outputDir, filename.replace(".csv", "-metadata.json"))
    const metadataContent = {
      ...metadata,
      exportedAt: new Date().toISOString(),
      recordCount: results.length,
      fields: Object.keys(results[0] || {}),
    }

    fs.writeFileSync(metadataPath, JSON.stringify(metadataContent, null, 2), "utf-8")

    console.log(`[v0] Metadata exported to ${metadataPath}`)

    return {
      csvPath,
      metadataPath,
      recordCount: results.length,
    }
  } catch (error) {
    console.error("[v0] Results export error:", error.message)
    throw error
  }
}

/**
 * Export algorithm comparison results
 * @param {Array} algorithms - Algorithm comparison data
 * @param {string} datasetName - Name of dataset analyzed
 * @returns {Promise<Object>} Export info
 */
async function exportAlgorithmComparison(algorithms, datasetName) {
  try {
    const outputDir = "./exports"

    // Prepare data for export
    const exportData = algorithms.map((algo) => ({
      Algorithm: algo.name,
      Accuracy: algo.accuracy.toFixed(4),
      RMSE: algo.rmse.toFixed(4),
      MAE: algo.mae.toFixed(4),
      MAPE: algo.mape.toFixed(4),
      "R-Squared": algo.rSquared.toFixed(4),
      "Execution Time (ms)": algo.executionTime,
      Status: algo.status,
    }))

    const filename = `algorithm-comparison-${datasetName}-${Date.now()}.csv`
    const filePath = await exportToCSV(exportData, filename, outputDir)

    return {
      filePath,
      recordCount: exportData.length,
      message: "Algorithm comparison exported successfully",
    }
  } catch (error) {
    console.error("[v0] Algorithm comparison export error:", error.message)
    throw error
  }
}

/**
 * Export preprocessing statistics
 * @param {Object} stats - Preprocessing statistics
 * @param {string} datasetName - Name of dataset
 * @returns {Promise<Object>} Export info
 */
async function exportPreprocessingStats(stats, datasetName) {
  try {
    const outputDir = "./exports"

    const statsObject = [
      {
        Metric: "Total Records",
        Value: stats.totalRecords,
      },
      {
        Metric: "Missing Values Handled",
        Value: stats.missingValuesHandled,
      },
      {
        Metric: "Outliers Detected",
        Value: stats.outliersDetected,
      },
      {
        Metric: "Outliers Removed",
        Value: stats.outliersRemoved,
      },
      {
        Metric: "Mean Normalization Applied",
        Value: "Yes",
      },
      {
        Metric: "Date Range",
        Value: `${stats.dateRange.start} to ${stats.dateRange.end}`,
      },
      {
        Metric: "Processing Time (seconds)",
        Value: stats.processingTime,
      },
    ]

    const filename = `preprocessing-stats-${datasetName}-${Date.now()}.csv`
    const filePath = await exportToCSV(statsObject, filename, outputDir)

    return {
      filePath,
      message: "Preprocessing statistics exported successfully",
    }
  } catch (error) {
    console.error("[v0] Preprocessing export error:", error.message)
    throw error
  }
}

module.exports = {
  exportToCSV,
  exportResultsWithMetadata,
  exportAlgorithmComparison,
  exportPreprocessingStats,
}
