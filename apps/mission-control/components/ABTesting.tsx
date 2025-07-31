'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, Target, Activity } from 'lucide-react'

interface ABTest {
  id: string
  name: string
  status: 'running' | 'completed' | 'paused'
  trafficSplit: number
  startDate: Date
  endDate: Date
  metrics: {
    accuracy: { control: number; variant: number }
    latency: { control: number; variant: number }
    cost: { control: number; variant: number }
  }
}

interface ABTestingProps {
  tests: ABTest[]
}

export function ABTesting({ tests }: ABTestingProps) {
  const [selectedTest, setSelectedTest] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-success-400'
      case 'completed': return 'text-primary-400'
      case 'paused': return 'text-warning-400'
      default: return 'text-secondary-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'running': return 'bg-success-500/20'
      case 'completed': return 'bg-primary-500/20'
      case 'paused': return 'bg-warning-500/20'
      default: return 'bg-secondary-500/20'
    }
  }

  const formatChartData = (test: ABTest) => [
    {
      metric: 'Accuracy',
      control: test.metrics.accuracy.control,
      variant: test.metrics.accuracy.variant,
      improvement: ((test.metrics.accuracy.variant - test.metrics.accuracy.control) / test.metrics.accuracy.control * 100).toFixed(1)
    },
    {
      metric: 'Latency (ms)',
      control: test.metrics.latency.control,
      variant: test.metrics.latency.variant,
      improvement: ((test.metrics.latency.control - test.metrics.latency.variant) / test.metrics.latency.control * 100).toFixed(1)
    },
    {
      metric: 'Cost ($)',
      control: test.metrics.cost.control,
      variant: test.metrics.cost.variant,
      improvement: ((test.metrics.cost.control - test.metrics.cost.variant) / test.metrics.cost.control * 100).toFixed(1)
    }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">A/B Testing</h2>
            <p className="text-sm text-secondary-400">Model performance comparison and traffic management</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-primary-500 text-white text-xs rounded hover:bg-primary-600 transition-colors">
              New Test
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {tests.map((test) => (
          <div
            key={test.id}
            className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
              selectedTest === test.id ? 'border-primary-500 bg-primary-500/10' : 'border-secondary-600 bg-secondary-700'
            }`}
            onClick={() => setSelectedTest(selectedTest === test.id ? null : test.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${getStatusBg(test.status)}`}>
                  <Target className={`w-5 h-5 ${getStatusColor(test.status)}`} />
                </div>
                <div>
                  <h3 className="font-medium text-white">{test.name}</h3>
                  <p className="text-xs text-secondary-400">
                    {test.startDate.toLocaleDateString()} - {test.endDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBg(test.status)} ${getStatusColor(test.status)}`}>
                  {test.status}
                </span>
                <div className="text-xs text-secondary-400 mt-1">
                  {test.trafficSplit}% traffic
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-xs text-secondary-400">Accuracy</div>
                <div className="flex items-center space-x-2">
                  <span className="text-white">Control: {test.metrics.accuracy.control.toFixed(1)}%</span>
                  <span className="text-success-400">Variant: {test.metrics.accuracy.variant.toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-400">Latency</div>
                <div className="flex items-center space-x-2">
                  <span className="text-white">Control: {test.metrics.latency.control}ms</span>
                  <span className="text-success-400">Variant: {test.metrics.latency.variant}ms</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-secondary-400">Cost</div>
                <div className="flex items-center space-x-2">
                  <span className="text-white">Control: ${test.metrics.cost.control.toFixed(2)}</span>
                  <span className="text-success-400">Variant: ${test.metrics.cost.variant.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedTest && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-white mb-4">Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={formatChartData(tests.find(t => t.id === selectedTest)!)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="metric" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f9fafb'
                }}
              />
              <Bar dataKey="control" fill="#6b7280" radius={[4, 4, 0, 0]} />
              <Bar dataKey="variant" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {formatChartData(tests.find(t => t.id === selectedTest)!).map((metric, index) => (
              <div key={index} className="p-3 bg-secondary-700 rounded">
                <div className="text-xs text-secondary-400">{metric.metric}</div>
                <div className={`text-sm font-mono ${parseFloat(metric.improvement) > 0 ? 'text-success-400' : 'text-error-400'}`}>
                  {parseFloat(metric.improvement) > 0 ? '+' : ''}{metric.improvement}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">
            Active Tests: {tests.filter(t => t.status === 'running').length}
          </span>
          <span className="text-secondary-400">
            Total Tests: {tests.length}
          </span>
        </div>
      </div>
    </div>
  )
} 