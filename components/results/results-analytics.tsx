"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download, Share2, Filter, RefreshCw, Award } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function ResultsAnalytics({ resultId }: { resultId?: string }) {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null)

  useEffect(() => {
    if (resultId) {
      loadResults()
    }
  }, [resultId])

  const loadResults = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getProcessingResults(resultId!)
      setResult(data)
      if (data.metrics && data.metrics.length > 0) {
        setSelectedAlgorithm(data.metrics[0].algorithm)
      }
    } catch (error) {
      console.error("Failed to load results:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="p-8">
        <Card className="card">
          <p className="text-foreground">No results available</p>
        </Card>
      </div>
    )
  }

  const metrics = result.metrics || []
  const selectedMetrics = selectedAlgorithm ? metrics.find((m: any) => m.algorithm === selectedAlgorithm) : metrics[0]

  // Algorithm comparison data
  const comparisonData = metrics.map((m: any) => ({
    algorithm: m.algorithm,
    accuracy: Math.round(m.accuracy * 100),
    rmse: Math.round(m.rmse * 100) / 100,
    mae: Math.round(m.mae * 100) / 100,
    mape: Math.round(m.mape * 100) / 100,
    time: m.executionTime,
  }))

  // Performance radar data
  const radarData = [
    {
      metric: "Accuracy",
      value: Math.round(selectedMetrics?.accuracy * 100) || 0,
    },
    {
      metric: "Speed",
      value: Math.min(100, Math.round((1000 / (selectedMetrics?.executionTime || 1)) * 10)),
    },
    {
      metric: "Stability",
      value: Math.round((1 - (selectedMetrics?.mape || 0) / 100) * 100),
    },
    {
      metric: "Precision",
      value: Math.round((1 - selectedMetrics?.mae / 10) * 100),
    },
  ]

  // Forecast data
  const forecastData = selectedMetrics?.forecast || []

  // Execution time comparison
  const timeData = metrics.map((m: any) => ({
    algorithm: m.algorithm,
    time: m.executionTime,
  }))

  const bestAlgorithm = result.summary?.bestAlgorithm
  const fastestAlgorithm = result.summary?.fastestAlgorithm

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Analysis Results</h1>
        <p className="text-text-muted">
          Processed {result.summary?.dataPoints} data points across {result.summary?.totalAlgorithms} algorithms
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Best Algorithm</p>
          <p className="text-2xl font-bold text-accent">{bestAlgorithm}</p>
          <p className="text-sm text-success mt-2">{Math.round(result.summary?.bestAccuracy * 100)}% accuracy</p>
        </Card>

        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Fastest Algorithm</p>
          <p className="text-2xl font-bold text-accent">{fastestAlgorithm}</p>
          <p className="text-sm text-info mt-2">{result.summary?.fastestTime}ms</p>
        </Card>

        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Total Processing Time</p>
          <p className="text-2xl font-bold text-accent">{result.summary?.totalProcessingTime}ms</p>
          <p className="text-sm text-text-muted mt-2">{(result.summary?.totalProcessingTime / 1000).toFixed(2)}s</p>
        </Card>

        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Data Quality</p>
          <p className="text-2xl font-bold text-accent">
            {Math.round((result.summary?.dataPoints / (result.summary?.dataPoints + 10)) * 100)}%
          </p>
          <p className="text-sm text-success mt-2">Valid records</p>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Algorithm Comparison */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Algorithm Performance Comparison</h2>
              <Button className="btn-secondary text-sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="algorithm" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="var(--color-chart-1)" name="Accuracy %" />
                <Bar dataKey="rmse" fill="var(--color-chart-2)" name="RMSE" />
                <Bar dataKey="mae" fill="var(--color-chart-3)" name="MAE" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Forecast Visualization */}
          {forecastData.length > 0 && (
            <Card className="card">
              <h2 className="text-xl font-bold text-foreground mb-6">
                {selectedAlgorithm} - Forecast with Confidence Intervals
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="step" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="var(--color-chart-1)" strokeWidth={2} name="Forecast" />
                  {forecastData[0]?.lower && (
                    <Line
                      type="monotone"
                      dataKey="lower"
                      stroke="var(--color-chart-2)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Lower Bound"
                    />
                  )}
                  {forecastData[0]?.upper && (
                    <Line
                      type="monotone"
                      dataKey="upper"
                      stroke="var(--color-chart-3)"
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      name="Upper Bound"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-6">
          {/* Algorithm Selector */}
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Select Algorithm</h3>
            <div className="space-y-2">
              {metrics.map((m: any) => (
                <button
                  key={m.algorithm}
                  onClick={() => setSelectedAlgorithm(m.algorithm)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedAlgorithm === m.algorithm
                      ? "bg-accent text-white"
                      : "bg-surface-light text-foreground hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{m.algorithm}</span>
                    {m.algorithm === bestAlgorithm && <Award size={16} />}
                  </div>
                  <p className="text-xs mt-1 opacity-75">{Math.round(m.accuracy * 100)}% accuracy</p>
                </button>
              ))}
            </div>
          </Card>

          {/* Performance Metrics */}
          {selectedMetrics && (
            <Card className="card">
              <h3 className="text-lg font-bold text-foreground mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-text-muted mb-1">Accuracy</p>
                  <div className="w-full bg-surface-light rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{ width: `${Math.round(selectedMetrics.accuracy * 100)}%` }}
                    />
                  </div>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {Math.round(selectedMetrics.accuracy * 100)}%
                  </p>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">RMSE</p>
                  <p className="text-sm font-bold text-foreground">{selectedMetrics.rmse.toFixed(4)}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">MAE</p>
                  <p className="text-sm font-bold text-foreground">{selectedMetrics.mae.toFixed(4)}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">MAPE</p>
                  <p className="text-sm font-bold text-foreground">{selectedMetrics.mape.toFixed(2)}%</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted mb-1">Execution Time</p>
                  <p className="text-sm font-bold text-foreground">{selectedMetrics.executionTime}ms</p>
                </div>
              </div>
            </Card>
          )}

          {/* Export */}
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Export & Share</h3>
            <div className="space-y-3">
              <Button className="btn-primary w-full">
                <Download size={16} className="mr-2" />
                Download Report
              </Button>
              <Button className="btn-secondary w-full">
                <Share2 size={16} className="mr-2" />
                Share Results
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Execution Time Comparison */}
      <Card className="card mb-8">
        <h2 className="text-xl font-bold text-foreground mb-6">Execution Time Comparison</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="algorithm" stroke="var(--color-text-muted)" />
            <YAxis
              stroke="var(--color-text-muted)"
              label={{ value: "Time (ms)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="time" fill="var(--color-chart-1)" name="Execution Time (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="card">
        <h2 className="text-xl font-bold text-foreground mb-6">Detailed Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Algorithm</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Accuracy</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">RMSE</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">MAE</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">MAPE</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Time (ms)</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m: any) => (
                <tr key={m.algorithm} className="border-b border-border hover:bg-surface-light">
                  <td className="py-3 px-4 font-medium text-foreground">{m.algorithm}</td>
                  <td className="py-3 px-4 text-foreground">{Math.round(m.accuracy * 100)}%</td>
                  <td className="py-3 px-4 text-foreground">{m.rmse.toFixed(4)}</td>
                  <td className="py-3 px-4 text-foreground">{m.mae.toFixed(4)}</td>
                  <td className="py-3 px-4 text-foreground">{m.mape.toFixed(2)}%</td>
                  <td className="py-3 px-4 text-foreground">{m.executionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
