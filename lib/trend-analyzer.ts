export interface TrendAnalysisResult {
  slope: number
  intercept: number
  rSquared: number
  growthRate: number
  trendDirection: "increasing" | "decreasing" | "stable"
  volatility: number
  forecasts: Array<{ period: string; value: number }>
}

export function analyzeTimeSeries(data: number[]): TrendAnalysisResult {
  if (data.length < 2) throw new Error("Need at least 2 data points")

  const n = data.length
  const x = Array.from({ length: n }, (_, i) => i)
  const xMean = x.reduce((a, b) => a + b) / n
  const yMean = data.reduce((a, b) => a + b) / n

  // Linear regression
  let numerator = 0
  let denominator = 0
  let ssRes = 0
  let ssTot = 0

  let slope = 0 // Initialize slope before using it

  for (let i = 0; i < n; i++) {
    const predicted = slope * (x[i] - xMean) + yMean
    numerator += (x[i] - xMean) * (data[i] - yMean)
    denominator += Math.pow(x[i] - xMean, 2)
    ssRes += Math.pow(data[i] - predicted, 2)
    ssTot += Math.pow(data[i] - yMean, 2)
  }

  slope = denominator !== 0 ? numerator / denominator : 0
  const intercept = yMean - slope * xMean
  const rSquared = ssTot !== 0 ? 1 - ssRes / ssTot : 0

  // Growth rate
  const growthRate = ((data[n - 1] - data[0]) / data[0]) * 100

  // Trend direction
  const recentHalf = data.slice(Math.floor(n / 2)).reduce((a, b) => a + b) / Math.ceil(n / 2)
  const earlierHalf = data.slice(0, Math.floor(n / 2)).reduce((a, b) => a + b) / Math.floor(n / 2)
  const trendDirection = recentHalf > earlierHalf ? "increasing" : recentHalf < earlierHalf ? "decreasing" : "stable"

  // Volatility
  const variance = data.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / n
  const volatility = Math.sqrt(variance)

  // Generate 12-month forecast
  const forecasts = Array.from({ length: 12 }, (_, i) => ({
    period: `Month ${i + 1}`,
    value: intercept + slope * (n + i),
  }))

  return {
    slope,
    intercept,
    rSquared,
    growthRate,
    trendDirection,
    volatility,
    forecasts,
  }
}

export function detectSeasonality(data: number[], periodLength = 12): number {
  if (data.length < periodLength * 2) return 0

  let correlation = 0
  const n = data.length - periodLength

  for (let i = 0; i < n; i++) {
    correlation += data[i] * data[i + periodLength]
  }

  return Math.min(1, Math.max(-1, correlation / (n * Math.sqrt(data.reduce((a, b) => a + b * b)))))
}

export function forecastNextPeriod(data: number[], periods = 12): number[] {
  const result = analyzeTimeSeries(data)
  return result.forecasts.slice(0, periods).map((f) => f.value)
}
