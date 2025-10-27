/**
 * Data Preprocessor Service
 * Preprocessing utilities for time series analysis
 */

class DataPreprocessor {
  constructor(data) {
    this.data = JSON.parse(JSON.stringify(data)) // Deep copy
  }

  /**
   * Create temporal features
   * @returns {Array} Data with temporal features
   */
  createTemporalFeatures() {
    console.log("[DataPreprocessor] Creating temporal features")

    return this.data.map((record) => {
      const date = new Date(record.Date)
      const year = date.getFullYear()
      const month = date.getMonth() + 1
      const quarterNum = Math.ceil(month / 3)

      // Cyclical features for seasonality
      const quarterSin = Math.sin((2 * Math.PI * quarterNum) / 4)
      const quarterCos = Math.cos((2 * Math.PI * quarterNum) / 4)

      return {
        ...record,
        Year: year,
        QuarterNum: quarterNum,
        Month: month,
        Quarter_sin: quarterSin,
        Quarter_cos: quarterCos,
      }
    })
  }

  /**
   * Add lagged features
   * @param {Array} indicators - Indicator names
   * @param {Array} lags - Lag periods
   * @returns {Array} Data with lagged features
   */
  addLagFeatures(indicators, lags) {
    console.log(`[DataPreprocessor] Adding lag features: ${lags.join(", ")}`)

    let data = JSON.parse(JSON.stringify(this.data))

    indicators.forEach((indicator) => {
      lags.forEach((lag) => {
        data = data.map((record, idx) => {
          const lagValue = idx >= lag ? data[idx - lag][indicator] : null
          return {
            ...record,
            [`${indicator}_lag${lag}`]: lagValue,
          }
        })
      })
    })

    return data
  }

  /**
   * Add moving averages
   * @param {Array} indicators - Indicator names
   * @param {Array} windows - Window sizes
   * @returns {Array} Data with moving averages
   */
  addMovingAverages(indicators, windows) {
    console.log(`[DataPreprocessor] Adding moving averages: ${windows.join(", ")}`)

    let data = JSON.parse(JSON.stringify(this.data))

    indicators.forEach((indicator) => {
      windows.forEach((window) => {
        data = data.map((record, idx) => {
          let sum = 0
          let count = 0
          for (let i = Math.max(0, idx - window + 1); i <= idx; i++) {
            sum += data[i][indicator]
            count++
          }
          return {
            ...record,
            [`${indicator}_ma${window}`]: count > 0 ? sum / count : null,
          }
        })
      })
    })

    return data
  }

  /**
   * Add rate of change features
   * @param {Array} indicators - Indicator names
   * @param {Array} periods - Periods for change calculation
   * @returns {Array} Data with rate of change
   */
  addRateOfChange(indicators, periods = [1, 4]) {
    console.log(`[DataPreprocessor] Adding rate of change: ${periods.join(", ")}`)

    let data = JSON.parse(JSON.stringify(this.data))

    indicators.forEach((indicator) => {
      periods.forEach((period) => {
        data = data.map((record, idx) => {
          if (idx < period) {
            return { ...record, [`${indicator}_change${period}`]: null }
          }
          const current = data[idx][indicator]
          const previous = data[idx - period][indicator]
          const change = ((current - previous) / previous) * 100
          return {
            ...record,
            [`${indicator}_change${period}`]: change,
          }
        })
      })
    })

    return data
  }

  /**
   * Normalize indicators
   * @param {Array} indicators - Indicator names
   * @param {string} method - 'zscore' or 'minmax'
   * @returns {Array} Data with normalized indicators
   */
  normalizeIndicators(indicators, method = "zscore") {
    console.log(`[DataPreprocessor] Normalizing using ${method}`)

    let data = JSON.parse(JSON.stringify(this.data))

    indicators.forEach((indicator) => {
      const values = this.data.map((r) => r[indicator])

      if (method === "zscore") {
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
        const std = Math.sqrt(variance)

        data = data.map((record) => ({
          ...record,
          [`${indicator}_norm`]: (record[indicator] - mean) / std,
        }))
      } else if (method === "minmax") {
        const min = Math.min(...values)
        const max = Math.max(...values)

        data = data.map((record) => ({
          ...record,
          [`${indicator}_norm`]: (record[indicator] - min) / (max - min),
        }))
      }
    })

    return data
  }

  /**
   * Prepare comprehensive feature set for modeling
   * @param {string} targetIndicator - Target indicator
   * @param {Object} options - Configuration options
   * @returns {Array} Data ready for modeling
   */
  prepareForModeling(targetIndicator, options = {}) {
    const {
      includeLags = true,
      includeMA = true,
      includeRateOfChange = true,
      includeNormalization = true,
      includeTemporalFeatures = true,
    } = options

    console.log(`[DataPreprocessor] Preparing data for modeling: ${targetIndicator}`)

    let data = JSON.parse(JSON.stringify(this.data))

    if (includeTemporalFeatures) {
      data = this.createTemporalFeatures()
    }

    if (includeLags) {
      data = this.addLagFeatures([targetIndicator], [1, 2, 4])
    }

    if (includeMA) {
      data = this.addMovingAverages([targetIndicator], [2, 4])
    }

    if (includeRateOfChange) {
      data = this.addRateOfChange([targetIndicator], [1, 4])
    }

    if (includeNormalization) {
      data = this.normalizeIndicators([targetIndicator], "zscore")
    }

    // Remove rows with null values
    data = data.filter((record) => Object.values(record).every((v) => v !== null && v !== undefined))

    console.log(`[DataPreprocessor] Prepared dataset shape: ${data.length} records`)

    return data
  }
}

module.exports = DataPreprocessor
