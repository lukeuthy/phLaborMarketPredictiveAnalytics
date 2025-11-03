"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Download, Eye, EyeOff } from "lucide-react"

const modelMetrics = [
  {
    model: "SARIMA",
    precision: 0.89,
    recall: 0.87,
    f1Score: 0.88,
    accuracy: 0.89,
    rmse: 0.142,
    mae: 0.076,
    mape: 2.34,
  },
  {
    model: "ARIMA",
    precision: 0.87,
    recall: 0.85,
    f1Score: 0.86,
    accuracy: 0.87,
    rmse: 0.156,
    mae: 0.089,
    mape: 2.67,
  },
  {
    model: "SVR",
    precision: 0.85,
    recall: 0.83,
    f1Score: 0.84,
    accuracy: 0.85,
    rmse: 0.178,
    mae: 0.095,
    mape: 3.12,
  },
]

const rocCurveData = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.05, tpr: 0.15 },
  { fpr: 0.1, tpr: 0.35 },
  { fpr: 0.15, tpr: 0.55 },
  { fpr: 0.2, tpr: 0.7 },
  { fpr: 0.3, tpr: 0.85 },
  { fpr: 0.4, tpr: 0.92 },
  { fpr: 0.5, tpr: 0.96 },
  { fpr: 0.6, tpr: 0.98 },
  { fpr: 1, tpr: 1 },
]

const featureImportance = [
  { feature: "Seasonal Component", importance: 0.28 },
  { feature: "Trend", importance: 0.24 },
  { feature: "Lag-1", importance: 0.18 },
  { feature: "Lag-2", importance: 0.14 },
  { feature: "Lag-3", importance: 0.1 },
  { feature: "External Factors", importance: 0.06 },
]

const residualData = [
  { index: 1, residual: 0.02 },
  { index: 2, residual: -0.01 },
  { index: 3, residual: 0.03 },
  { index: 4, residual: -0.02 },
  { index: 5, residual: 0.01 },
  { index: 6, residual: -0.03 },
  { index: 7, residual: 0.02 },
  { index: 8, residual: 0.01 },
  { index: 9, residual: -0.01 },
  { index: 10, residual: 0.02 },
]

const crossValidationData = [
  { fold: "Fold 1", score: 0.87 },
  { fold: "Fold 2", score: 0.89 },
  { fold: "Fold 3", score: 0.86 },
  { fold: "Fold 4", score: 0.88 },
  { fold: "Fold 5", score: 0.9 },
]

const radarData = [
  { metric: "Accuracy", SARIMA: 89, ARIMA: 87, SVR: 85 },
  { metric: "Precision", SARIMA: 89, ARIMA: 87, SVR: 85 },
  { metric: "Recall", SARIMA: 87, ARIMA: 85, SVR: 83 },
  { metric: "F1-Score", SARIMA: 88, ARIMA: 86, SVR: 84 },
  { metric: "Speed", SARIMA: 92, ARIMA: 95, SVR: 88 },
]

export function PerformanceMetrics() {
  const [selectedModel, setSelectedModel] = useState("SARIMA")
  const [showDetails, setShowDetails] = useState(true)

  const currentMetrics = modelMetrics.find((m) => m.model === selectedModel)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Performance Metrics</h1>
        <p className="text-text-muted">Detailed evaluation and visualization of model performance</p>
      </div>

      {/* Model Selection */}
      <div className="mb-8">
        <Card className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Select Model</h2>
            <Button onClick={() => setShowDetails(!showDetails)} className="btn-secondary text-sm">
              {showDetails ? <Eye size={16} /> : <EyeOff size={16} />}
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {modelMetrics.map((model) => (
              <button
                key={model.model}
                onClick={() => setSelectedModel(model.model)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedModel === model.model
                    ? "bg-primary text-white"
                    : "bg-surface-light text-foreground hover:bg-border"
                }`}
              >
                {model.model}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Key Metrics Cards */}
      {showDetails && currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card">
            <p className="text-text-muted text-sm mb-2">Accuracy</p>
            <p className="text-3xl font-bold text-success">{(currentMetrics.accuracy * 100).toFixed(1)}%</p>
            <p className="text-xs text-text-muted mt-2">Overall correctness</p>
          </Card>
          <Card className="card">
            <p className="text-text-muted text-sm mb-2">Precision</p>
            <p className="text-3xl font-bold text-accent">{(currentMetrics.precision * 100).toFixed(1)}%</p>
            <p className="text-xs text-text-muted mt-2">True positive rate</p>
          </Card>
          <Card className="card">
            <p className="text-text-muted text-sm mb-2">RMSE</p>
            <p className="text-3xl font-bold text-warning">{currentMetrics.rmse.toFixed(3)}</p>
            <p className="text-xs text-text-muted mt-2">Root mean squared error</p>
          </Card>
          <Card className="card">
            <p className="text-text-muted text-sm mb-2">MAPE</p>
            <p className="text-3xl font-bold text-info">{currentMetrics.mape.toFixed(2)}%</p>
            <p className="text-xs text-text-muted mt-2">Mean absolute percentage error</p>
          </Card>
        </div>
      )}

      {/* Tabs for Different Visualizations */}
      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="roc">ROC Curve</TabsTrigger>
          <TabsTrigger value="features">Feature Importance</TabsTrigger>
          <TabsTrigger value="residuals">Residuals</TabsTrigger>
        </TabsList>

        {/* Model Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Model Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="model" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="accuracy" fill="var(--color-chart-1)" name="Accuracy" />
                <Bar dataKey="precision" fill="var(--color-chart-2)" name="Precision" />
                <Bar dataKey="recall" fill="var(--color-chart-3)" name="Recall" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Error Metrics Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={modelMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="model" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Bar dataKey="rmse" fill="var(--color-chart-1)" name="RMSE" />
                <Bar dataKey="mae" fill="var(--color-chart-2)" name="MAE" />
                <Bar dataKey="mape" fill="var(--color-chart-3)" name="MAPE %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Radar Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="metric" stroke="var(--color-text-muted)" />
                <PolarRadiusAxis stroke="var(--color-text-muted)" />
                <Radar
                  name="SARIMA"
                  dataKey="SARIMA"
                  stroke="var(--color-chart-1)"
                  fill="var(--color-chart-1)"
                  fillOpacity={0.25}
                />
                <Radar
                  name="ARIMA"
                  dataKey="ARIMA"
                  stroke="var(--color-chart-2)"
                  fill="var(--color-chart-2)"
                  fillOpacity={0.25}
                />
                <Radar
                  name="SVR"
                  dataKey="SVR"
                  stroke="var(--color-chart-3)"
                  fill="var(--color-chart-3)"
                  fillOpacity={0.25}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ROC Curve */}
        <TabsContent value="roc">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">ROC Curve - {selectedModel}</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="fpr" name="False Positive Rate" stroke="var(--color-text-muted)" />
                <YAxis dataKey="tpr" name="True Positive Rate" stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                  cursor={{ strokeDasharray: "3 3" }}
                />
                <Scatter name="ROC Curve" data={rocCurveData} fill="var(--color-chart-1)" />
                <Line type="monotone" dataKey="tpr" stroke="var(--color-chart-1)" strokeWidth={2} />
              </ScatterChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-surface-light rounded">
              <p className="text-sm text-text-muted">
                <span className="font-bold text-foreground">AUC Score:</span> 0.92 - Excellent discrimination between
                classes
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Feature Importance */}
        <TabsContent value="features">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Feature Importance - {selectedModel}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-text-muted)" />
                <YAxis dataKey="feature" type="category" stroke="var(--color-text-muted)" width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="importance" fill="var(--color-chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Residuals */}
        <TabsContent value="residuals" className="space-y-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Residual Plot - {selectedModel}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="index" name="Sample Index" stroke="var(--color-text-muted)" />
                <YAxis dataKey="residual" name="Residual" stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Scatter name="Residuals" data={residualData} fill="var(--color-chart-1)" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>

          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Cross-Validation Scores</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crossValidationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="fold" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" domain={[0.8, 1]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="score" fill="var(--color-chart-2)" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-surface-light rounded">
              <p className="text-sm text-text-muted">
                <span className="font-bold text-foreground">Mean CV Score:</span> 0.88 ± 0.015 - Stable model
                performance
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Section */}
      <div className="mt-8">
        <Card className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">Export Results</h3>
              <p className="text-sm text-text-muted mt-1">Download detailed performance metrics and visualizations</p>
            </div>
            <Button className="btn-primary">
              <Download size={16} className="mr-2" />
              Export Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
