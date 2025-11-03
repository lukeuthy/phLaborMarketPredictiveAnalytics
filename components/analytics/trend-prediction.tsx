"use client"

import { useState, useMemo } from "react"
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
  trend: number
  forecast?: number
}

export default function TrendPrediction({ data }: { data: TrendData[] }) {
  const [selectedIndicator, setSelectedIndicator] = useState("Employed Persons")

  const analysis = useMemo(() => {
    if (!data || data.length < 2) return null

    const values = data.map((d) => d.value)
    const n = values.length

    // Calculate simple linear regression for trend
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
      forecast: intercept + slope * (n + i),
    }))

    // Calculate volatility (standard deviation)
    const variance = values.reduce((sum, val) => sum + Math.pow(val - yMean, 2), 0) / n
    const volatility = Math.sqrt(variance)

    // Trend direction
    const recentTrend = values.slice(-6).reduce((a, b) => a + b, 0) / 6
    const olderTrend = values.slice(-12, -6).reduce((a, b) => a + b, 0) / 6
    const trendDirection = recentTrend > olderTrend ? "increasing" : recentTrend < olderTrend ? "decreasing" : "stable"

    return {
      slope,
      growthRate,
      forecasts,
      volatility,
      trendDirection,
      averageValue: yMean,
      coefficient: slope / yMean, // Normalized slope
    }
  }, [data])

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insufficient Data</CardTitle>
          <CardDescription>Need at least 2 data points for trend analysis</CardDescription>
        </CardHeader>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trend Direction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${trendColor}`}>
              <TrendIcon className="w-6 h-6" />
              <span className="text-2xl font-bold capitalize">{analysis.trendDirection}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Growth Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={analysis.growthRate > 0 ? "text-green-500" : "text-red-500"}>
              <span className="text-2xl font-bold">{analysis.growthRate.toFixed(2)}%</span>
              <p className="text-xs text-muted-foreground">Over period</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">
              {analysis.averageValue.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Volatility</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{analysis.volatility.toFixed(2)}</span>
            <p className="text-xs text-muted-foreground">Standard deviation</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trend with Regression Line */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Trend Analysis</CardTitle>
          <CardDescription>Actual data with regression line showing underlying trend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value) => value.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
                contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" name="Actual Values" strokeWidth={2} dot={false} />
              <Line
                type="linear"
                dataKey="trend"
                stroke="#ef4444"
                name="Trend Line"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast for Next 12 Months */}
      <Card>
        <CardHeader>
          <CardTitle>12-Month Forecast</CardTitle>
          <CardDescription>Projected values based on historical trend (Linear Regression)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analysis.forecasts}>
              <defs>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip
                formatter={(value) => value.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
                contentStyle={{ backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" }}
              />
              <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" fill="url(#colorForecast)" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Slope (Rate of Change)</p>
              <p className="text-lg font-semibold">{analysis.slope.toFixed(4)} units/period</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Normalized Coefficient</p>
              <p className="text-lg font-semibold">{(analysis.coefficient * 100).toFixed(4)}%</p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">Interpretation</p>
            <ul className="text-sm space-y-1">
              <li>
                • The data shows a <strong>{analysis.trendDirection}</strong> trend
              </li>
              <li>
                • Overall growth rate of <strong>{analysis.growthRate.toFixed(2)}%</strong>
              </li>
              <li>• Forecast suggests values will continue this trend in the next 12 months</li>
              <li>
                • Volatility of <strong>{analysis.volatility.toFixed(0)}</strong> indicates the variability around the
                trend
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
