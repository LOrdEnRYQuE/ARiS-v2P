'use client'

import { useState, useEffect } from 'react'
import { Server, Database, Network, Shield, Activity, AlertCircle } from 'lucide-react'

interface SystemStatusProps {
  status: {
    agents: Record<string, any>
    resources: Record<string, any>
    quality: Record<string, any>
  }
}

export function SystemStatus({ status }: SystemStatusProps) {
  const [systemHealth, setSystemHealth] = useState({
    overall: 'healthy',
    services: {
      database: { status: 'online', latency: 45 },
      api: { status: 'online', latency: 120 },
      agents: { status: 'online', active: 4 },
      monitoring: { status: 'online', uptime: '99.9%' }
    },
    alerts: [
      { id: 1, type: 'warning', message: 'High memory usage detected', time: '2 min ago' },
      { id: 2, type: 'info', message: 'New agent deployment completed', time: '5 min ago' }
    ]
  })

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-success-400'
      case 'warning': return 'text-warning-400'
      case 'critical': return 'text-error-400'
      default: return 'text-secondary-400'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-success-400'
      case 'offline': return 'text-error-400'
      case 'degraded': return 'text-warning-400'
      default: return 'text-secondary-400'
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-error-500 bg-error-500/10'
      case 'warning': return 'border-warning-500 bg-warning-500/10'
      case 'info': return 'border-primary-500 bg-primary-500/10'
      default: return 'border-secondary-500 bg-secondary-500/10'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-4 h-4 text-error-400" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-warning-400" />
      case 'info': return <Activity className="w-4 h-4 text-primary-400" />
      default: return <Activity className="w-4 h-4 text-secondary-400" />
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">System Status</h2>
        <p className="text-sm text-secondary-400">Overall system health and alerts</p>
      </div>
      
      {/* Overall Health */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-secondary-400">Overall Health</span>
          <span className={`text-sm font-medium ${getHealthColor(systemHealth.overall)}`}>
            {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
          </span>
        </div>
        <div className="w-full bg-secondary-600 rounded-full h-2">
          <div className="bg-success-500 h-2 rounded-full" style={{ width: '95%' }}></div>
        </div>
      </div>

      {/* Service Status */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-white">Service Status</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center space-x-2 p-2 bg-secondary-700 rounded">
            <Database className="w-4 h-4 text-primary-400" />
            <div className="flex-1">
              <div className="text-xs text-secondary-400">Database</div>
              <div className={`text-xs font-medium ${getStatusColor(systemHealth.services.database.status)}`}>
                {systemHealth.services.database.status}
              </div>
            </div>
            <div className="text-xs text-secondary-500">
              {systemHealth.services.database.latency}ms
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-secondary-700 rounded">
            <Network className="w-4 h-4 text-success-400" />
            <div className="flex-1">
              <div className="text-xs text-secondary-400">API</div>
              <div className={`text-xs font-medium ${getStatusColor(systemHealth.services.api.status)}`}>
                {systemHealth.services.api.status}
              </div>
            </div>
            <div className="text-xs text-secondary-500">
              {systemHealth.services.api.latency}ms
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-secondary-700 rounded">
            <Server className="w-4 h-4 text-warning-400" />
            <div className="flex-1">
              <div className="text-xs text-secondary-400">Agents</div>
              <div className={`text-xs font-medium ${getStatusColor(systemHealth.services.agents.status)}`}>
                {systemHealth.services.agents.status}
              </div>
            </div>
            <div className="text-xs text-secondary-500">
              {systemHealth.services.agents.active} active
            </div>
          </div>
          
          <div className="flex items-center space-x-2 p-2 bg-secondary-700 rounded">
            <Shield className="w-4 h-4 text-success-400" />
            <div className="flex-1">
              <div className="text-xs text-secondary-400">Monitoring</div>
              <div className={`text-xs font-medium ${getStatusColor(systemHealth.services.monitoring.status)}`}>
                {systemHealth.services.monitoring.status}
              </div>
            </div>
            <div className="text-xs text-secondary-500">
              {systemHealth.services.monitoring.uptime}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-secondary-700 rounded">
          <div className="text-lg font-mono text-primary-400">
            {Object.values(status.agents).filter((agent: any) => agent.status === 'active').length}
          </div>
          <div className="text-xs text-secondary-400">Active Agents</div>
        </div>
        
        <div className="text-center p-3 bg-secondary-700 rounded">
          <div className="text-lg font-mono text-success-400">
            {Math.round(status.quality.successRate)}%
          </div>
          <div className="text-xs text-secondary-400">Success Rate</div>
        </div>
        
        <div className="text-center p-3 bg-secondary-700 rounded">
          <div className="text-lg font-mono text-warning-400">
            ${status.resources.apiCosts.toFixed(2)}
          </div>
          <div className="text-xs text-secondary-400">API Costs</div>
        </div>
        
        <div className="text-center p-3 bg-secondary-700 rounded">
          <div className="text-lg font-mono text-secondary-400">
            {status.resources.tokenUsage.toLocaleString()}
          </div>
          <div className="text-xs text-secondary-400">Tokens Used</div>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h3 className="text-sm font-medium text-white mb-3">Recent Alerts</h3>
        <div className="space-y-2">
          {systemHealth.alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border-l-4 ${getAlertColor(alert.type)}`}
            >
              <div className="flex items-start space-x-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="text-sm text-white">{alert.message}</div>
                  <div className="text-xs text-secondary-400">{alert.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 