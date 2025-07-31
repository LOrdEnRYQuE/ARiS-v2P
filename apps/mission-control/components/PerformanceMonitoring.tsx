'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingDown, AlertTriangle, RefreshCw, Activity, Target } from 'lucide-react'

interface Performance {
  modelDrift: number
  retrainingTriggered: boolean
  lastRetraining: Date
  dataQuality: number
  modelHealth: string
}

interface PerformanceMonitoringProps {
  performance: Performance
}

export function PerformanceMonitoring({ performance }: PerformanceMonitoringProps) {
  const [driftData, setDriftData] = useState<Array<{
    date: string
    drift: number
    threshold: number
  }>>([])

  const [qualityData, setQualityData] = useState<Array<{
    date: string
    quality: number
    threshold: number
  }>>([])

  useEffect(() => {
    // Generate sample drift data
    const now = new Date()
    const driftHistory = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      return {
        date: date.toLocaleDateString(),
        drift: 1.5 + Math.random() * 3 + (i > 20 ? 2 : 0), // Simulate increasing drift
        threshold: 5
      }
    })
    setDriftData(driftHistory)

    // Generate sample quality data
    const qualityHistory = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      return {
        date: date.toLocaleDateString(),
        quality: 95 + Math.random() * 5 - (i > 20 ? 3 : 0), // Simulate decreasing quality
        threshold: 90
      }
    })
    setQualityData(qualityHistory)
  }, [])

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-success-400'
      case 'good': return 'text-warning-400'
      case 'poor': return 'text-error-400'
      default: return 'text-secondary-400'
    }
  }

  const getDriftColor = (drift: number, threshold: number) => {
    if (drift > threshold) return 'text-error-400'
    if (drift > threshold * 0.8) return 'text-warning-400'
    return 'text-success-400'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString()
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Performance Monitoring</h2>
        <p className="text-sm text-secondary-400">Model drift detection and automated retraining</p>
      </div>
      
      <div className="space-y-6">
        {/* Model Drift Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Model Drift</h3>
            <span className={`text-sm font-mono ${getDriftColor(performance.modelDrift, 5)}`}>
              {performance.modelDrift.toFixed(1)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={driftData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Area
                type="monotone"
                dataKey="drift"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Data Quality Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Data Quality</h3>
            <span className={`text-sm font-mono ${performance.dataQuality >= 95 ? 'text-success-400' : 'text-warning-400'}`}>
              {performance.dataQuality.toFixed(1)}%
            </span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Area
                type="monotone"
                dataKey="quality"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-secondary-700 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-primary-400" />
              <span className="text-xs text-secondary-400">Model Health</span>
            </div>
            <div className={`text-lg font-mono ${getHealthColor(performance.modelHealth)}`}>
              {performance.modelHealth.charAt(0).toUpperCase() + performance.modelHealth.slice(1)}
            </div>
          </div>
          
          <div className="p-3 bg-secondary-700 rounded">
            <div className="flex items-center space-x-2 mb-2">
              <RefreshCw className="w-4 h-4 text-warning-400" />
              <span className="text-xs text-secondary-400">Last Retraining</span>
            </div>
            <div className="text-sm font-mono text-white">
              {formatDate(performance.lastRetraining)}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Monitoring Alerts</h3>
          <div className="space-y-2">
            {performance.modelDrift > 5 && (
              <div className="p-3 rounded border-l-4 border-error-500 bg-error-500/10">
                <div className="flex items-start space-x-2">
                  <TrendingDown className="w-4 h-4 text-error-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-white">High model drift detected</div>
                    <div className="text-xs text-secondary-400">
                      Drift: {performance.modelDrift.toFixed(1)}% (threshold: 5%)
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {performance.retrainingTriggered && (
              <div className="p-3 rounded border-l-4 border-warning-500 bg-warning-500/10">
                <div className="flex items-start space-x-2">
                  <RefreshCw className="w-4 h-4 text-warning-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-white">Automated retraining triggered</div>
                    <div className="text-xs text-secondary-400">
                      New model version will be deployed soon
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {performance.dataQuality < 95 && (
              <div className="p-3 rounded border-l-4 border-warning-500 bg-warning-500/10">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-warning-400 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-white">Data quality below threshold</div>
                    <div className="text-xs text-secondary-400">
                      Quality: {performance.dataQuality.toFixed(1)}% (threshold: 95%)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">
            <Activity className="w-4 h-4 inline mr-1" />
            Live Monitoring
          </span>
          <span className="text-secondary-400">
            Auto-retraining: {performance.retrainingTriggered ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  )
} 