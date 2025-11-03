import ss from "simple-statistics"

export function calculateStatistics(data) {
  const lfprValues = data.map((d) => d.lfpr)
  const employmentValues = data.map((d) => d.employment_rate)
  const unemploymentValues = data.map((d) => d.unemployment_rate)

  return {
    lfpr: {
      mean: ss.mean(lfprValues),
      median: ss.median(lfprValues),
      stdDev: ss.standardDeviation(lfprValues),
      min: Math.min(...lfprValues),
      max: Math.max(...lfprValues),
    },
    employment: {
      mean: ss.mean(employmentValues),
      median: ss.median(employmentValues),
      stdDev: ss.standardDeviation(employmentValues),
      min: Math.min(...employmentValues),
      max: Math.max(...employmentValues),
    },
    unemployment: {
      mean: ss.mean(unemploymentValues),
      median: ss.median(unemploymentValues),
      stdDev: ss.standardDeviation(unemploymentValues),
      min: Math.min(...unemploymentValues),
      max: Math.max(...unemploymentValues),
    },
  }
}

export function generateForecasts(data) {
  const lastQuarters = data.slice(-4)
  const lfprTrend = lastQuarters.map((d) => d.lfpr)

  // Simple linear extrapolation
  const slope = (lfprTrend[3] - lfprTrend[0]) / 3
  const forecasts = []

  for (let i = 1; i <= 4; i++) {
    forecasts.push({
      quarter: `Q${i}`,
      forecast: lfprTrend[3] + slope * i,
      confidence: 0.95 - i * 0.05,
    })
  }

  return forecasts
}
