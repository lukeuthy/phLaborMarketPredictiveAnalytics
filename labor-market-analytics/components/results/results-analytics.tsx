"use client"

import { useState } from "react"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, Share2, TrendingUp, TrendingDown, Filter } from "lucide-react"

const forecastData = [
  { quarter: "Q1 2024", lfpr: 63.2, employment: 91.8, unemployment: 5.4, underemployment: 13.2 },
  { quarter: "Q2 2024", lfpr: 63.5, employment: 91.9, unemployment: 5.3, underemployment: 13.0 },
  { quarter: "Q3 2024", lfpr: 63.8, employment: 92.0, unemployment: 5.2, underemployment: 12.9 },
  { quarter: "Q4 2024", lfpr: 64.1, employment: 92.1, unemployment: 5.1, underemployment: 12.7 },
  { quarter: "Q1 2025", lfpr: 64.2, employment: 92.1, unemployment: 5.2, underemployment: 12.8 },
  { quarter: "Q2 2025", lfpr: 64.4, employment: 92.2, unemployment: 5.0, underemployment: 12.5 },
]

const sectorData = [
  { name: "Agriculture", value: 22, color: "#10b981" },
  { name: "Manufacturing", value: 18, color: "#3b82f6" },
  { name: "Services", value: 45, color: "#8b5cf6" },
  { name: "Construction", value: 10, color: "#f59e0b" },
  { name: "Other", value: 5, color: "#6b7280" },
]

const insightsList = [
  {
    title: "Positive Trend",
    description: "Labor force participation shows consistent growth over the past 3 quarters",
    type: "success",
    icon: TrendingUp,
  },
  {
    title: "Seasonal Pattern",
    description: "Unemployment typically peaks in Q2, aligning with historical patterns",
    type: "warning",
    icon: TrendingDown,
  },
  {
    title: "Model Confidence",
    description: "SARIMA model shows 89% accuracy with strong predictive power",
    type: "info",
    icon: TrendingUp,
  },
  {
    title: "Sector Growth",
    description: "Services sector continues to dominate with 45% of total employment",
    type: "success",
    icon: TrendingUp,
  },
]

export function ResultsAnalytics() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedMetric, setSelectedMetric] = useState("lfpr")

  const metrics = [
    {
      label: "LFPR Forecast",
      value: "64.2%",
      change: "+0.8%",
      trend: "up",
      color: "text-success",
    },
    {
      label: "Employment Rate",
      value: "92.1%",
      change: "+0.3%",
      trend: "up",
      color: "text-success",
    },
    {
      label: "Unemployment Rate",
      value: "5.2%",
      change: "+0.2%",
      trend: "down",
      color: "text-error",
    },
    {
      label: "Underemployment",
      value: "12.8%",
      change: "+0.5%",
      trend: "down",
      color: "text-error",
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Analysis Results</h1>
        <p className="text-text-muted">View insights and forecasts from your analysis</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.label} className="card">
            <p className="text-text-muted text-sm mb-2">{metric.label}</p>
            <p className="text-3xl font-bold text-accent">{metric.value}</p>
            <p className={`text-sm ${metric.color} mt-2`}>
              {metric.trend === "up" ? "↑" : "↓"} {metric.change} from last quarter
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Forecast Trends */}
          <Card className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Labor Market Forecast</h2>
              <Button className="btn-secondary text-sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="quarter" stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="lfpr" stroke="var(--color-chart-1)" strokeWidth={2} name="LFPR %" />
                <Line
                  type="monotone"
                  dataKey="employment"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  name="Employment %"
                />
                <Line
                  type="monotone"
                  dataKey="unemployment"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  name="Unemployment %"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Sector Distribution */}
          <Card className="card">
            <h2 className="text-xl font-bold text-foreground mb-6">Employment by Sector</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Insights Panel */}
        <div className="space-y-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Key Insights</h3>
            <div className="space-y-3">
              {insightsList.slice(0, 3).map((insight, idx) => {
                const Icon = insight.icon
                const borderColor =
                  insight.type === "success"
                    ? "border-success"
                    : insight.type === "warning"
                      ? "border-warning"
                      : "border-info"
                return (
                  <div key={idx} className={`p-3 bg-surface-light rounded-lg border-l-4 ${borderColor}`}>
                    <div className="flex items-start gap-2">
                      <Icon size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{insight.title}</h4>
                        <p className="text-xs text-text-muted mt-1">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

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

      {/* Detailed Metrics */}
      <Card className="card">
        <h2 className="text-xl font-bold text-foreground mb-6">Detailed Metrics Comparison</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="quarter" stroke="var(--color-text-muted)" />
            <YAxis stroke="var(--color-text-muted)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="lfpr" fill="var(--color-chart-1)" name="LFPR %" />
            <Bar dataKey="employment" fill="var(--color-chart-2)" name="Employment %" />
            <Bar dataKey="unemployment" fill="var(--color-chart-3)" name="Unemployment %" />
            <Bar dataKey="underemployment" fill="var(--color-chart-4)" name="Underemployment %" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
