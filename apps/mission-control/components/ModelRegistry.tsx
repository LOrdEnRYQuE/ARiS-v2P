'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, Download, Upload, Settings, Activity } from 'lucide-react'

interface Model {
  version: string
  status: 'active' | 'testing' | 'deprecated' | 'training'
  performance: number
  deployment: 'production' | 'staging' | 'development'
  lastUpdated: Date
  usage: number
  accuracy: number
}

interface ModelRegistryProps {
  models: Record<string, Model>
}

export function ModelRegistry({ models }: ModelRegistryProps) {
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-400'
      case 'testing': return 'text-warning-400'
      case 'deprecated': return 'text-error-400'
      case 'training': return 'text-primary-400'
      default: return 'text-secondary-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-500/20'
      case 'testing': return 'bg-warning-500/20'
      case 'deprecated': return 'bg-error-500/20'
      case 'training': return 'bg-primary-500/20'
      default: return 'bg-secondary-500/20'
    }
  }

  const getDeploymentColor = (deployment: string) => {
    switch (deployment) {
      case 'production': return 'text-success-400'
      case 'staging': return 'text-warning-400'
      case 'development': return 'text-primary-400'
      default: return 'text-secondary-400'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-success-400'
    if (performance >= 90) return 'text-warning-400'
    return 'text-error-400'
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Model Registry</h2>
            <p className="text-sm text-secondary-400">Fine-tuned AI models and versions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-secondary-400 hover:text-white transition-colors">
              <Upload className="w-4 h-4" />
            </button>
            <button className="p-2 text-secondary-400 hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-secondary-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(models).map(([modelName, model]) => (
          <motion.div
            key={modelName}
            className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
              selectedModel === modelName ? 'border-primary-500 bg-primary-500/10' : 'border-secondary-600 bg-secondary-700'
            }`}
            onClick={() => setSelectedModel(selectedModel === modelName ? null : modelName)}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${getStatusBg(model.status)}`}>
                  <Brain className={`w-5 h-5 ${getStatusColor(model.status)}`} />
                </div>
                <div>
                  <h3 className="font-medium text-white capitalize">
                    {modelName.replace('-', ' ')}
                  </h3>
                  <p className="text-xs text-secondary-400">v{model.version}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBg(model.status)} ${getStatusColor(model.status)}`}>
                  {model.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs text-secondary-400">Performance</div>
                <div className={`text-sm font-mono ${getPerformanceColor(model.performance)}`}>
                  {model.performance.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-400">Accuracy</div>
                <div className="text-sm font-mono text-success-400">
                  {model.accuracy.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-400">Usage</div>
                <div className="text-sm font-mono text-primary-400">
                  {model.usage.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-400">Deployment</div>
                <div className={`text-sm font-mono ${getDeploymentColor(model.deployment)}`}>
                  {model.deployment}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-secondary-400">
              <span>Updated: {model.lastUpdated.toLocaleDateString()}</span>
              <div className="flex items-center space-x-1">
                <Activity className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {selectedModel && (
        <div className="mt-4 p-4 bg-secondary-700 rounded-lg border border-secondary-600">
          <h3 className="text-sm font-medium text-white mb-2">
            Model Details: {selectedModel.replace('-', ' ')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-secondary-400">Version:</span>
              <div className="font-mono text-white">v{models[selectedModel].version}</div>
            </div>
            <div>
              <span className="text-secondary-400">Status:</span>
              <div className={`font-mono ${getStatusColor(models[selectedModel].status)}`}>
                {models[selectedModel].status}
              </div>
            </div>
            <div>
              <span className="text-secondary-400">Deployment:</span>
              <div className={`font-mono ${getDeploymentColor(models[selectedModel].deployment)}`}>
                {models[selectedModel].deployment}
              </div>
            </div>
            <div>
              <span className="text-secondary-400">Usage:</span>
              <div className="font-mono text-white">
                {models[selectedModel].usage.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">
            Total Models: {Object.keys(models).length}
          </span>
          <span className="text-secondary-400">
            Active: {Object.values(models).filter(m => m.status === 'active').length}
          </span>
        </div>
      </div>
    </div>
  )
} 