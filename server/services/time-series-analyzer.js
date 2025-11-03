/**
 * Time Series Analyzer Service
 * Performs time series analysis and decomposition
 */

class TimeSeriesAnalyzer {
  constructor(data) {
    this.data = data
    this.decompositionResults = {}
  }

  /**
   * Simple additive decomposition
   * @param {string} indicator - Indicator name
   * @param {number} period - Seasonal period (4 for quarterly)
   * @returns {Object} Decomposition components
   */
  decompose(indicator, period = 4) {
    console.log(`[TimeSeriesAnalyzer] Decomposing ${indicator}`)

    const series = this.data.map((r) => r[indicator])

    // Calculate trend using moving average
    const trend = this.calculateMovingAverage(series, period)

    // Calculate detrended series
    const detrended = series.map((val, idx) => val - (trend[idx] || 0))

    // Calculate seasonal component (average of each season)
    const seasonal = new Array(series.length)
    for (let i = 0; i < period; i++) {
      const seasonalValues = []
      for (let j = i; j < series.length; j += period) {
        seasonalValues.push(detrended[j])
      }
      const avgSeasonal = seasonalValues.reduce((a, b) => a + b, 0) / seasonalValues.length
      for (let j = i; j < series.length; j += period) {
        seasonal[j] = avgSeasonal
      }
    }

    // Calculate residual
    const residual = series.map((val, idx) => val - (trend[idx] || 0) - seasonal[idx])

    const result = {
      trend,
      seasonal,
      residual,
      observed: series,
      model: "additive",
    }

    this.decompositionResults[indicator] = result
    return result
  }

  /**
   * Test stationarity using simple methods
   * @param {string} indicator - Indicator name
   * @returns {Object} Stationarity test results
   */
  testStationarity(indicator) {
    console.log(`[TimeSeriesAnalyzer] Testing stationarity for ${indicator}`)

    const series = this.data.map((r) => r[indicator])

    // Calculate mean and variance for first and second half
    const mid = Math.floor(series.length / 2)
    const firstHalf = series.slice(0, mid)
    const secondHalf = series.slice(mid)

    const mean1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const mean2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    const var1 = this.calculateVariance(firstHalf, mean1)
    const var2 = this.calculateVariance(secondHalf, mean2)

    // Simple stationarity check: means and variances should be similar
    const meanDiff = Math.abs(mean1 - mean2)
    const varRatio = Math.max(var1, var2) / Math.min(var1, var2)

    return {
      mean1: mean1.toFixed(4),
      mean2: mean2.toFixed(4),
      meanDifference: meanDiff.toFixed(4),
      variance1: var1.toFixed(4),
      variance2: var2.toFixed(4),
      varianceRatio: varRatio.toFixed(4),
      isStationary: meanDiff < 2 && varRatio < 2,
      conclusion: meanDiff < 2 && varRatio < 2 ? "Likely stationary" : "Likely non-stationary",
    }
  }

  /**
   * Calculate moving average
   * @private
   */
  calculateMovingAverage(series, window) {
    return series.map((_, idx) => {
      const start = Math.max(0, idx - Math.floor(window / 2))
      const end = Math.min(series.length, idx + Math.ceil(window / 2))
      const subset = series.slice(start, end)
      return subset.reduce((a, b) => a + b, 0) / subset.length
    })
  }

  /**
   * Calculate variance
   * @private
   */
  calculateVariance(values, mean) {
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  /**
   * Detect trend
   * @param {string} indicator - Indicator name
   * @returns {Array} Trend values
   */
  detectTrend(indicator) {
    const series = this.data.map((r) => r[indicator])
    return this.calculateMovingAverage(series, 4)
  }

  /**
   * Calculate growth rate
   * @param {string} indicator - Indicator name
   * @param {number} periods - Number of periods
   * @returns {Array} Growth rates
   */
  calculateGrowthRate(indicator, periods = 1) {
    const series = this.data.map((r) => r[indicator])
    return series.map((val, idx) =>
      idx >= periods ? ((val - series[idx - periods]) / series[idx - periods]) * 100 : null,
    )
  }

  /**
   * Calculate volatility
   * @param {string} indicator - Indicator name
   * @param {number} window - Rolling window
   * @returns {Array} Volatility values
   */
  calculateVolatility(indicator, window = 4) {
    const series = this.data.map((r) => r[indicator])
    return series.map((_, idx) => {
      const start = Math.max(0, idx - window + 1)
      const subset = series.slice(start, idx + 1)
      const mean = subset.reduce((a, b) => a + b, 0) / subset.length
      const variance = subset.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / subset.length
      return Math.sqrt(variance)
    })
  }

  /**
   * Identify turning points (peaks and troughs)
   * @param {string} indicator - Indicator name
   * @returns {Object} Peaks and troughs
   */
  identifyTurningPoints(indicator) {
    const series = this.data.map((r) => r[indicator])
    const peaks = []
    const troughs = []

    for (let i = 1; i < series.length - 1; i++) {
      if (series[i] > series[i - 1] && series[i] > series[i + 1]) {
        peaks.push({
          index: i,
          quarter: this.data[i].Quarter,
          value: series[i],
        })
      }
      if (series[i] < series[i - 1] && series[i] < series[i + 1]) {
        troughs.push({
          index: i,
          quarter: this.data[i].Quarter,
          value: series[i],
        })
      }
    }

    return { peaks, troughs }
  }

  /**
   * Get seasonal pattern
   * @param {string} indicator - Indicator name
   * @returns {Array} Seasonal pattern
   */
  getSeasonalPattern(indicator) {
    if (!this.decompositionResults[indicator]) {
      this.decompose(indicator)
    }
    return this.decompositionResults[indicator].seasonal.slice(0, 4)
  }
}

module.exports = TimeSeriesAnalyzer
