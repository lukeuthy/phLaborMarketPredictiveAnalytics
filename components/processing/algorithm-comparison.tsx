"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChevronDown, Play, Download, Settings, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Algorithm {
  id: number
  name: string
  category: "Time Series" | "Machine Learning" | "Deep Learning"
  status: "completed" | "in-progress" | "pending"
  accuracy: number | null
  speed: number | null
  time: string
  rmse?: number
  mae?: number
  selected?: boolean
  parameters?: Record<string, number | string>
}

const initialAlgorithms: Algorithm[] = [
  {
    id: 1,
    name: "ARIMA",
    category: "Time Series",
    status: "pending",
    accuracy: null,
    speed: null,
    time: "-",
    selected: true,
    parameters: { order: "(1,1,1)", seasonal: "No" },
  },
  {
    id: 2,
    name: "SARIMA",
    category: "Time Series",
    status: "pending",
    accuracy: null,
    speed: null,
    time: "-",
    selected: true,
    parameters: { order: "(1,1,1)", seasonal: "Yes" },
  },
  {
    id: 3,
    name: "SVR",
    category: "Machine Learning",
    status: "pending",
    accuracy: null,
    speed: null,
    time: "-",
    selected: false,
    parameters: { kernel: "rbf", C: 100 },
  },
  {
    id: 4,
    name: "RandomForest",
    category: "Machine Learning",
    status: "pending",
    accuracy: null,
    speed: null,
    time: "-",
    selected: false,
    parameters: { nEstimators: 100, maxDepth: 10 },
  },
  {
    id: 5,
    name: "LSTM",
    category: "Deep Learning",
    status: "pending",
    accuracy: null,
    speed: null,
    time: "-",
    selected: false,
    parameters: { units: 50, epochs: 100 },
  },
  {
    id: 6,
    name: "GradientBoosting",
    category: "Machine Learning",
    status: "pending",
    accuracy: null,
    speed: null,
    time: "-",
    selected: false,
    parameters: { nEstimators: 100, learningRate: 0.1 },
  },
]

interface AlgorithmComparisonProps {
  datasetId?: string
}

export function AlgorithmComparison({ datasetId }: AlgorithmComparisonProps) {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<number | null>(null)
  const [expandedConfig, setExpandedConfig] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleAlgorithmSelection = (id: number) => {
    setAlgorithms(algorithms.map((algo) => (algo.id === id ? { ...algo, selected: !algo.selected } : algo)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <span className="badge-success">Completed</span>
      case "in-progress":
        return <span className="badge-warning">Processing</span>
      default:
        return <span className="badge-info">Pending</span>
    }
  }

  const selectedCount = algorithms.filter((a) => a.selected).length
  const completedCount = algorithms.filter((a) => a.status === "completed").length

  const handleRunComparison = async () => {
    if (!datasetId) {
      setError("No dataset selected")
      return
    }

    const selectedAlgos = algorithms.filter((a) => a.selected).map((a) => a.name)

    if (selectedAlgos.length === 0) {
      setError("Please select at least one algorithm")
      return
    }

    setIsRunning(true)
    setError(null)

    try {
      // Build parameters object
      const parameters: Record<string, any> = {}
      algorithms.forEach((algo) => {
        if (algo.parameters) {
          parameters[algo.name] = algo.parameters
        }
      })

      // Call backend API
      const result = await apiClient.compareAlgorithms(datasetId, selectedAlgos, parameters)

      console.log("[v0] Comparison results:", result)

      // Update algorithms with results
      setAlgorithms(
        algorithms.map((algo) => {
          const resultData = result.results[algo.name]
          if (resultData) {
            return {
              ...algo,
              status: "completed",
              accuracy: resultData.accuracy,
              rmse: resultData.rmse,
              mae: resultData.mae,
              time: `${resultData.executionTime}ms`,
              speed: resultData.accuracy,
            }
          }
          return algo
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed")
    } finally {
      setIsRunning(false)
    }
  }

  const bestAccuracy = Math.max(...algorithms.filter((a) => a.accuracy !== null).map((a) => a.accuracy || 0))
  const bestAlgorithm = algorithms.find((a) => a.accuracy === bestAccuracy)

  // Prepare chart data
  const comparisonData = algorithms
    .filter((a) => a.accuracy !== null)
    .map((a) => ({
      metric: a.name,
      accuracy: Math.round((a.accuracy || 0) * 100),
      speed: Math.round((a.speed || 0) * 100),
    }))

  const performanceData = algorithms
    .filter((a) => a.rmse !== null)
    .map((a) => ({
      name: a.name,
      rmse: a.rmse,
      mae: a.mae,
    }))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Algorithm Comparison</h1>
        <p className="text-text-muted">Compare performance across different models</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Best Accuracy</p>
          <p className="text-3xl font-bold text-success">{bestAlgorithm?.name || "N/A"}</p>
          <p className="text-sm text-text-muted mt-2">
            {bestAccuracy > 0 ? `${(bestAccuracy * 100).toFixed(0)}% accuracy` : "Run comparison"}
          </p>
        </Card>
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Selected</p>
          <p className="text-3xl font-bold text-accent">{selectedCount}</p>
          <p className="text-sm text-text-muted mt-2">algorithms to compare</p>
        </Card>
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Completed</p>
          <p className="text-3xl font-bold text-info">{completedCount}/6</p>
          <p className="text-sm text-text-muted mt-2">algorithms</p>
        </Card>
        <Card className="card">
          <p className="text-text-muted text-sm mb-2">Status</p>
          <p className="text-3xl font-bold text-warning">{isRunning ? "Running" : "Ready"}</p>
          <p className="text-sm text-text-muted mt-2">comparison engine</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Algorithm Selection */}
        <div className="lg:col-span-2">
          <Card className="card">
            <h2 className="text-xl font-bold text-foreground mb-6">Select Algorithms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {algorithms.map((algo) => (
                <div key={algo.id} className="space-y-3">
                  <div
                    className={`p-4 rounded-lg border-2 transition-all ${
                      algo.selected ? "border-accent bg-surface-light" : "border-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Checkbox
                        checked={algo.selected || false}
                        onCheckedChange={() => toggleAlgorithmSelection(algo.id)}
                        disabled={isRunning}
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{algo.name}</h3>
                        <p className="text-xs text-text-muted">{algo.category}</p>
                      </div>
                      {getStatusBadge(algo.status)}
                    </div>

                    {algo.accuracy !== null && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Accuracy</span>
                          <span className="text-foreground font-bold">{(algo.accuracy * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">RMSE</span>
                          <span className="text-foreground font-bold">{algo.rmse?.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Time</span>
                          <span className="text-foreground font-bold">{algo.time}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {algo.parameters && (
                    <button
                      onClick={() => setExpandedConfig(expandedConfig === algo.id ? null : algo.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-foreground transition-colors"
                      disabled={isRunning}
                    >
                      <Settings size={16} />
                      <span>Parameters</span>
                      <ChevronDown
                        size={14}
                        className={`ml-auto transition-transform ${expandedConfig === algo.id ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}

                  {expandedConfig === algo.id && algo.parameters && (
                    <div className="p-3 bg-surface rounded border border-border space-y-2">
                      {Object.entries(algo.parameters).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-text-muted capitalize">{key}:</span>
                          <span className="text-foreground font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Comparison</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-text-muted mb-1">Selected</p>
                <p className="text-2xl font-bold text-accent">{selectedCount}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted mb-1">Completed</p>
                <p className="text-2xl font-bold text-success">{completedCount}</p>
              </div>
              <Button
                onClick={handleRunComparison}
                disabled={selectedCount === 0 || isRunning}
                className="btn-primary w-full"
              >
                <Play size={16} className="mr-2" />
                {isRunning ? "Running..." : "Run Comparison"}
              </Button>
              <Button className="btn-secondary w-full">
                <Download size={16} className="mr-2" />
                Export Report
              </Button>
            </div>
          </Card>

          {error && (
            <Card className="card border border-error/30 bg-error/5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Comparison Charts */}
      {comparisonData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Performance Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="metric" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="var(--color-chart-1)" />
                <Bar dataKey="speed" fill="var(--color-chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {performanceData.length > 0 && (
            <Card className="card">
              <h3 className="text-lg font-bold text-foreground mb-4">Error Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" />
                  <YAxis stroke="var(--color-text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.5rem",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="rmse" stroke="var(--color-chart-1)" strokeWidth={2} />
                  <Line type="monotone" dataKey="mae" stroke="var(--color-chart-2)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
