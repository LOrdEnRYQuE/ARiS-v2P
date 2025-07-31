'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, Cpu, HardDrive, Activity, Database } from 'lucide-react'

interface Resources {
  apiCosts: number
  modelLatency: number
  tokenUsage: number
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
}

interface ResourceMonitoringProps {
  resources: Resources
}

export function ResourceMonitoring({ resources }: ResourceMonitoringProps) {
  const [chartData, setChartData] = useState<Array<{
    time: string
    apiCosts: number
    latency: number
    tokens: number
    cpu: number
    memory: number
    disk: number
  }>>([])

  useEffect(() => {
    const now = new Date()
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    
    setChartData(prev => [
      ...prev.slice(-19), // Keep last 20 data points
      {
        time: timeString,
        apiCosts: resources.apiCosts,
        latency: resources.modelLatency,
        tokens: resources.tokenUsage,
        cpu: resources.cpuUsage,
        memory: resources.memoryUsage,
        disk: resources.diskUsage
      }
    ])
  }, [resources])

  const formatValue = (value: number, type: string) => {
    switch (type) {
      case 'cost':
        return `$${value.toFixed(2)}`
      case 'latency':
        return `${value.toFixed(0)}ms`
      case 'tokens':
        return value.toLocaleString()
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toString()
    }
  }

  const getStatusColor = (value: number, threshold: number) => {
    if (value > threshold * 0.8) return 'text-error-400'
    if (value > threshold * 0.6) return 'text-warning-400'
    return 'text-success-400'
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Resource Monitoring</h2>
        <p className="text-sm text-secondary-400">Live system performance metrics</p>
      </div>
      
      <div className="space-y-6">
        {/* API Costs Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">API Costs</h3>
            <span className={`text-sm font-mono ${getStatusColor(resources.apiCosts, 1.0)}`}>
              {formatValue(resources.apiCosts, 'cost')}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="apiCosts"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Latency Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Model Latency</h3>
            <span className={`text-sm font-mono ${getStatusColor(resources.modelLatency, 2000)}`}>
              {formatValue(resources.modelLatency, 'latency')}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Token Usage Chart */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white">Token Usage</h3>
            <span className={`text-sm font-mono ${getStatusColor(resources.tokenUsage, 50000)}`}>
              {formatValue(resources.tokenUsage, 'tokens')}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={chartData}>
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Resources */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Cpu className="w-4 h-4 text-primary-400 mr-1" />
              <span className="text-xs text-secondary-400">CPU</span>
            </div>
            <div className={`text-lg font-mono ${getStatusColor(resources.cpuUsage, 80)}`}>
              {formatValue(resources.cpuUsage, 'percentage')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Database className="w-4 h-4 text-warning-400 mr-1" />
              <span className="text-xs text-secondary-400">Memory</span>
            </div>
            <div className={`text-lg font-mono ${getStatusColor(resources.memoryUsage, 80)}`}>
              {formatValue(resources.memoryUsage, 'percentage')}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <HardDrive className="w-4 h-4 text-success-400 mr-1" />
              <span className="text-xs text-secondary-400">Disk</span>
            </div>
            <div className={`text-lg font-mono ${getStatusColor(resources.diskUsage, 80)}`}>
              {formatValue(resources.diskUsage, 'percentage')}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">Data Points: {chartData.length}</span>
          <span className="text-secondary-400">
            <Activity className="w-4 h-4 inline mr-1" />
            Live Updates
          </span>
        </div>
      </div>
    </div>
  )
} 