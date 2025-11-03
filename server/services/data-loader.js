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
    this.format = null // 'psa' or 'legacy'
  }

  /**
   * Load data from CSV file - supports both legacy and PSA formats
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
      })

      if (records.length === 0) {
        throw new Error("CSV file is empty")
      }

      const detectedFormat = this.detectFormat(records[0])
      this.format = detectedFormat

      let processedData
      if (detectedFormat === "psa") {
        processedData = this.processPSAData(records)
      } else {
        processedData = this.processLegacyData(records)
      }

      // Sort by date
      processedData.sort((a, b) => new Date(a.Date) - new Date(b.Date))

      // Store metadata
      this.metadata = {
        filePath,
        format: detectedFormat,
        nRecords: processedData.length,
        startDate: processedData[0]?.Date,
        endDate: processedData[processedData.length - 1]?.Date,
        columns: Object.keys(processedData[0] || {}),
        indicators: this.extractIndicators(processedData[0]),
      }

      this.data = processedData
      console.log(`[DataLoader] Successfully loaded ${processedData.length} records (${detectedFormat} format)`)

      return processedData
    } catch (error) {
      console.error(`[DataLoader] Error loading data: ${error.message}`)
      throw error
    }
  }

  /**
   * Detect data format from headers
   * @private
   */
  detectFormat(firstRecord) {
    const keys = Object.keys(firstRecord)

    // Check for PSA format (contains employment indicators)
    if (keys.some((k) => k.includes("Employed Persons") || k.includes("Labor Force"))) {
      return "psa"
    }

    // Check for legacy format (contains Quarter or rate indicators)
    if (keys.includes("Quarter") || keys.some((k) => k.includes("LFPR") || k.includes("UR"))) {
      return "legacy"
    }

    throw new Error("Unknown data format. Expected PSA or legacy format.")
  }

  /**
   * Process PSA format data
   * @private
   */
  processPSAData(records) {
    return records.map((record) => {
      const processed = {
        Date: record.Date || this.monthYearToDate(record.Year, record.Month),
        Year: Number.parseInt(record.Year),
        Month: Number.parseInt(record.Month),
      }

      const laborForce = this.extractNumeric(record, "Persons in the Labor Force - Both sexes")
      const employed = this.extractNumeric(record, "Employed Persons - Both sexes")
      const unemployed = this.extractNumeric(record, "Unemployed Persons - Both sexes")
      const population = this.extractNumeric(record, "Total Population 15 Years Old and Over - Both sexes")

      // Calculate rates
      if (laborForce > 0) {
        processed.ER = (employed / laborForce) * 100 // Employment Rate
        processed.UR = (unemployed / laborForce) * 100 // Unemployment Rate
      }
      if (population > 0) {
        processed.LFPR = (laborForce / population) * 100 // Labor Force Participation Rate
      }

      // Store raw values for detailed analysis
      processed.TotalPopulation = population
      processed.LaborForce = laborForce
      processed.Employed = employed
      processed.Unemployed = unemployed
      processed.Underemployed = this.extractNumeric(record, "Underemployed Persons - Both sexes")

      // Sex-based breakdown
      processed.EmployedMale = this.extractNumeric(record, "Employed Persons - Male")
      processed.EmployedFemale = this.extractNumeric(record, "Employed Persons - Female")

      return processed
    })
  }

  /**
   * Process legacy format data
   * @private
   */
  processLegacyData(records) {
    return records.map((record) => {
      const processed = {
        ...record,
        Date: this.quarterToDate(record.Quarter),
      }

      // Cast numeric values
      ;["LFPR", "ER", "UR", "UER"].forEach((col) => {
        if (col in processed) {
          processed[col] = Number.parseFloat(processed[col])
        }
      })

      return processed
    })
  }

  /**
   * Extract numeric value from record
   * @private
   */
  extractNumeric(record, key) {
    const value = record[key]
    if (!value || value === "" || value === ".") return 0
    const num = Number.parseFloat(value)
    return isNaN(num) ? 0 : num
  }

  /**
   * Convert Month and Year to ISO date
   * @private
   */
  monthYearToDate(year, month) {
    const y = Number.parseInt(year)
    const m = Number.parseInt(month)
    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      throw new Error(`Invalid date: Year ${year}, Month ${month}`)
    }
    return new Date(y, m - 1, 1).toISOString().split("T")[0]
  }

  /**
   * Convert quarter string to date
   * @private
   */
  quarterToDate(quarter) {
    const [year, q] = quarter.split(" Q")
    const month = (Number.parseInt(q) - 1) * 3
    return new Date(Number.parseInt(year), month, 1).toISOString().split("T")[0]
  }

  /**
   * Extract available indicators from data
   * @private
   */
  extractIndicators(record) {
    return Object.keys(record).filter((key) =>
      ["ER", "UR", "LFPR", "UER", "Employed", "Unemployed", "LaborForce"].includes(key),
    )
  }

  /**
   * Get data for specific indicator
   * @param {string} indicator - Indicator name
   * @returns {Array} Indicator values
   */
  getIndicatorData(indicator) {
    if (!this.data) throw new Error("No data loaded")
    return this.data.map((record) => record[indicator]).filter((v) => v !== null && v !== undefined)
  }

  /**
   * Get summary statistics for available indicators
   * @returns {Object} Statistics for each indicator
   */
  getSummaryStatistics() {
    if (!this.data) throw new Error("No data loaded")

    const indicators = this.metadata.indicators || ["ER", "UR", "LFPR", "UER"]
    const stats = {}

    indicators.forEach((indicator) => {
      const values = this.getIndicatorData(indicator)
      if (values.length === 0) return

      values.sort((a, b) => a - b)

      stats[indicator] = {
        count: values.length,
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
