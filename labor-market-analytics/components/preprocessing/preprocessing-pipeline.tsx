"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Zap, AlertCircle, ChevronDown } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { apiClient } from "@/lib/api-client"

interface PreprocessingStep {
  id: number
  name: string
  description: string
  status: "completed" | "in-progress" | "pending"
  config?: {
    method: string
    parameters: Record<string, string | number>
  }
  details?: string
}

const initialSteps: PreprocessingStep[] = [
  {
    id: 1,
    name: "Data Validation",
    description: "Check data integrity and format",
    status: "completed",
    details: "✓ 160 records validated\n✓ All required columns present\n✓ Date format verified",
  },
  {
    id: 2,
    name: "Missing Values",
    description: "Handle missing data points",
    status: "in-progress",
    details: "Processing 12 missing values using interpolation method",
    config: {
      method: "Linear Interpolation",
      parameters: { threshold: 0.1, maxGap: 3 },
    },
  },
  {
    id: 3,
    name: "Outlier Detection",
    description: "Identify and handle outliers",
    status: "pending",
    config: {
      method: "IQR Method",
      parameters: { multiplier: 1.5 },
    },
  },
  {
    id: 4,
    name: "Normalization",
    description: "Scale features to standard range",
    status: "pending",
    config: {
      method: "Min-Max Scaling",
      parameters: { min: 0, max: 1 },
    },
  },
  {
    id: 5,
    name: "Feature Engineering",
    description: "Create derived features",
    status: "pending",
    config: {
      method: "Polynomial Features",
      parameters: { degree: 2 },
    },
  },
]

interface PreprocessingPipelineProps {
  datasetId?: string
}

export function PreprocessingPipeline({ datasetId }: PreprocessingPipelineProps) {
  const [steps, setSteps] = useState<PreprocessingStep[]>(initialSteps)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateProgress = () => {
    const completed = steps.filter((s) => s.status === "completed").length
    return Math.round((completed / steps.length) * 100)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle size={20} className="text-success" />
      case "in-progress":
        return <Zap size={20} className="text-warning animate-pulse" />
      default:
        return <Circle size={20} className="text-text-muted" />
    }
  }

  const updateStepConfig = (stepId: number, method: string) => {
    setSteps(
      steps.map((step) => (step.id === stepId && step.config ? { ...step, config: { ...step.config, method } } : step)),
    )
  }

  const handleStartProcessing = async () => {
    if (!datasetId) {
      setError("No dataset selected")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Start preprocessing on backend
      await apiClient.startPreprocessing(datasetId)

      // Simulate processing each step
      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setSteps((prevSteps) =>
          prevSteps.map((step, idx) => {
            if (idx === i) {
              return { ...step, status: "completed" as const }
            }
            if (idx === i + 1) {
              return { ...step, status: "in-progress" as const }
            }
            return step
          }),
        )
      }

      // Get final status from backend
      const status = await apiClient.getPreprocessingStatus(datasetId)
      console.log("[v0] Preprocessing status:", status)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
    } finally {
      setIsProcessing(false)
    }
  }

  const progress = calculateProgress()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Preprocessing Pipeline</h1>
        <p className="text-text-muted">Clean and prepare data for analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Steps */}
        <div className="lg:col-span-2">
          <Card className="card">
            <h2 className="text-xl font-bold text-foreground mb-6">Processing Steps</h2>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.id}>
                  <button
                    onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                    className="w-full flex items-start gap-4 p-4 bg-surface-light rounded-lg hover:bg-border transition-colors text-left"
                  >
                    <div className="mt-1">{getStatusIcon(step.status)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{step.name}</h3>
                      <p className="text-sm text-text-muted">{step.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-surface text-text-muted">{step.status}</span>
                      <ChevronDown
                        size={16}
                        className={`text-text-muted transition-transform ${selectedStep === step.id ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>

                  {/* Connector Line */}
                  {idx < steps.length - 1 && <div className="ml-10 h-4 border-l border-border"></div>}

                  {/* Step Details */}
                  {selectedStep === step.id && (
                    <div className="mt-4 p-4 bg-surface rounded-lg border border-border space-y-4">
                      {step.details && (
                        <div className="p-3 bg-surface-light rounded border border-border">
                          <p className="text-sm text-text-muted whitespace-pre-line">{step.details}</p>
                        </div>
                      )}

                      {step.config && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Method</label>
                            <select
                              value={step.config.method}
                              onChange={(e) => updateStepConfig(step.id, e.target.value)}
                              className="input-field"
                              disabled={isProcessing}
                            >
                              <option>{step.config.method}</option>
                              <option>Alternative Method</option>
                              <option>Custom</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Parameters</label>
                            <div className="space-y-2">
                              {Object.entries(step.config.parameters).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-text-muted capitalize">{key}:</span>
                                  <span className="text-foreground font-medium">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button className="btn-secondary w-full" disabled={isProcessing}>
                        Apply Configuration
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-text-muted">Completion</span>
                <span className="text-foreground font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <p className="text-sm text-text-muted">
              {steps.filter((s) => s.status === "completed").length} of {steps.length} steps completed
            </p>
          </Card>

          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Statistics</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Records</span>
                <span className="text-foreground font-bold">160</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Features</span>
                <span className="text-foreground font-bold">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Missing Values</span>
                <span className="text-warning font-bold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Outliers Detected</span>
                <span className="text-info font-bold">3</span>
              </div>
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

          {steps.some((s) => s.status === "in-progress") && (
            <Card className="card border border-warning/30 bg-warning/5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Processing in progress</p>
                  <p className="text-xs text-text-muted mt-1">
                    {steps.find((s) => s.status === "in-progress")?.name} is currently running
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={handleStartProcessing}
            disabled={isProcessing || progress === 100}
            className="btn-primary w-full"
          >
            {isProcessing ? "Processing..." : progress === 100 ? "Completed" : "Start Processing"}
          </Button>

          {progress === 100 && <Button className="btn-secondary w-full">Proceed to Algorithm Comparison →</Button>}
        </div>
      </div>
    </div>
  )
}
