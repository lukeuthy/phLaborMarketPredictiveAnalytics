/**
 * PSA Data Converter
 * Converts Philippine Statistics Authority labor data format to normalized CSV
 * Handles the tab-delimited format with missing values represented as "."
 */

function convertPSADataToCSV(pastedData) {
  const lines = pastedData.trim().split("\n")

  // Parse header to identify column structure
  const headerLine = lines[0]
  const headers = headerLine.split("\t")

  // Extract indicator names and build column structure
  const indicators = [
    "Total Population 15 Years Old and Over",
    "Persons in the Labor Force",
    "Employed Persons",
    "Unemployed Persons",
    "Underemployed Persons",
  ]

  const sexCategories = ["Both sexes", "Male", "Female"]

  // Build CSV headers
  const csvHeaders = ["Year", "Month", "Date"]
  indicators.forEach((indicator) => {
    sexCategories.forEach((sex) => {
      csvHeaders.push(`${indicator} - ${sex}`)
    })
  })

  const csvRows = [csvHeaders.join(",")]

  let currentYear = null
  let i = 1 // Skip header line

  while (i < lines.length) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      i++
      continue
    }

    // Check if line is a year marker
    const yearMatch = line.match(/^(\d{4})\s*$/)
    if (yearMatch) {
      currentYear = Number.parseInt(yearMatch[1])
      i++
      continue
    }

    // Parse data rows
    if (currentYear !== null) {
      const parts = line.split("\t").map((p) => p.trim())
      const month = parts[0]

      // Skip if month is empty or just whitespace
      if (!month || month === "") {
        i++
        continue
      }

      // Map month names to numbers
      const monthMap = {
        January: 1,
        February: 2,
        March: 3,
        April: 4,
        May: 5,
        June: 6,
        July: 7,
        August: 8,
        September: 9,
        October: 10,
        November: 11,
        December: 12,
        Annual: 13,
      }

      const monthNum = monthMap[month]
      if (monthNum === undefined) {
        i++
        continue
      }

      // Format date (use first day of month or year-end for annual)
      const day = monthNum === 13 ? 31 : 1
      const month2 = monthNum === 13 ? 12 : monthNum
      const dateStr = `${currentYear}-${String(month2).padStart(2, "0")}-${String(day).padStart(2, "0")}`

      // Build row
      const row = [currentYear, monthNum, dateStr]

      // Extract all values (columns 1 onwards are data)
      for (let j = 1; j < parts.length; j++) {
        const value = parts[j]
        // Convert "." to empty string, keep numeric values
        row.push(value === "." ? "" : value)
      }

      // Only add row if it has actual data values
      const hasData = row.slice(3).some((v) => v !== "" && v !== null)
      if (hasData && row.length === csvHeaders.length) {
        csvRows.push(
          row
            .map((cell) => {
              // Escape quotes in values
              if (typeof cell === "string" && cell.includes(",")) {
                return `"${cell.replace(/"/g, '""')}"`
              }
              return cell
            })
            .join(","),
        )
      }
    }

    i++
  }

  return csvRows.join("\n")
}

/**
 * Fill missing monthly values using linear interpolation
 */
function fillMissingValues(csvContent) {
  const lines = csvContent.split("\n")
  const headers = lines[0].split(",")
  const rows = lines.slice(1).map((line) => {
    const cells = []
    let inQuotes = false
    let currentCell = ""

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        cells.push(currentCell.trim())
        currentCell = ""
      } else {
        currentCell += char
      }
    }
    cells.push(currentCell.trim())
    return cells
  })

  // Interpolate missing values for each indicator
  const dataStartCol = 3 // Start after Year, Month, Date

  for (let col = dataStartCol; col < headers.length; col++) {
    for (let row = 0; row < rows.length; row++) {
      if (rows[row][col] === "" || rows[row][col] === null) {
        // Find previous and next non-empty values
        let prevRow = row - 1
        let nextRow = row + 1

        while (prevRow >= 0 && (rows[prevRow][col] === "" || rows[prevRow][col] === null)) {
          prevRow--
        }
        while (nextRow < rows.length && (rows[nextRow][col] === "" || rows[nextRow][col] === null)) {
          nextRow++
        }

        if (prevRow >= 0 && nextRow < rows.length) {
          // Linear interpolation
          const prevVal = Number.parseFloat(rows[prevRow][col])
          const nextVal = Number.parseFloat(rows[nextRow][col])
          const steps = nextRow - prevRow
          const step = (nextVal - prevVal) / steps
          rows[row][col] = (prevVal + step * (row - prevRow)).toFixed(0)
        }
      }
    }
  }

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}

module.exports = {
  convertPSADataToCSV,
  fillMissingValues,
}
