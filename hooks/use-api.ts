"use client"

import { useState, useCallback } from "react"
import { apiClient } from "@/lib/api-client"

export function useApi<T>(apiCall: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true)
      setError(null)

      try {
        const result = await apiCall(...args)
        setData(result)
        return result
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred"
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiCall],
  )

  return { data, loading, error, execute }
}

export function useDatasets() {
  const { data, loading, error, execute } = useApi(apiClient.getDatasets.bind(apiClient))

  const refresh = useCallback(async () => {
    await execute()
  }, [execute])

  return { datasets: data, loading, error, refresh }
}

export function useDataset(id: string) {
  const { data, loading, error, execute } = useApi(() => apiClient.getDataset(id))

  const refresh = useCallback(async () => {
    await execute()
  }, [execute])

  return { dataset: data, loading, error, refresh }
}

export function useUploadData() {
  const { loading, error, execute } = useApi(apiClient.uploadData.bind(apiClient))

  return { loading, error, upload: execute }
}

export function useAlgorithmComparison() {
  const { data, loading, error, execute } = useApi(apiClient.compareAlgorithms.bind(apiClient))

  return { results: data, loading, error, compare: execute }
}

export function useAnalytics(datasetId: string) {
  const { data, loading, error, execute } = useApi(() => apiClient.getAnalytics(datasetId))

  const refresh = useCallback(async () => {
    await execute()
  }, [execute])

  return { analytics: data, loading, error, refresh }
}
