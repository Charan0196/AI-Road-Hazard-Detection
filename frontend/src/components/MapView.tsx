import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import type { HeatPoint, Report } from '../types'

const tileUrl = import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tileAttribution =
  import.meta.env.VITE_MAP_ATTRIBUTION ||
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export function MapView(props: { reports: Report[]; heat: HeatPoint[] }) {
  const { reports, heat } = props
  const elRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const heatRef = useRef<L.LayerGroup | null>(null)

  const center = useMemo(() => {
    const first = reports.find((r) => typeof r.latitude === 'number' && typeof r.longitude === 'number')
    if (first?.latitude != null && first?.longitude != null) return [first.latitude, first.longitude] as [number, number]
    return [20.5937, 78.9629] as [number, number]
  }, [reports])

  useEffect(() => {
    if (!elRef.current) return
    if (mapRef.current) return
    const map = L.map(elRef.current, { zoomControl: true }).setView(center, 5)
    L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19 }).addTo(map)
    markersRef.current = L.layerGroup().addTo(map)
    heatRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
  }, [center])

  useEffect(() => {
    const map = mapRef.current
    const markers = markersRef.current
    if (!map || !markers) return
    markers.clearLayers()

    for (const r of reports) {
      if (r.latitude == null || r.longitude == null) continue
      const label = r.detections[0]?.label || 'report'
      const count = r.detections.length
      const popup = `<div style="min-width:220px">
        <div style="font-weight:600;margin-bottom:6px">${label}</div>
        <div style="font-size:12px;opacity:.8">Detections: ${count}</div>
        <div style="font-size:12px;opacity:.8">Lat/Lng: ${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)}</div>
      </div>`
      L.marker([r.latitude, r.longitude]).bindPopup(popup).addTo(markers)
    }
  }, [reports])

  useEffect(() => {
    const heatLayer = heatRef.current
    if (!heatLayer) return
    heatLayer.clearLayers()

    for (const p of heat) {
      const radius = 50 + Math.min(250, p.weight * 40)
      L.circle([p.latitude, p.longitude], {
        radius,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.18,
        weight: 1,
      }).addTo(heatLayer)
    }
  }, [heat])

  return <div ref={elRef} style={{ height: 520, width: '100%', borderRadius: 12 }} />
}
