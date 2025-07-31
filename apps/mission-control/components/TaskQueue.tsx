'use client'

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react'

interface Task {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high'
  agent: string
  progress: number
  estimatedTime: number
  startTime?: Date
  endTime?: Date
}

export function TaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Generate React Component',
      status: 'in-progress',
      priority: 'high',
      agent: 'Scriba',
      progress: 75,
      estimatedTime: 120,
      startTime: new Date(Date.now() - 90000)
    },
    {
      id: '2',
      name: 'Audit Code Quality',
      status: 'pending',
      priority: 'medium',
      agent: 'Auditor',
      progress: 0,
      estimatedTime: 60
    },
    {
      id: '3',
      name: 'Setup Production Environment',
      status: 'completed',
      priority: 'high',
      agent: 'Production',
      progress: 100,
      estimatedTime: 300,
      startTime: new Date(Date.now() - 180000),
      endTime: new Date(Date.now() - 30000)
    },
    {
      id: '4',
      name: 'Optimize Performance',
      status: 'failed',
      priority: 'medium',
      agent: 'Executor',
      progress: 45,
      estimatedTime: 180,
      startTime: new Date(Date.now() - 120000)
    }
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-secondary-400" />
      case 'in-progress': return <Play className="w-4 h-4 text-primary-400" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-success-400" />
      case 'failed': return <AlertCircle className="w-4 h-4 text-error-400" />
      default: return <Clock className="w-4 h-4 text-secondary-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-secondary-400'
      case 'in-progress': return 'text-primary-400'
      case 'completed': return 'text-success-400'
      case 'failed': return 'text-error-400'
      default: return 'text-secondary-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-error-500'
      case 'medium': return 'bg-warning-500'
      case 'low': return 'bg-success-500'
      default: return 'bg-secondary-500'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-500'
      case 'failed': return 'bg-error-500'
      case 'in-progress': return 'bg-primary-500'
      default: return 'bg-secondary-500'
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Task Queue Status</h2>
        <p className="text-sm text-secondary-400">Real-time task execution tracking</p>
      </div>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 bg-secondary-700 rounded-lg border border-secondary-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getStatusIcon(task.status)}
                <h3 className="font-medium text-white">{task.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <span className={`text-sm ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm text-secondary-400 mb-3">
              <span>Agent: {task.agent}</span>
              <span>{task.estimatedTime}s estimated</span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-xs text-secondary-400 mb-1">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-secondary-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(task.status)}`}
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
            
            {task.startTime && (
              <div className="text-xs text-secondary-400">
                Started: {task.startTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
                {task.endTime && ` • Completed: ${task.endTime.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}`}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">
            Pending: {tasks.filter(t => t.status === 'pending').length}
          </span>
          <span className="text-secondary-400">
            In Progress: {tasks.filter(t => t.status === 'in-progress').length}
          </span>
          <span className="text-secondary-400">
            Completed: {tasks.filter(t => t.status === 'completed').length}
          </span>
        </div>
      </div>
    </div>
  )
} 