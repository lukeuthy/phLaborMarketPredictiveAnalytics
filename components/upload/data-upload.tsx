"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp, CheckCircle, AlertCircle, Info, Loader } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function DataUpload({ onUploadSuccess }: { onUploadSuccess?: (datasetId: number) => void }) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [datasetName, setDatasetName] = useState("")
  const [datasetDescription, setDatasetDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "text/csv" || f.name.endsWith(".csv"),
    )
    if (droppedFiles.length === 0) {
      setError("Please drop CSV files only")
      return
    }
    setFiles((prev) => [...prev, ...droppedFiles])
    setError(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter((f) => f.type === "text/csv" || f.name.endsWith(".csv"))
      if (selectedFiles.length === 0) {
        setError("Please select CSV files only")
        return
      }
      setFiles((prev) => [...prev, ...selectedFiles])
      setError(null)
    }
  }

  const validateCSVData = (data: any[]): string[] => {
    const errors: string[] = []

    if (data.length < 12) {
      errors.push("Minimum 12 months of data required (1 year)")
    }

    if (data.length > 480) {
      errors.push("Maximum 40 years of data allowed (480 months)")
    }

    const requiredFields = [
      "year",
      "month",
      "employment_rate",
      "unemployment_rate",
      "underemployment_rate",
      "labor_force_participation_rate",
      "average_wage_php",
      "gdp_growth_rate",
    ]
    const firstRecord = data[0]
    requiredFields.forEach((field) => {
      if (!(field in firstRecord)) {
        errors.push(`Missing required field: ${field}`)
      }
    })

    data.forEach((record, idx) => {
      if (!Number.isInteger(record.month) || record.month < 1 || record.month > 12) {
        errors.push(`Row ${idx + 1}: Invalid month (must be 1-12)`)
      }
      if (!Number.isInteger(record.year) || record.year < 1990 || record.year > 2100) {
        errors.push(`Row ${idx + 1}: Invalid year`)
      }

      const numericFields = [
        "employment_rate",
        "unemployment_rate",
        "underemployment_rate",
        "labor_force_participation_rate",
        "average_wage_php",
        "gdp_growth_rate",
      ]
      numericFields.forEach((field) => {
        const value = Number.parseFloat(record[field])
        if (isNaN(value) || value < 0 || (field !== "average_wage_php" && field !== "gdp_growth_rate" && value > 100)) {
          errors.push(`Row ${idx + 1}: ${field} has invalid value`)
        }
      })
    })

    return errors
  }

  const handleUpload = async () => {
    if (!datasetName.trim()) {
      setError("Please enter a dataset name")
      return
    }

    if (files.length === 0) {
      setError("Please select at least one file")
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(null)
    setValidationErrors([])
    setUploadProgress(0)

    try {
      const file = files[0]
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("CSV file must contain headers and at least one data row")
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
      setUploadProgress(20)

      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        return {
          year: Number.parseInt(values[headers.indexOf("year")]),
          month: Number.parseInt(values[headers.indexOf("month")]),
          region: values[headers.indexOf("region")] || "National",
          industry: values[headers.indexOf("industry")] || "Overall",
          employment_rate: Number.parseFloat(values[headers.indexOf("employment_rate")]),
          unemployment_rate: Number.parseFloat(values[headers.indexOf("unemployment_rate")]),
          underemployment_rate: Number.parseFloat(values[headers.indexOf("underemployment_rate")]),
          labor_force_participation_rate: Number.parseFloat(values[headers.indexOf("labor_force_participation_rate")]),
          average_wage_php: Number.parseFloat(values[headers.indexOf("average_wage_php")]),
          gdp_growth_rate: Number.parseFloat(values[headers.indexOf("gdp_growth_rate")]),
        }
      })

      setUploadProgress(40)

      const errors = validateCSVData(data)
      if (errors.length > 0) {
        setValidationErrors(errors)
        throw new Error(`Validation failed: ${errors[0]}`)
      }

      setUploadProgress(60)

      const result = await apiClient.uploadData(data, {
        name: datasetName,
        description: datasetDescription,
        source: "PSA",
      })

      setUploadProgress(100)

      setSuccess(`Successfully uploaded ${result.recordsInserted} records from ${data.length} months!`)
      setFiles([])
      setDatasetName("")
      setDatasetDescription("")

      if (onUploadSuccess) {
        setTimeout(() => onUploadSuccess(result.datasetId), 1500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Upload Philippine Labor Market Data</h1>
        <p className="text-text-muted">Import monthly labor force data for predictive analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-dashed border-border hover:border-accent transition-all duration-300">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center py-16 cursor-pointer hover:bg-surface-light/50 transition-colors"
            >
              <Upload size={48} className="text-accent mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Drop CSV files here</h3>
              <p className="text-text-muted mb-6">or click to browse your computer</p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept=".csv"
              />
              <label htmlFor="file-input">
                <Button as="span" className="btn-primary cursor-pointer">
                  <FileUp size={20} className="mr-2" />
                  Select CSV Files
                </Button>
              </label>
            </div>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card className="card">
              <h3 className="text-lg font-bold text-foreground mb-4">Selected Files ({files.length})</h3>
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-surface-light rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <CheckCircle size={20} className="text-success flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="text-error hover:text-error/80 ml-4 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dataset Metadata Form */}
          {files.length > 0 && (
            <Card className="card">
              <h3 className="text-lg font-bold text-foreground mb-6">Dataset Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Dataset Name *</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g., Philippine Labor Force 2015-2024"
                    className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                  <textarea
                    value={datasetDescription}
                    onChange={(e) => setDatasetDescription(e.target.value)}
                    placeholder="Optional: Add notes about the data source, collection method, or any special considerations..."
                    className="w-full px-4 py-2 rounded-lg bg-surface border border-border text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Upload Progress */}
          {uploading && uploadProgress > 0 && (
            <Card className="card border border-info/30 bg-info/5">
              <div className="flex items-center gap-3 mb-3">
                <Loader size={20} className="text-info animate-spin" />
                <p className="font-medium text-foreground">Uploading and validating data...</p>
              </div>
              <div className="w-full bg-surface-light rounded-full h-2">
                <div
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-text-muted mt-2">{uploadProgress}% complete</p>
            </Card>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          {/* CSV Format Guide */}
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Info size={20} className="text-info" />
              CSV Format
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-foreground mb-1">Required Columns:</p>
                <ul className="space-y-1 text-text-muted">
                  <li>• year (YYYY)</li>
                  <li>• month (1-12)</li>
                  <li>• employment_rate (0-100)</li>
                  <li>• unemployment_rate (0-100)</li>
                  <li>• underemployment_rate (0-100)</li>
                  <li>• labor_force_participation_rate (0-100)</li>
                  <li>• average_wage_php (numeric)</li>
                  <li>• gdp_growth_rate (numeric)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Optional:</p>
                <p className="text-text-muted">• region, • industry</p>
              </div>
            </div>
          </Card>

          {/* Data Requirements */}
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Data Requirements</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Minimum 12 months (1 year)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Maximum 480 months (40 years)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>CSV format only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Monthly granularity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">✓</span>
                <span>Preprocessed data ready</span>
              </li>
            </ul>
          </Card>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="card border border-error/30 bg-error/5">
              <div className="flex gap-3 mb-3">
                <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Validation Errors:</p>
                  <ul className="text-sm text-foreground mt-2 space-y-1">
                    {validationErrors.slice(0, 3).map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                    {validationErrors.length > 3 && <li>• ... and {validationErrors.length - 3} more</li>}
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Error Alert */}
          {error && !validationErrors.length && (
            <Card className="card border border-error/30 bg-error/5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            </Card>
          )}

          {/* Success Alert */}
          {success && (
            <Card className="card border border-success/30 bg-success/5">
              <div className="flex gap-3">
                <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{success}</p>
              </div>
            </Card>
          )}

          {/* Upload Button */}
          {files.length > 0 && (
            <Button onClick={handleUpload} disabled={uploading || !datasetName.trim()} className="btn-primary w-full">
              {uploading ? (
                <>
                  <Loader size={20} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} className="mr-2" />
                  Upload & Validate
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
