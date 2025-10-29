import ss from "simple-statistics"

/**
 * Validate data integrity and structure
 */
export function validateData(data) {
  const stats = {
    totalRecords: data.length,
    validRecords: 0,
    invalidRecords: 0,
    issues: [],
  }

  data.forEach((record, idx) => {
    const issues = []

    // Check required fields
    if (!record.year || !record.quarter) {
      issues.push("Missing year or quarter")
    }

    // Check numeric fields
    const numericFields = ["lfpr", "employment_rate", "unemployment_rate", "underemployment_rate"]
    numericFields.forEach((field) => {
      if (record[field] !== null && record[field] !== undefined) {
        if (typeof record[field] !== "number" || isNaN(record[field])) {
          issues.push(`Invalid ${field}: not a number`)
        }
        // Check reasonable ranges (0-100 for percentages)
        if (record[field] < 0 || record[field] > 100) {
          issues.push(`${field} out of range: ${record[field]}`)
        }
      }
    })

    if (issues.length === 0) {
      stats.validRecords++
    } else {
      stats.invalidRecords++
      stats.issues.push({ recordIndex: idx, issues })
    }
  })

  return stats
}

/**
 * Handle missing values using interpolation
 */
export function handleMissingValues(data) {
  const stats = {
    missingCount: 0,
    interpolated: 0,
    filled: 0,
  }

  const numericFields = ["lfpr", "employment_rate", "unemployment_rate", "underemployment_rate"]
  const processedData = JSON.parse(JSON.stringify(data))

  numericFields.forEach((field) => {
    // Find missing values
    const missingIndices = []
    processedData.forEach((record, idx) => {
      if (record[field] === null || record[field] === undefined) {
        missingIndices.push(idx)
        stats.missingCount++
      }
    })

    // Interpolate missing values
    missingIndices.forEach((idx) => {
      if (idx === 0) {
        // Use next value
        if (processedData[idx + 1] && processedData[idx + 1][field] !== null) {
          processedData[idx][field] = processedData[idx + 1][field]
          stats.filled++
        }
      } else if (idx === processedData.length - 1) {
        // Use previous value
        if (processedData[idx - 1] && processedData[idx - 1][field] !== null) {
          processedData[idx][field] = processedData[idx - 1][field]
          stats.filled++
        }
      } else {
        // Linear interpolation
        const before = processedData[idx - 1][field]
        const after = processedData[idx + 1][field]
        if (before !== null && after !== null) {
          processedData[idx][field] = (before + after) / 2
          stats.interpolated++
        }
      }
    })
  })

  return { data: processedData, stats }
}

/**
 * Detect and flag outliers using IQR method
 */
export function detectOutliers(data) {
  const stats = {
    outlierCount: 0,
    outliers: [],
  }

  const numericFields = ["lfpr", "employment_rate", "unemployment_rate", "underemployment_rate"]

  numericFields.forEach((field) => {
    const values = data.map((r) => r[field]).filter((v) => v !== null && v !== undefined)

    if (values.length < 4) return

    // Calculate IQR
    const sorted = values.sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    // Find outliers
    data.forEach((record, idx) => {
      const value = record[field]
      if (value !== null && (value < lowerBound || value > upperBound)) {
        stats.outlierCount++
        stats.outliers.push({
          recordIndex: idx,
          field,
          value,
          bounds: { lower: lowerBound, upper: upperBound },
        })
      }
    })
  })

  return stats
}

/**
 * Normalize data using z-score normalization
 */
export function normalizeData(data) {
  const stats = {
    normalized: true,
    fieldStats: {},
  }

  const numericFields = ["lfpr", "employment_rate", "unemployment_rate", "underemployment_rate"]
  const normalizedData = JSON.parse(JSON.stringify(data))

  numericFields.forEach((field) => {
    const values = data.map((r) => r[field]).filter((v) => v !== null && v !== undefined)

    if (values.length === 0) return

    const mean = ss.mean(values)
    const std = ss.standardDeviation(values)

    stats.fieldStats[field] = { mean, std, min: Math.min(...values), max: Math.max(...values) }

    normalizedData.forEach((record) => {
      if (record[field] !== null && record[field] !== undefined) {
        record[`${field}_normalized`] = (record[field] - mean) / (std || 1)
      }
    })
  })

  return { data: normalizedData, stats }
}

/**
 * Engineer features for time series analysis
 */
export function engineerFeatures(data) {
  const stats = {
    featuresCreated: [],
    recordsProcessed: 0,
  }

  const processedData = JSON.parse(JSON.stringify(data))
  const numericFields = ["lfpr", "employment_rate", "unemployment_rate", "underemployment_rate"]

  // Add lag features (1, 2, 4 quarters)
  const lags = [1, 2, 4]
  lags.forEach((lag) => {
    numericFields.forEach((field) => {
      processedData.forEach((record, idx) => {
        if (idx >= lag) {
          record[`${field}_lag${lag}`] = processedData[idx - lag][field]
        }
      })
      stats.featuresCreated.push(`${field}_lag${lag}`)
    })
  })

  // Add moving averages (2, 4 quarters)
  const windows = [2, 4]
  windows.forEach((window) => {
    numericFields.forEach((field) => {
      processedData.forEach((record, idx) => {
        const start = Math.max(0, idx - window + 1)
        const windowValues = processedData.slice(start, idx + 1).map((r) => r[field])
        record[`${field}_ma${window}`] = ss.mean(windowValues)
      })
      stats.featuresCreated.push(`${field}_ma${window}`)
    })
  })

  // Add rate of change (quarter-over-quarter and year-over-year)
  numericFields.forEach((field) => {
    processedData.forEach((record, idx) => {
      // QoQ change
      if (idx >= 1) {
        const current = record[field]
        const previous = processedData[idx - 1][field]
        record[`${field}_qoq_change`] = previous !== 0 ? ((current - previous) / previous) * 100 : 0
      }

      // YoY change (4 quarters)
      if (idx >= 4) {
        const current = record[field]
        const yearAgo = processedData[idx - 4][field]
        record[`${field}_yoy_change`] = yearAgo !== 0 ? ((current - yearAgo) / yearAgo) * 100 : 0
      }
    })
    stats.featuresCreated.push(`${field}_qoq_change`, `${field}_yoy_change`)
  })

  // Add temporal features
  processedData.forEach((record) => {
    const quarter = record.quarter || 1
    const quarterSin = Math.sin((2 * Math.PI * quarter) / 4)
    const quarterCos = Math.cos((2 * Math.PI * quarter) / 4)
    record.quarter_sin = quarterSin
    record.quarter_cos = quarterCos
  })
  stats.featuresCreated.push("quarter_sin", "quarter_cos")

  stats.recordsProcessed = processedData.length

  return { data: processedData, stats }
}
