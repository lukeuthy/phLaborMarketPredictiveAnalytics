"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export function DataUpload() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [datasetName, setDatasetName] = useState("")
  const [datasetDescription, setDatasetDescription] = useState("")

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles((prev) => [...prev, ...droppedFiles])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)])
    }
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

    try {
      // Parse CSV file
      const file = files[0]
      const text = await file.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",")

      const data = lines.slice(1).map((line) => {
        const values = line.split(",")
        return {
          quarter: Number.parseInt(values[0]),
          year: Number.parseInt(values[1]),
          lfpr: Number.parseFloat(values[2]),
          employment_rate: Number.parseFloat(values[3]),
          unemployment_rate: Number.parseFloat(values[4]),
          underemployment_rate: Number.parseFloat(values[5]),
          sector: values[6] || "Overall",
        }
      })

      // Upload to backend
      const result = await apiClient.uploadData(data, {
        name: datasetName,
        description: datasetDescription,
        source: "PSA",
      })

      setSuccess(`Successfully uploaded ${result.recordsInserted} records!`)
      setFiles([])
      setDatasetName("")
      setDatasetDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Upload Data</h1>
        <p className="text-text-muted">Import labor market data from PSA or other sources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card className="card-hover border-2 border-dashed border-border hover:border-accent transition-colors">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex flex-col items-center justify-center py-12 cursor-pointer"
            >
              <Upload size={48} className="text-accent mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">Drop files here</h3>
              <p className="text-text-muted mb-4">or click to browse</p>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
                accept=".csv,.xlsx,.xls"
              />
              <label htmlFor="file-input">
                <Button as="span" className="btn-primary cursor-pointer">
                  <FileUp size={20} className="mr-2" />
                  Select Files
                </Button>
              </label>
            </div>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card className="card mt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Selected Files</h3>
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-success" />
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-text-muted">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                      className="text-error hover:text-error/80"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Dataset metadata form */}
          {files.length > 0 && (
            <Card className="card mt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Dataset Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Dataset Name</label>
                  <input
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    placeholder="e.g., Philippine Labor Force Survey 2024"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    value={datasetDescription}
                    onChange={(e) => setDatasetDescription(e.target.value)}
                    placeholder="Optional description..."
                    className="input-field"
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Supported Formats</h3>
            <ul className="space-y-2 text-text-muted text-sm">
              <li>✓ CSV (.csv)</li>
              <li>✓ Excel (.xlsx, .xls)</li>
              <li>✓ JSON (.json)</li>
            </ul>
          </Card>

          <Card className="card">
            <h3 className="text-lg font-bold text-foreground mb-4">Requirements</h3>
            <ul className="space-y-2 text-text-muted text-sm">
              <li>• Quarterly or monthly data</li>
              <li>• Date column required</li>
              <li>• 4 key indicators</li>
              <li>• Max 10 MB per file</li>
            </ul>
          </Card>

          {error && (
            <Card className="card border border-error/30 bg-error/5">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            </Card>
          )}

          {success && (
            <Card className="card border border-success/30 bg-success/5">
              <div className="flex gap-3">
                <CheckCircle size={20} className="text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{success}</p>
              </div>
            </Card>
          )}

          {files.length > 0 && (
            <Button onClick={handleUpload} disabled={uploading} className="btn-primary w-full">
              {uploading ? "Uploading..." : "Upload Files"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
