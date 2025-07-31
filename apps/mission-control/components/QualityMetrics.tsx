'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { Shield, CheckCircle, AlertTriangle, RotateCcw, Clock } from 'lucide-react'

interface Quality {
  successRate: number
  errorRate: number
  selfCorrections: number
  averageResponseTime: number
}

interface QualityMetricsProps {
  quality: Quality
}

export function QualityMetrics({ quality }: QualityMetricsProps) {
  const [errorTypes, setErrorTypes] = useState([
    { type: 'Syntax Errors', count: 12, percentage: 35 },
    { type: 'Logic Errors', count: 8, percentage: 23 },
    { type: 'Performance Issues', count: 6, percentage: 17 },
    { type: 'Security Vulnerabilities', count: 5, percentage: 14 },
    { type: 'Code Style', count: 4, percentage: 11 }
  ])

  const [correctionHistory, setCorrectionHistory] = useState([
    { day: 'Mon', corrections: 2 },
    { day: 'Tue', corrections: 1 },
    { day: 'Wed', corrections: 3 },
    { day: 'Thu', corrections: 0 },
    { day: 'Fri', corrections: 2 },
    { day: 'Sat', corrections: 1 },
    { day: 'Sun', corrections: 1 }
  ])

  const pieData = [
    { name: 'Success', value: quality.successRate, color: '#10b981' },
    { name: 'Errors', value: quality.errorRate, color: '#ef4444' }
  ]

  const getStatusColor = (value: number, threshold: number) => {
    if (value >= threshold) return 'text-success-400'
    if (value >= threshold * 0.8) return 'text-warning-400'
    return 'text-error-400'
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Quality Metrics</h2>
        <p className="text-sm text-secondary-400">Auditor performance and code quality insights</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate Overview */}
        <div>
          <h3 className="text-sm font-medium text-white mb-4">Success Rate Overview</h3>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-400">Success Rate</span>
                  <span className={`text-lg font-mono ${getStatusColor(quality.successRate, 90)}`}>
                    {quality.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-400">Error Rate</span>
                  <span className="text-lg font-mono text-error-400">
                    {quality.errorRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-secondary-400">Avg Response Time</span>
                  <span className={`text-lg font-mono ${getStatusColor(quality.averageResponseTime, 3)}`}>
                    {formatTime(quality.averageResponseTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Types Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-white mb-4">Error Types Breakdown</h3>
          <div className="space-y-3">
            {errorTypes.map((error, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-error-400"></div>
                  <span className="text-sm text-white">{error.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-400">{error.count}</span>
                  <span className="text-xs text-secondary-500">({error.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Self-Correction History */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white">Self-Correction History</h3>
          <div className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-secondary-400">
              Total: {correctionHistory.reduce((sum, day) => sum + day.corrections, 0)}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={correctionHistory}>
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Bar dataKey="corrections" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quality Indicators */}
      <div className="mt-6 pt-4 border-t border-secondary-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-success-400 mr-2" />
              <span className="text-xs text-secondary-400">Quality Score</span>
            </div>
            <div className="text-lg font-mono text-success-400">
              {Math.round(quality.successRate)}%
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-5 h-5 text-primary-400 mr-2" />
              <span className="text-xs text-secondary-400">Passed Checks</span>
            </div>
            <div className="text-lg font-mono text-primary-400">
              {Math.round(quality.successRate * 0.8)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="w-5 h-5 text-warning-400 mr-2" />
              <span className="text-xs text-secondary-400">Issues Found</span>
            </div>
            <div className="text-lg font-mono text-warning-400">
              {Math.round(quality.errorRate * 2)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-secondary-400 mr-2" />
              <span className="text-xs text-secondary-400">Avg Time</span>
            </div>
            <div className="text-lg font-mono text-secondary-400">
              {formatTime(quality.averageResponseTime)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 