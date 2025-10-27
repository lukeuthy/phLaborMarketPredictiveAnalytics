const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ApiResponse<T> {
  success?: boolean
  error?: string
  data?: T
  [key: string]: any
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[API ERROR]", error)
      throw error
    }
  }

  // Data endpoints
  async uploadData(data: any, metadata: any) {
    return this.request("/data/upload", {
      method: "POST",
      body: JSON.stringify({ data, metadata }),
    })
  }

  async getDatasets() {
    return this.request("/data/datasets")
  }

  async getDataset(id: string) {
    return this.request(`/data/datasets/${id}`)
  }

  async getDatasetSummary(id: string) {
    return this.request(`/data/datasets/${id}/summary`)
  }

  async deleteDataset(id: string) {
    return this.request(`/data/datasets/${id}`, { method: "DELETE" })
  }

  async exportDataset(id: string) {
    const response = await fetch(`${this.baseUrl}/data/datasets/${id}/export`)
    return response.blob()
  }

  // Preprocessing endpoints
  async startPreprocessing(datasetId: string) {
    return this.request("/preprocessing/start/" + datasetId, { method: "POST" })
  }

  async getPreprocessingStatus(datasetId: string) {
    return this.request(`/preprocessing/status/${datasetId}`)
  }

  async updatePreprocessingStep(stepId: string, status: string, details: any) {
    return this.request(`/preprocessing/step/${stepId}`, {
      method: "PUT",
      body: JSON.stringify({ status, details }),
    })
  }

  // Processing endpoints
  async compareAlgorithms(datasetId: string, algorithms: string[], parameters: any) {
    return this.request("/processing/compare", {
      method: "POST",
      body: JSON.stringify({ datasetId, algorithms, parameters }),
    })
  }

  async getProcessingResults(resultId: string) {
    return this.request(`/processing/results/${resultId}`)
  }

  // Analytics endpoints
  async getAnalytics(datasetId: string) {
    return this.request(`/analytics/dataset/${datasetId}`)
  }

  async getSectorAnalysis(datasetId: string) {
    return this.request(`/analytics/sectors/${datasetId}`)
  }

  // Health check
  async healthCheck() {
    return this.request("/health")
  }
}

export const apiClient = new ApiClient()
