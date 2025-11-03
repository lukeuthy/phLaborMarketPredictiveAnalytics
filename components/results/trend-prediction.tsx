"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TrendData {
  period: string
  value: number
  trend?: number
}

export function TrendPrediction({ data }: { data: TrendData[] }) {
  const analysis = useMemo(() => {
    if (!data || data.length < 2) return null

    const values = data.map((d) => (typeof d.value === "number" ? d.value : 0)).filter((v) => !isNaN(v))
    if (values.length < 2) return null

    const n = values.length
    const xMean = (n - 1) / 2
    const yMean = values.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denominator = 0

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean)
      denominator += (i - xMean) ** 2
    }

    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = yMean - slope * xMean

    // Calculate growth rate
    const firstValue = values[0]
    const lastValue = values[n - 1]
    const growthRate = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0

    // Generate forecasts for next 12 periods
    const forecasts = Array.from({ length: 12 }, (_, i) => ({
      period: `+${i + 1}M`,
      forecast: Math.max(0, intercept + slope * (n + i)),
    }))

    // Calculate volatility
    const variance = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / n
    const volatility = Math.sqrt(variance)

    // Trend direction
    const recentTrend = values.slice(-6).reduce((a, b) => a + b, 0) / Math.min(6, values.length)
    const olderTrend =
      values.slice(-12, -6).length > 0
        ? values.slice(-12, -6).reduce((a, b) => a + b, 0) / Math.min(6, values.slice(-12, -6).length)
        : yMean

    const trendDirection = recentTrend > olderTrend ? "increasing" : recentTrend < olderTrend ? "decreasing" : "stable"

    return {
      slope,
      growthRate,
      forecasts,
      volatility,
      trendDirection,
      averageValue: yMean,
      coefficient: yMean !== 0 ? (slope / yMean) * 100 : 0,
    }
  }, [data])

  if (!analysis) {
    return (
      <Card className="card">
        <p className="text-foreground">Insufficient data for trend analysis</p>
      </Card>
    )
  }

  const trendColor =
    analysis.trendDirection === "increasing"
      ? "text-green-500"
      : analysis.trendDirection === "decreasing"
        ? "text-red-500"
        : "text-yellow-500"

  const TrendIcon =
    analysis.trendDirection === "increasing"
      ? TrendingUp
      : analysis.trendDirection === "decreasing"
        ? TrendingDown
        : Minus

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-light rounded-lg p-4">
          <p className="text-text-muted text-sm mb-2">Trend Direction</p>
          <div className={`flex items-center gap-2 ${trendColor}`}>
            <TrendIcon className="w-6 h-6" />
            <span className="text-xl font-bold capitalize">{analysis.trendDirection}</span>
          </div>
        </div>

        <div className="bg-surface-light rounded-lg p-4">
          <p className="text-text-muted text-sm mb-2">Growth Rate</p>
          <div className={analysis.growthRate > 0 ? "text-green-500" : "text-red-500"}>
            <span className="text-xl font-bold">{analysis.growthRate.toFixed(2)}%</span>
            <p className="text-xs text-text-muted">Over period</p>
          </div>
        </div>

        <div className="bg-surface-light rounded-lg p-4">
          <p className="text-text-muted text-sm mb-2">Average Value</p>
          <span className="text-xl font-bold text-foreground">
            {analysis.averageValue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-surface-light rounded-lg p-4">
          <p className="text-text-muted text-sm mb-2">Volatility</p>
          <span className="text-xl font-bold text-foreground">{analysis.volatility.toFixed(2)}</span>
          <p className="text-xs text-text-muted">Std. deviation</p>
        </div>
      </div>

      {/* Historical Trend */}
      <Card className="card">
        <CardHeader>
          <CardTitle>Historical Trend Line</CardTitle>
          <CardDescription>Actual data with regression line showing underlying trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="period" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) =>
                  typeof value === "number" ? value.toLocaleString("en-PH", { maximumFractionDigits: 0 }) : value
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-chart-1)"
                name="Actual Values"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="linear"
                dataKey="trend"
                stroke="var(--color-error)"
                name="Trend Line"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 12-Month Forecast */}
      <Card className="card">
        <CardHeader>
          <CardTitle>12-Month Forecast</CardTitle>
          <CardDescription>Projected values based on historical trend (Linear Regression)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analysis.forecasts}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="period" stroke="var(--color-text-muted)" />
              <YAxis stroke="var(--color-text-muted)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) =>
                  typeof value === "number" ? value.toLocaleString("en-PH", { maximumFractionDigits: 0 }) : value
                }
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="var(--color-accent)"
                fill="url(#colorForecast)"
                name="Forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Interpretation */}
      <Card className="card">
        <CardHeader>
          <CardTitle>Forecast Interpretation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-text-muted">Slope (Rate of Change)</p>
              <p className="text-lg font-semibold text-foreground">{analysis.slope.toFixed(2)} units/period</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Normalized Coefficient</p>
              <p className="text-lg font-semibold text-foreground">{analysis.coefficient.toFixed(4)}%</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-text-muted font-semibold mb-3">Key Insights:</p>
            <ul className="text-sm space-y-2 text-foreground">
              <li>
                • The data shows a <strong>{analysis.trendDirection}</strong> trend
              </li>
              <li>
                • Overall growth rate of <strong>{analysis.growthRate.toFixed(2)}%</strong> from start to end of period
              </li>
              <li>
                • Average value of{" "}
                <strong>{analysis.averageValue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}</strong> across
                all periods
              </li>
              <li>
                • Based on the current trajectory, next year is expected to show{" "}
                {analysis.trendDirection === "increasing"
                  ? "growth"
                  : analysis.trendDirection === "decreasing"
                    ? "decline"
                    : "stability"}
              </li>
              <li>
                • Volatility of <strong>{analysis.volatility.toFixed(0)}</strong> indicates{" "}
                {analysis.volatility > 1000 ? "high" : "low"} variability
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
