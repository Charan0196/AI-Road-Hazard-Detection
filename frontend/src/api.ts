import type { AnalyticsSummary, HeatPoint, Report } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return (await res.json()) as T
}

export async function createReport(input: {
  file: File
  latitude?: number
  longitude?: number
}): Promise<Report> {
  const fd = new FormData()
  fd.append('file', input.file)
  if (typeof input.latitude === 'number') fd.append('latitude', String(input.latitude))
  if (typeof input.longitude === 'number') fd.append('longitude', String(input.longitude))
  return jsonFetch<Report>('/api/reports', { method: 'POST', body: fd })
}

export async function listReports(limit = 50): Promise<Report[]> {
  return jsonFetch<Report[]>(`/api/reports?limit=${encodeURIComponent(String(limit))}`)
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return jsonFetch<AnalyticsSummary>('/api/analytics/summary')
}

export async function getHeatmap(): Promise<HeatPoint[]> {
  return jsonFetch<HeatPoint[]>('/api/analytics/heatmap')
}

