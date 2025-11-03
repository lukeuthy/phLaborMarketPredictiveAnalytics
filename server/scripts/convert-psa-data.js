/**
 * Convert PSA pasted data to CSV
 * Usage: node server/scripts/convert-psa-data.js
 */

const fs = require("fs")
const path = require("path")
const { convertPSADataToCSV, fillMissingValues } = require("../utils/psa-data-converter")

// Sample data provided by user
const sampleData = `Total Population 15 Years Old and Over	Persons in the Labor Force	Employed Persons	Unemployed Persons	Underemployed Persons
Both sexes	Male	Female	Both sexes	Male	Female	Both sexes	Male	Female	Both sexes	Male	Female	Both sexes	Male	Female
[paste your data here]`

function main() {
  console.log("PSA Labor Data Converter\n")
  console.log("This script converts Philippine Statistics Authority labor data")
  console.log("from tab-delimited format to normalized CSV.\n")

  // For demonstration, show expected format
  console.log("Expected input format:")
  console.log("- Tab-delimited data with headers")
  console.log('- Year markers (e.g., "2014")')
  console.log("- Monthly data rows")
  console.log('- Missing values represented as "."')
  console.log("")
  console.log("To use this converter:")
  console.log("1. Copy your PSA data from the source")
  console.log("2. Create a file: data/raw/psa-labor-data.txt")
  console.log("3. Paste the data into that file")
  console.log("4. Run: node server/scripts/convert-psa-data.js\n")

  const inputFile = path.join(__dirname, "../../data/raw/psa-labor-data.txt")
  const outputFile = path.join(__dirname, "../../data/raw/labor-market-data.csv")

  if (fs.existsSync(inputFile)) {
    try {
      const data = fs.readFileSync(inputFile, "utf8")
      console.log("Converting data...")
      let csv = convertPSADataToCSV(data)

      console.log("Filling missing values...")
      csv = fillMissingValues(csv)

      fs.writeFileSync(outputFile, csv, "utf8")

      const lines = csv.split("\n")
      console.log(`\n✓ Success! Created ${outputFile}`)
      console.log(`  Total records: ${lines.length - 1}`)
      console.log(`  Date range: 2014-2024`)
      console.log(`  File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`)
    } catch (error) {
      console.error("✗ Error converting data:", error.message)
      process.exit(1)
    }
  } else {
    console.log("✗ Input file not found: " + inputFile)
    console.log("\nSteps to convert your data:")
    console.log("1. Create the directory: mkdir -p data/raw")
    console.log("2. Create file: data/raw/psa-labor-data.txt")
    console.log("3. Paste the PSA data into the file")
    console.log("4. Run: node server/scripts/convert-psa-data.js")
  }
}

main()
