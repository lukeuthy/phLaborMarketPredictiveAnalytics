"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Zap, AlertCircle, ChevronDown, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface PreprocessingStep {
  id: number
  name: string
  label: string
  description: string
  status: "completed" | "in-progress" | "pending"
  details?: any
  config?: {
    method: string
    parameters: Record<string, string | number>
  }
}

interface PreprocessingPipelineProps {
  datasetId?: string
  onComplete?: (results: any) => void
}

export function PreprocessingPipeline({ datasetId, onComplete }: PreprocessingPipelineProps) {
  const [steps, setSteps] = useState<PreprocessingStep[]>([])
  const [selectedStep, setSelectedStep] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dataStats, setDataStats] = useState<any>(null)
  const [preprocessingResults, setPreprocessingResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (datasetId) {
      initializeSteps()
    }
  }, [datasetId])

  const initializeSteps = async () => {
    try {
      setLoading(true)
      // Get dataset summary for statistics
      const summary = await apiClient.getDatasetSummary(datasetId!)
      setDataStats(summary)

      // Initialize preprocessing steps
      const initialSteps: PreprocessingStep[] = [
        {
          id: 1,
          name: "Data Validation",
          label: "Validating Data",
          description: "Check data integrity and format",
          status: "pending",
          config: {
            method: "Comprehensive Check",
            parameters: { checkMissing: true, checkTypes: true, checkRanges: true },
          },
        },
        {
          id: 2,
          name: "Missing Values",
          label: "Handling Missing Values",
          description: "Handle missing data points",
          status: "pending",
          config: {
            method: "Linear Interpolation",
            parameters: { threshold: 0.1, maxGap: 3 },
          },
        },
        {
          id: 3,
          name: "Outlier Detection",
          label: "Detecting Outliers",
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
          label: "Normalizing Data",
          description: "Scale features to standard range",
          status: "pending",
          config: {
            method: "Z-Score Normalization",
            parameters: { method: "zscore" },
          },
        },
        {
          id: 5,
          name: "Feature Engineering",
          label: "Engineering Features",
          description: "Create derived features",
          status: "pending",
          config: {
            method: "Lag & Moving Average",
            parameters: { lags: "1,2,4", windows: "2,4" },
          },
        },
      ]

      setSteps(initialSteps)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize preprocessing")
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    if (steps.length === 0) return 0
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

  const handleStartProcessing = async () => {
    if (!datasetId) {
      setError("No dataset selected")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Start preprocessing on backend
      const result = await apiClient.startPreprocessing(datasetId)

      // Update steps as they complete
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: "in-progress" as const,
        })),
      )

      // Simulate real-time progress updates
      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1200))

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

      // Get final preprocessing results
      const finalResults = await apiClient.getPreprocessingResults(datasetId)
      setPreprocessingResults(finalResults)

      // Mark all steps as completed
      setSteps((prevSteps) => prevSteps.map((step) => ({ ...step, status: "completed" as const })))

      // Call completion callback
      if (onComplete) {
        onComplete(finalResults)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Processing failed")
      // Reset steps on error
      setSteps((prevSteps) =>
        prevSteps.map((step) => ({
          ...step,
          status: step.status === "completed" ? "completed" : "pending",
        })),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const progress = calculateProgress()

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-foreground">Loading preprocessing pipeline...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Data Preprocessing Pipeline</h1>
        <p className="text-text-muted">Clean, validate, and prepare data for analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Steps */}
        <div className="lg:col-span-2 space-y-6">
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
                      <span className="text-xs px-2 py-1 rounded bg-surface text-text-muted capitalize">
                        {step.status}
                      </span>
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
                            <div className="p-2 bg-surface-light rounded border border-border text-sm text-foreground">
                              {step.config.method}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Parameters</label>
                            <div className="space-y-2">
                              {Object.entries(step.config.parameters).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm p-2 bg-surface-light rounded">
                                  <span className="text-text-muted capitalize">{key}:</span>
                                  <span className="text-foreground font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Preprocessing Results */}
          {preprocessingResults && (
            <Card className="card border border-success/30 bg-success/5">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-success" />
                Preprocessing Complete
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-muted mb-1">Original Records</p>
                  <p className="text-2xl font-bold text-foreground">{preprocessingResults.original_records}</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">Processed Records</p>
                  <p className="text-2xl font-bold text-foreground">{preprocessingResults.processed_records}</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">Processing Time</p>
                  <p className="text-lg font-bold text-foreground">{preprocessingResults.processing_time}ms</p>
                </div>
                <div>
                  <p className="text-text-muted mb-1">Data Quality</p>
                  <p className="text-lg font-bold text-success">
                    {Math.round((preprocessingResults.processed_records / preprocessingResults.original_records) * 100)}
                    %
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Summary Panel */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-text-muted">Completion</span>
                <span className="text-foreground font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-surface-light rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-text-muted">
              {steps.filter((s) => s.status === "completed").length} of {steps.length} steps completed
            </p>
          </Card>

          {/* Data Statistics */}
          {dataStats && (
            <Card className="card">
              <h3 className="text-lg font-bold text-foreground mb-4">Data Statistics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Records</span>
                  <span className="text-foreground font-bold">{dataStats.total_records}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Time Period</span>
                  <span className="text-foreground font-bold">
                    {dataStats.start_year} - {dataStats.end_year}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Avg LFPR</span>
                  <span className="text-foreground font-bold">{dataStats.avg_lfpr?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Avg Employment</span>
                  <span className="text-foreground font-bold">{dataStats.avg_employment?.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Avg Unemployment</span>
                  <span className="text-foreground font-bold">{dataStats.avg_unemployment?.toFixed(2)}%</span>
                </div>
              </div>
            </Card>
          )}

          {/* Status Messages */}
          {error && (
            <Card className="card border border-error/30 bg-error/5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            </Card>
          )}

          {isProcessing && (
            <Card className="card border border-info/30 bg-info/5">
              <div className="flex gap-3">
                <Loader size={20} className="text-info flex-shrink-0 mt-0.5 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-foreground">Processing in progress</p>
                  <p className="text-xs text-text-muted mt-1">
                    {steps.find((s) => s.status === "in-progress")?.label || "Initializing..."}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <Button
            onClick={handleStartProcessing}
            disabled={isProcessing || progress === 100}
            className="btn-primary w-full"
          >
            {isProcessing ? (
              <>
                <Loader size={20} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : progress === 100 ? (
              <>
                <CheckCircle size={20} className="mr-2" />
                Completed
              </>
            ) : (
              "Start Preprocessing"
            )}
          </Button>

          {progress === 100 && <Button className="btn-secondary w-full">Proceed to Algorithm Comparison →</Button>}
        </div>
      </div>
    </div>
  )
}
