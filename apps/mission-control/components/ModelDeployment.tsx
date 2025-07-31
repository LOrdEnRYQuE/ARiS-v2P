'use client'

import { useState } from 'react'
import { Rocket, ArrowUp, ArrowDown, Clock, CheckCircle, AlertCircle, Settings } from 'lucide-react'

interface Deployment {
  id: string
  model: string
  version: string
  environment: 'production' | 'staging' | 'development'
  status: 'deploying' | 'active' | 'failed' | 'rolling-back'
  progress: number
  startTime: Date
  endTime?: Date
}

export function ModelDeployment() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      model: 'scriba-backend',
      version: '2.0.0',
      environment: 'production',
      status: 'active',
      progress: 100,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3000000)
    },
    {
      id: '2',
      model: 'auditor-quality',
      version: '3.1.0',
      environment: 'staging',
      status: 'deploying',
      progress: 75,
      startTime: new Date(Date.now() - 300000)
    },
    {
      id: '3',
      model: 'genesis-architect',
      version: '1.6.0',
      environment: 'development',
      status: 'failed',
      progress: 45,
      startTime: new Date(Date.now() - 1800000)
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-400'
      case 'deploying': return 'text-primary-400'
      case 'failed': return 'text-error-400'
      case 'rolling-back': return 'text-warning-400'
      default: return 'text-secondary-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-500/20'
      case 'deploying': return 'bg-primary-500/20'
      case 'failed': return 'bg-error-500/20'
      case 'rolling-back': return 'bg-warning-500/20'
      default: return 'bg-secondary-500/20'
    }
  }

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production': return 'text-error-400'
      case 'staging': return 'text-warning-400'
      case 'development': return 'text-primary-400'
      default: return 'text-secondary-400'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-500'
      case 'deploying': return 'bg-primary-500'
      case 'failed': return 'bg-error-500'
      case 'rolling-back': return 'bg-warning-500'
      default: return 'bg-secondary-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'deploying': return <Rocket className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      case 'rolling-back': return <ArrowDown className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Model Deployment</h2>
            <p className="text-sm text-secondary-400">Deploy and manage model versions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-secondary-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {deployments.map((deployment) => (
          <div key={deployment.id} className="p-4 bg-secondary-700 rounded-lg border border-secondary-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${getStatusBg(deployment.status)}`}>
                  {getStatusIcon(deployment.status)}
                </div>
                <div>
                  <h3 className="font-medium text-white">{deployment.model}</h3>
                  <p className="text-xs text-secondary-400">v{deployment.version}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBg(deployment.status)} ${getStatusColor(deployment.status)}`}>
                  {deployment.status.replace('-', ' ')}
                </span>
                <div className={`text-xs mt-1 ${getEnvironmentColor(deployment.environment)}`}>
                  {deployment.environment}
                </div>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="flex justify-between text-xs text-secondary-400 mb-1">
                <span>Progress</span>
                <span>{deployment.progress}%</span>
              </div>
              <div className="w-full bg-secondary-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(deployment.status)}`}
                  style={{ width: `${deployment.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-secondary-400">
              <span>Started: {deployment.startTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}</span>
              {deployment.endTime && (
                <span>Completed: {deployment.endTime.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}</span>
                )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">
            Active Deployments: {deployments.filter(d => d.status === 'active').length}
          </span>
          <span className="text-secondary-400">
            Total: {deployments.length}
          </span>
        </div>
      </div>
      
      <div className="mt-4 space-y-2">
        <button className="w-full p-3 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2">
          <Rocket className="w-4 h-4" />
          <span>Deploy New Model</span>
        </button>
        <button className="w-full p-3 bg-secondary-700 text-white rounded hover:bg-secondary-600 transition-colors flex items-center justify-center space-x-2">
          <ArrowUp className="w-4 h-4" />
          <span>Rollback Deployment</span>
        </button>
      </div>
    </div>
  )
} 