'use client'

import React, { useState } from 'react'
import {
  EnvironmentSelect,
  DateRangePicker,
  RefreshButton,
  ExportButton,
} from '@/components/filtering'
import { PipelineMetricCards } from '@/components/pipleline-data/PipelineMetricCards'
import { useOverviewData } from '@/hooks/useOverviewData'
import {
  Clock,
  Database,
  ShieldCheck,
  GitBranch,
  Fingerprint,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Activity,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import Link from 'next/link'

// Mocked realistic 24-hour time-series data for the 3 charts
const runsOverTimeData = [
  { time: '12 AM', success: 120, failed: 4, running: 8, cancelled: 2 },
  { time: '2 AM', success: 95, failed: 2, running: 5, cancelled: 1 },
  { time: '4 AM', success: 140, failed: 6, running: 12, cancelled: 3 },
  { time: '6 AM', success: 180, failed: 8, running: 20, cancelled: 4 },
  { time: '8 AM', success: 220, failed: 12, running: 25, cancelled: 5 },
  { time: '10 AM', success: 240, failed: 10, running: 30, cancelled: 6 },
  { time: '12 PM', success: 210, failed: 7, running: 22, cancelled: 3 },
  { time: '2 PM', success: 195, failed: 5, running: 18, cancelled: 2 },
  { time: '4 PM', success: 230, failed: 11, running: 28, cancelled: 4 },
  { time: '6 PM', success: 205, failed: 9, running: 24, cancelled: 3 },
  { time: '8 PM', success: 170, failed: 6, running: 16, cancelled: 2 },
  { time: '10 PM', success: 150, failed: 3, running: 10, cancelled: 1 },
]

const successRateData = [
  { time: '12 AM', rate: 94.2 },
  { time: '2 AM', rate: 96.5 },
  { time: '4 AM', rate: 91.0 },
  { time: '6 AM', rate: 93.8 },
  { time: '8 AM', rate: 95.2 },
  { time: '10 AM', rate: 97.4 },
  { time: '12 PM', rate: 96.1 },
  { time: '2 PM', rate: 95.0 },
  { time: '4 PM', rate: 94.8 },
  { time: '6 PM', rate: 96.2 },
  { time: '8 PM', rate: 97.8 },
  { time: '10 PM', rate: 98.1 },
]

const incidentsData = [
  { time: '12 AM', high: 0, medium: 1, low: 2 },
  { time: '2 AM', high: 0, medium: 0, low: 1 },
  { time: '4 AM', high: 1, medium: 1, low: 3 },
  { time: '6 AM', high: 2, medium: 3, low: 5 },
  { time: '8 AM', high: 1, medium: 4, low: 8 },
  { time: '10 AM', high: 3, medium: 5, low: 10 },
  { time: '12 PM', high: 1, medium: 2, low: 6 },
  { time: '2 PM', high: 0, medium: 2, low: 4 },
  { time: '4 PM', high: 2, medium: 3, low: 7 },
  { time: '6 PM', high: 1, medium: 2, low: 5 },
  { time: '8 PM', high: 0, medium: 1, low: 3 },
  { time: '10 PM', high: 0, medium: 0, low: 1 },
]

const defaultPillars = [
  { id: 'freshness', name: 'Freshness', score: 92.1, delta: '+2.7%', status: 'Good', icon: Clock, color: 'text-sky-500' },
  { id: 'volume', name: 'Volume', score: 95.3, delta: '+1.8%', status: 'Good', icon: Database, color: 'text-indigo-500' },
  { id: 'quality', name: 'Data Quality', score: 90.2, delta: '+3.1%', status: 'Good', icon: ShieldCheck, color: 'text-emerald-500' },
  { id: 'schema', name: 'Schema', score: 93.0, delta: '+1.2%', status: 'Good', icon: GitBranch, color: 'text-violet-500' },
  { id: 'consistency', name: 'Consistency', score: 91.1, delta: '+2.5%', status: 'Good', icon: Layers, color: 'text-amber-500' },
  { id: 'uniqueness', name: 'Uniqueness', score: 89.2, delta: '-0.6%', status: 'Warning', icon: Fingerprint, color: 'text-teal-500' },
]

const recentIncidentsList = [
  {
    id: 1,
    title: 'Freshness issue in sales_daily_summary',
    desc: 'Table not updated in the expected time window',
    severity: 'High',
    timeAgo: '10m ago',
    severityColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 2,
    title: 'Volume drop in marketing_campaign_performance',
    desc: 'Row count dropped by 62% vs baseline',
    severity: 'Medium',
    timeAgo: '20m ago',
    severityColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 3,
    title: 'Data quality issue in finance.transactions',
    desc: 'Null values in amount column > 5%',
    severity: 'Medium',
    timeAgo: '35m ago',
    severityColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 4,
    title: 'Schema change detected in customers',
    desc: 'New column customer_tier added',
    severity: 'Low',
    timeAgo: '1h ago',
    severityColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  {
    id: 5,
    title: 'Pipeline failure in inventory_update',
    desc: 'Snowflake warehouse connection timeout',
    severity: 'Low',
    timeAgo: '2h ago',
    severityColor: 'bg-sky-50 text-sky-700 border-sky-200',
  },
]

export default function Overview() {
  const [selectedEnv, setSelectedEnv] = useState('Production')
  const [selectedDateRange, setSelectedDateRange] = useState<string>('24h')

  const { data: overviewData, loading, refetch } = useOverviewData(
    selectedDateRange || '24h',
    15000
  )

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    alert('Exporting Overview Observability Report...')
  }

  // Map API pillars if present, else use rich default baseline
  const activePillars =
    overviewData?.pillars && overviewData.pillars.length > 0
      ? overviewData.pillars.map((p, idx) => ({
          id: p.id,
          name: p.name || p.id,
          score: p.score ?? (defaultPillars[idx]?.score || 90.0),
          delta: defaultPillars[idx]?.delta || '+1.5%',
          status: p.status || 'Good',
          icon: defaultPillars[idx]?.icon || ShieldCheck,
          color: defaultPillars[idx]?.color || 'text-emerald-500',
        }))
      : defaultPillars

  // Map live pipelines
  const activePipelines =
    overviewData?.pipelines && overviewData.pipelines.length > 0
      ? overviewData.pipelines.map((p) => ({
          name: p.pipeline_name,
          status: p.status || 'Success',
          runs: 1,
          successRate: '100.0%',
          avgDuration: p.duration || '15s',
        }))
      : [
          { name: 'inventory_etl', status: 'Success', runs: 1, successRate: '100.0%', avgDuration: '15s' },
          { name: 'users_sync_pipeline', status: 'Success', runs: 28, successRate: '96.4%', avgDuration: '6m 12s' },
          { name: 'monthly_aggregation_pipeline', status: 'Success', runs: 24, successRate: '95.8%', avgDuration: '12m 45s' },
          { name: 'data_ingestion_pipeline', status: 'Running', runs: 18, successRate: '88.9%', avgDuration: '8m 33s' },
          { name: 'marketing_pipeline', status: 'Failed', runs: 12, successRate: '66.7%', avgDuration: '15m 21s' },
          { name: 'finance_reporting_pipeline', status: 'Success', runs: 10, successRate: '90.0%', avgDuration: '7m 18s' },
        ]

  return (
    <div className="p-6 bg-slate-50/70 min-h-screen text-slate-800 space-y-5">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time health summary of your data ecosystem
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <EnvironmentSelect value={selectedEnv} onChange={setSelectedEnv} />
          <DateRangePicker onRangeChange={(range) => setSelectedDateRange(range || '24h')} />
          <RefreshButton onRefresh={handleRefresh} />
          <ExportButton onClick={handleExport} />
        </div>
      </div>

      {/* 2. Top 5 Metric Cards */}
      <PipelineMetricCards preset={selectedDateRange || '24h'} />

      {/* 3. Middle Section: 3 Live Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Pipeline Runs Over Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Pipeline Runs Over Time</h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Last 24 Hours
            </span>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={runsOverTimeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                  iconSize={8}
                />
                <Bar dataKey="success" name="Success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" name="Failed" stackId="a" fill="#ef4444" />
                <Bar dataKey="running" name="Running" stackId="a" fill="#3b82f6" />
                <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill="#94a3b8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pipeline Success Rate Over Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Pipeline Success Rate Over Time</h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Last 24 Hours
            </span>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={successRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip />
                <Area type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#emeraldGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Incidents Over Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-900">Incidents Over Time</h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Last 24 Hours
            </span>
          </div>

          <div className="h-48 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                  iconSize={8}
                />
                <Bar dataKey="high" name="High" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#f97316" />
                <Bar dataKey="low" name="Low" stackId="a" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: 3 Equal Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Data Observability Health */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Data Observability Health</span>
              </h3>
              <Link href="/freshness" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
            </div>

            <div className="mt-3 divide-y divide-slate-100/80">
              {activePillars.map((p) => {
                const IconComponent = p.icon
                const isGood = p.status === 'Good'
                return (
                  <div key={p.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 w-32 shrink-0">
                      <IconComponent className={`w-4 h-4 ${p.color}`} />
                      <span className="font-semibold text-slate-700 capitalize">{p.name}</span>
                    </div>

                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isGood ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(100, p.score)}%` }}
                        />
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 text-xs">{p.score.toFixed(1)}%</span>
                        <span className="text-[10px] text-emerald-600 font-semibold ml-1">{p.delta}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                        isGood
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Panel 2: Recent Incidents */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recent Incidents</h3>
              <Link href="/incidents" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
            </div>

            <div className="mt-3 space-y-3">
              {recentIncidentsList.map((inc) => (
                <div key={inc.id} className="flex items-start justify-between gap-2.5 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight text-xs">{inc.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{inc.desc}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${inc.severityColor}`}>
                      {inc.severity}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{inc.timeAgo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <Link
              href="/incidents"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View all incidents</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Panel 3: Pipeline Monitoring */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Pipeline Monitoring</h3>
              <Link href="/pipelines" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">
                View all
              </Link>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1">
                  <tr>
                    <th className="pb-2">Pipeline</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Runs</th>
                    <th className="pb-2 text-right">Success</th>
                    <th className="pb-2 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-medium">
                  {activePipelines.map((pipe, i) => {
                    const isSucc = pipe.status.toLowerCase() === 'success'
                    const isRun = pipe.status.toLowerCase() === 'running'
                    return (
                      <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 font-bold text-slate-900 pr-2">{pipe.name}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSucc
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isRun
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {pipe.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right text-slate-700 font-semibold">{pipe.runs}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-600">{pipe.successRate}</td>
                        <td className="py-2.5 text-right text-slate-500">{pipe.avgDuration}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3">
            <Link
              href="/pipelines"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View all pipelines</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
