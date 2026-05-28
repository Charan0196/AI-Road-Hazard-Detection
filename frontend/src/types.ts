export type Detection = {
  id: string
  label: string
  confidence: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export type Media = {
  id: string
  filename: string
  content_type: string
  url: string
}

export type Report = {
  id: string
  latitude: number | null
  longitude: number | null
  created_at: string
  media: Media
  detections: Detection[]
}

export type LabelCount = {
  label: string
  count: number
}

export type AnalyticsSummary = {
  total_reports: number
  total_detections: number
  by_label: LabelCount[]
}

export type HeatPoint = {
  latitude: number
  longitude: number
  weight: number
}

