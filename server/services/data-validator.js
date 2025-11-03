/**
 * Data Validator Service
 * Validates data quality and integrity
 */

class DataValidator {
  constructor(data) {
    this.data = data
    this.validationResults = {}
  }

  /**
   * Run all validation checks
   * @returns {Object} Validation results
   */
  validateAll() {
    console.log("[DataValidator] Running validation checks")

    const results = {
      missingValues: this.checkMissingValues(),
      dataRanges: this.checkDataRanges(),
      temporalContinuity: this.checkTemporalContinuity(),
      outliers: this.detectOutliers(),
      consistency: this.checkConsistency(),
      overallValid: true,
    }

    results.overallValid =
      !results.missingValues.hasMissing && results.dataRanges.allValid && results.temporalContinuity.isContinuous

    this.validationResults = results
    return results
  }

  /**
   * Check for missing values
   * @returns {Object} Missing value information
   */
  checkMissingValues() {
    const indicators = ["LFPR", "ER", "UR", "UER"]
    const counts = {}
    let totalMissing = 0

    indicators.forEach((indicator) => {
      const missing = this.data.filter((record) => record[indicator] === null || record[indicator] === undefined).length
      counts[indicator] = missing
      totalMissing += missing
    })

    return {
      hasMissing: totalMissing > 0,
      counts,
      totalMissing,
    }
  }

  /**
   * Check if data values are within valid ranges
   * @returns {Object} Range validation results
   */
  checkDataRanges() {
    const indicators = ["LFPR", "ER", "UR", "UER"]
    const results = {}
    let allValid = true

    indicators.forEach((indicator) => {
      const values = this.data.map((r) => r[indicator]).filter((v) => v !== null && v !== undefined)

      const min = Math.min(...values)
      const max = Math.max(...values)
      const valid = min >= 0 && max <= 100

      results[indicator] = { valid, min, max }
      if (!valid) allValid = false
    })

    return { allValid, indicators: results }
  }

  /**
   * Check for gaps in time series
   * @returns {Object} Temporal continuity information
   */
  checkTemporalContinuity() {
    const dates = this.data.map((r) => new Date(r.Date))
    const gaps = []

    for (let i = 1; i < dates.length; i++) {
      const daysDiff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)
      if (daysDiff > 135) {
        // More than 4.5 months
        gaps.push({
          index: i,
          quarter: this.data[i].Quarter,
          daysSinceLastRecord: daysDiff,
        })
      }
    }

    return {
      isContinuous: gaps.length === 0,
      gapsFound: gaps.length,
      gaps,
    }
  }

  /**
   * Detect outliers using IQR method
   * @returns {Object} Outlier information
   */
  detectOutliers() {
    const indicators = ["LFPR", "ER", "UR", "UER"]
    const results = {}

    indicators.forEach((indicator) => {
      const values = this.data
        .map((r) => r[indicator])
        .filter((v) => v !== null && v !== undefined)
        .sort((a, b) => a - b)

      const q1 = values[Math.floor(values.length * 0.25)]
      const q3 = values[Math.floor(values.length * 0.75)]
      const iqr = q3 - q1
      const lowerBound = q1 - 1.5 * iqr
      const upperBound = q3 + 1.5 * iqr

      const outliers = this.data
        .map((record, idx) => ({ record, idx }))
        .filter(({ record }) => record[indicator] < lowerBound || record[indicator] > upperBound)

      results[indicator] = {
        count: outliers.length,
        percentage: (outliers.length / this.data.length) * 100,
        outliers: outliers.map(({ record, idx }) => ({
          quarter: record.Quarter,
          value: record[indicator],
          index: idx,
        })),
      }
    })

    return results
  }

  /**
   * Check mathematical consistency
   * @returns {Object} Consistency check results
   */
  checkConsistency() {
    const inconsistent = []
    const tolerance = 2.0

    this.data.forEach((record, idx) => {
      const sum = record.ER + record.UR
      if (Math.abs(sum - 100) > tolerance) {
        inconsistent.push({
          index: idx,
          quarter: record.Quarter,
          erUrSum: sum,
          difference: Math.abs(sum - 100),
        })
      }
    })

    return {
      erUrConsistent: inconsistent.length === 0,
      inconsistentCount: inconsistent.length,
      inconsistencies: inconsistent,
    }
  }

  /**
   * Generate validation report
   * @returns {string} Formatted report
   */
  getValidationReport() {
    if (Object.keys(this.validationResults).length === 0) {
      this.validateAll()
    }

    const r = this.validationResults
    const lines = [
      "=".repeat(60),
      "DATA VALIDATION REPORT",
      "=".repeat(60),
      "",
      `Missing Values: ${r.missingValues.hasMissing ? `✗ ${r.missingValues.totalMissing} found` : "✓ None"}`,
      `Data Ranges: ${r.dataRanges.allValid ? "✓ All valid" : "✗ Invalid values found"}`,
      `Temporal Continuity: ${r.temporalContinuity.isContinuous ? "✓ Continuous" : `✗ ${r.temporalContinuity.gapsFound} gaps found`}`,
      "",
      "Outliers Detected:",
      ...Object.entries(r.outliers).map(([ind, info]) => `  ${ind}: ${info.count} (${info.percentage.toFixed(1)}%)`),
      "",
      `Consistency Check: ${r.consistency.erUrConsistent ? "✓ Passed" : "✗ Failed"}`,
      "",
      "=".repeat(60),
      `Overall Status: ${r.overallValid ? "✓ VALID" : "✗ ISSUES FOUND"}`,
      "=".repeat(60),
    ]

    return lines.join("\n")
  }
}

module.exports = DataValidator
