import './App.css'
import { useEffect, useMemo, useState } from 'react'

import { createReport, getAnalyticsSummary, getHeatmap, listReports } from './api'
import { MapView } from './components/MapView'
import type { AnalyticsSummary, Report } from './types'

function App() {
  const [tab, setTab] = useState<'upload' | 'map' | 'dashboard'>('upload')
  const [reports, setReports] = useState<Report[]>([])
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [heat, setHeat] = useState<{ latitude: number; longitude: number; weight: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reportsWithCoords = useMemo(
    () => reports.filter((r) => r.latitude != null && r.longitude != null),
    [reports],
  )

  async function refreshAll() {
    setLoading(true)
    setError(null)
    try {
      const [r, s, h] = await Promise.all([listReports(200), getAnalyticsSummary(), getHeatmap()])
      setReports(r)
      setSummary(s)
      setHeat(h)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">
          <div className="title">AI Road Hazard Detection</div>
          <div className="subtitle">Upload → Detect → Map → Analytics</div>
        </div>
        <nav className="tabs">
          <button className={tab === 'upload' ? 'tab active' : 'tab'} onClick={() => setTab('upload')}>
            Upload
          </button>
          <button className={tab === 'map' ? 'tab active' : 'tab'} onClick={() => setTab('map')}>
            Map
          </button>
          <button className={tab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setTab('dashboard')}>
            Dashboard
          </button>
        </nav>
        <button className="refresh" onClick={refreshAll} disabled={loading}>
          Refresh
        </button>
      </header>

      {error ? <div className="error">{error}</div> : null}

      <main className="content">
        {tab === 'upload' ? (
          <UploadPanel
            onUploaded={async () => {
              await refreshAll()
              setTab('map')
            }}
            loading={loading}
          />
        ) : null}

        {tab === 'map' ? (
          <section className="panel">
            <div className="panelHeader">
              <div className="panelTitle">Live Map</div>
              <div className="panelMeta">
                {reportsWithCoords.length} reports with coordinates • {summary?.total_detections ?? 0} detections
              </div>
            </div>
            <MapView reports={reportsWithCoords} heat={heat} />
          </section>
        ) : null}

        {tab === 'dashboard' ? (
          <section className="panel">
            <div className="panelHeader">
              <div className="panelTitle">Analytics</div>
              <div className="panelMeta">Persisted detections and class distribution</div>
            </div>
            <div className="grid">
              <div className="stat">
                <div className="statLabel">Total Reports</div>
                <div className="statValue">{summary?.total_reports ?? 0}</div>
              </div>
              <div className="stat">
                <div className="statLabel">Total Detections</div>
                <div className="statValue">{summary?.total_detections ?? 0}</div>
              </div>
            </div>

            <div className="split">
              <div className="card">
                <div className="cardTitle">By Class</div>
                <div className="table">
                  <div className="row head">
                    <div>Label</div>
                    <div className="right">Count</div>
                  </div>
                  {(summary?.by_label ?? []).map((x) => (
                    <div key={x.label} className="row">
                      <div>{x.label}</div>
                      <div className="right">{x.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="cardTitle">Recent Reports</div>
                <div className="table">
                  <div className="row head">
                    <div>ID</div>
                    <div>Detections</div>
                    <div className="right">Created</div>
                  </div>
                  {reports.slice(0, 10).map((r) => (
                    <div key={r.id} className="row">
                      <div className="mono">{r.id.slice(0, 8)}</div>
                      <div>{r.detections.length}</div>
                      <div className="right">{new Date(r.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section className="panel">
          <div className="panelHeader">
            <div className="panelTitle">Reports</div>
            <div className="panelMeta">Saved uploads and detections</div>
          </div>
          <div className="table">
            <div className="row head">
              <div>ID</div>
              <div>Media</div>
              <div>Coords</div>
              <div className="right">Detections</div>
            </div>
            {reports.slice(0, 50).map((r) => (
              <div key={r.id} className="row">
                <div className="mono">{r.id.slice(0, 8)}</div>
                <div className="mono">{r.media.filename}</div>
                <div className="mono">
                  {r.latitude != null && r.longitude != null
                    ? `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}`
                    : '—'}
                </div>
                <div className="right">{r.detections.length}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function UploadPanel(props: { onUploaded: () => void | Promise<void>; loading: boolean }) {
  const [file, setFile] = useState<File | null>(null)
  const [latitude, setLatitude] = useState<string>('')
  const [longitude, setLongitude] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const canUpload = file && !busy && !props.loading

  async function onSubmit() {
    if (!file) return
    setBusy(true)
    setMsg(null)
    try {
      const lat = latitude.trim() === '' ? undefined : Number(latitude)
      const lng = longitude.trim() === '' ? undefined : Number(longitude)
      const r = await createReport({ file, latitude: Number.isFinite(lat as number) ? lat : undefined, longitude: Number.isFinite(lng as number) ? lng : undefined })
      setMsg(`Saved report ${r.id.slice(0, 8)} with ${r.detections.length} detections`)
      await props.onUploaded()
      setFile(null)
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel">
      <div className="panelHeader">
        <div className="panelTitle">Upload Media</div>
        <div className="panelMeta">Add optional coordinates to place the hazard on the map</div>
      </div>

      <div className="form">
        <label className="field">
          <div className="fieldLabel">Image/Video</div>
          <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>

        <div className="row2">
          <label className="field">
            <div className="fieldLabel">Latitude</div>
            <input value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="e.g. 17.3850" />
          </label>
          <label className="field">
            <div className="fieldLabel">Longitude</div>
            <input value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="e.g. 78.4867" />
          </label>
        </div>

        <button className="primary" disabled={!canUpload} onClick={onSubmit}>
          {busy ? 'Uploading…' : 'Run Detection'}
        </button>

        {msg ? <div className="note">{msg}</div> : null}
      </div>
    </section>
  )
}

export default App
