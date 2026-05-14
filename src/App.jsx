import React, { useState } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ── Data generation ───────────────────────────────────────────────────────────
function generateData() {
  const start = new Date('2026-04-14')
  const rows = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const label = d.toISOString().slice(0, 10)
    const isTripOff = i >= 16 && i <= 21

    let normalRev = 0, normalLoss = 0, normalConv = 0
    let tripRev = 0, tripLoss = 0, tripConv = 0

    if (isTripOff) {
      const scale = i === 18 ? 10 : i === 17 || i === 19 ? 6 : i === 20 ? 4 : 3
      tripRev  = Math.round(20000 * scale + Math.random() * 5000)
      tripLoss = Math.round(tripRev * (0.03 + Math.random() * 0.04))
      tripConv = Math.round(800 * scale + Math.random() * 200)
    } else {
      normalRev  = Math.round(25000 + Math.random() * 30000)
      normalLoss = Math.round(normalRev * (0.03 + Math.random() * 0.04))
      normalConv = Math.round(300 + Math.random() * 200)
    }

    rows.push({ date: label, normalRev, normalLoss, normalConv, tripRev, tripLoss, tripConv })
  }
  return rows
}

const data = generateData()

const totalNormalRev = data.reduce((s, d) => s + d.normalRev, 0)
const totalTripRev   = data.reduce((s, d) => s + d.tripRev, 0)
const totalLoss      = data.reduce((s, d) => s + d.normalLoss + d.tripLoss, 0)
const avgDailyRev    = Math.round((totalNormalRev + totalTripRev) / data.length)
const totalConversions = data.reduce((s, d) => s + d.normalConv + d.tripConv, 0)

function fmt(n) {
  return '¥' + n.toLocaleString()
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null

  const get = (key) => {
    const p = payload.find(x => x.dataKey === key)
    return p ? p.value : 0
  }

  const normalRev  = get('normalRev')
  const normalLoss = get('normalLoss')
  const tripRev    = get('tripRev')
  const tripLoss   = get('tripLoss')
  const normalConv = get('normalConv')
  const tripConv   = get('tripConv')
  const totalRev   = normalRev + tripRev
  const totalConv  = normalConv + tripConv
  const totalL     = normalLoss + tripLoss

  return (
    <div className="tooltip-box">
      <div className="tooltip-date">{label}</div>

      <div className="tooltip-row" style={{ color: '#60a5fa' }}>
        <span>Normal Revenue:</span><span>{fmt(normalRev)}</span>
      </div>
      <div className="tooltip-row" style={{ color: '#60a5fa' }}>
        <span>Normal Conversions:</span><span>{normalConv}</span>
      </div>

      <div className="tooltip-row" style={{ color: '#a78bfa' }}>
        <span>Trip-off Revenue:</span><span>{fmt(tripRev)}</span>
      </div>
      <div className="tooltip-row" style={{ color: '#a78bfa' }}>
        <span>Trip-off Conversions:</span><span>{tripConv}</span>
      </div>

      <hr className="tooltip-divider" />
      <div className="tooltip-row tooltip-total">
        <span>Total Revenue:</span><span>{fmt(totalRev)}</span>
      </div>
      <div className="tooltip-row tooltip-total">
        <span>Total Conversions:</span><span>{totalConv}</span>
      </div>
      <div className="tooltip-row tooltip-total tooltip-loss">
        <span>Total Loss:</span><span>-{fmt(totalL)}</span>
      </div>
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────────────────
function CustomLegend() {
  const items = [
    { color: '#93c5fd', label: 'Normal Revenue (¥)' },
    { color: '#c4b5fd', label: 'Trip-off Revenue (¥)' },
    { color: '#e53e3e', label: 'Total Loss (¥)' },
    { color: '#1e3a5f', label: 'Normal Conversions' },
    { color: '#7c3aed', label: 'Trip-off Conversions' },
  ]
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginTop: '8px', fontSize: '12px', color: '#555' }}>
      {items.map(({ color, label }) => (
        <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
          {label}
        </span>
      ))}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="card">
      <div className="chart-title">Daily Performance Trend</div>
      <div className="chart-subtitle">Apr 14 – May 13, 2026</div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="label">Total Revenue</div>
          <div className="value">{fmt(totalNormalRev + totalTripRev)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Average Daily Revenue</div>
          <div className="value">{fmt(avgDailyRev)}</div>
        </div>
        <div className="summary-card loss">
          <div className="label">Total Loss (Total Refund)</div>
          <div className="value">-{fmt(totalLoss)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Total Conversions</div>
          <div className="value">{totalConversions.toLocaleString()}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={data} margin={{ top: 10, right: 60, left: 10, bottom: 0 }} barGap={0} barCategoryGap="0%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#999' }}
            tickFormatter={v => v.slice(5)}
            interval={1}
            angle={-45}
            textAnchor="end"
            height={50}
          />
          <YAxis
            yAxisId="rev"
            orientation="left"
            tick={{ fontSize: 10, fill: '#999' }}
            tickFormatter={v => v === 0 ? '0' : (v / 1000) + 'k'}
            label={{ value: 'Revenue (¥)', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fill: '#aaa' } }}
          />
          <YAxis
            yAxisId="conv"
            orientation="right"
            tick={{ fontSize: 10, fill: '#999' }}
            label={{ value: 'Conversions', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11, fill: '#aaa' } }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar yAxisId="rev" dataKey="normalRev"  stackId="normal"  fill="#93c5fd" name="Normal Revenue (¥)" />
          <Bar yAxisId="rev" dataKey="normalLoss" stackId="normal"  fill="#e53e3e" name="Normal Loss (¥)" />

          <Bar yAxisId="rev" dataKey="tripRev"    stackId="tripoff" fill="#c4b5fd" name="Trip-off Revenue (¥)" />
          <Bar yAxisId="rev" dataKey="tripLoss"   stackId="tripoff" fill="#e53e3e" name="Trip-off Loss (¥)" />

          <Line yAxisId="conv" type="monotone" dataKey="normalConv" stroke="#1e3a5f" strokeWidth={2} dot={false} name="Normal Conversions" />
          <Line yAxisId="conv" type="monotone" dataKey="tripConv"   stroke="#7c3aed" strokeWidth={2} dot={false} name="Trip-off Conversions" />
        </ComposedChart>
      </ResponsiveContainer>

      <CustomLegend />
    </div>
  )
}
