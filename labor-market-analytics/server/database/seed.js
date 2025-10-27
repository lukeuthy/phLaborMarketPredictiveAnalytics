import pool from "../config/database.js"

async function seedDatabase() {
  try {
    const connection = await pool.getConnection()

    // Sample dataset
    const [datasetResult] = await connection.query(
      `INSERT INTO datasets (name, description, source) 
       VALUES (?, ?, ?)`,
      [
        "Philippine Labor Force Survey 2014-2024",
        "Quarterly labor market indicators from PSA",
        "Philippine Statistics Authority",
      ],
    )

    const datasetId = datasetResult.insertId

    // Sample data points
    const sampleData = [
      { quarter: 1, year: 2024, lfpr: 63.5, employment_rate: 94.2, unemployment_rate: 5.8, underemployment_rate: 8.2 },
      { quarter: 2, year: 2024, lfpr: 63.8, employment_rate: 94.5, unemployment_rate: 5.5, underemployment_rate: 8.0 },
      { quarter: 3, year: 2024, lfpr: 64.1, employment_rate: 94.8, unemployment_rate: 5.2, underemployment_rate: 7.8 },
      { quarter: 4, year: 2023, lfpr: 63.2, employment_rate: 94.0, unemployment_rate: 6.0, underemployment_rate: 8.5 },
    ]

    for (const data of sampleData) {
      await connection.query(
        `INSERT INTO labor_data 
         (dataset_id, quarter, year, lfpr, employment_rate, unemployment_rate, underemployment_rate, sector)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          datasetId,
          data.quarter,
          data.year,
          data.lfpr,
          data.employment_rate,
          data.unemployment_rate,
          data.underemployment_rate,
          "Overall",
        ],
      )
    }

    connection.release()
    console.log("[SEED] Database seeded successfully")
  } catch (error) {
    console.error("[SEED ERROR]", error)
  }
}

seedDatabase()
