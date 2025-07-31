'use client'

import { useState, useEffect } from 'react'
import { AgentGraph } from '../components/AgentGraph'
import { TaskQueue } from '../components/TaskQueue'
import { ResourceMonitoring } from '../components/ResourceMonitoring'
import { QualityMetrics } from '../components/QualityMetrics'
import { SystemStatus } from '../components/SystemStatus'
import { Header } from '../components/Header'
import { ConsultativeAgency } from '../components/ConsultativeAgency'

export default function MissionControlPanel() {
  const [systemStatus, setSystemStatus] = useState({
    agents: {
      genesis: { status: 'active', lastActivity: new Date(), tasksCompleted: 12 },
      prometheus: { status: 'active', lastActivity: new Date(), tasksCompleted: 8 },
      scriba: { status: 'idle', lastActivity: new Date(Date.now() - 300000), tasksCompleted: 25 },
      auditor: { status: 'active', lastActivity: new Date(), tasksCompleted: 15 },
      architectus: { status: 'idle', lastActivity: new Date(Date.now() - 600000), tasksCompleted: 5 },
      executor: { status: 'active', lastActivity: new Date(), tasksCompleted: 3 },
      production: { status: 'idle', lastActivity: new Date(Date.now() - 900000), tasksCompleted: 2 },
      ux_maestro: { status: 'active', lastActivity: new Date(), tasksCompleted: 7 }
    },
    resources: {
      apiCosts: 0.45,
      modelLatency: 1200,
      tokenUsage: 15420,
      cpuUsage: 23.5,
      memoryUsage: 67.2,
      diskUsage: 45.8
    },
    quality: {
      successRate: 94.2,
      errorRate: 5.8,
      selfCorrections: 3,
      averageResponseTime: 2.3
    },
    consultative: {
      activeSessions: 3,
      strategicAnalyses: 8,
      designSystems: 5,
      userFlows: 12,
      prototypes: 4,
      clientSatisfaction: 96,
      projectSuccessRate: 94,
      averageResponseTime: 1.8
    }
  })

  useEffect(() => {
    // Simulate real-time updates with consultative agency workflow
    const interval = setInterval(() => {
      setSystemStatus(prev => {
        // Simulate agent activity patterns
        const now = new Date()
        const agents = { ...prev.agents }
        
        // Genesis (Lead Consultant) - frequently active for strategic conversations
        if (Math.random() > 0.3) {
          agents.genesis = { 
            status: 'active', 
            lastActivity: now, 
            tasksCompleted: agents.genesis.tasksCompleted + 1 
          }
        }
        
        // UX-Maestro - active for design work
        if (Math.random() > 0.4) {
          agents.ux_maestro = { 
            status: 'active', 
            lastActivity: now, 
            tasksCompleted: agents.ux_maestro.tasksCompleted + 1 
          }
        }
        
        // Prometheus - orchestrates the workflow
        if (Math.random() > 0.2) {
          agents.prometheus = { 
            status: 'active', 
            lastActivity: now, 
            tasksCompleted: agents.prometheus.tasksCompleted + 1 
          }
        }
        
        // Other agents follow their patterns
        if (Math.random() > 0.6) {
          agents.auditor = { 
            status: 'active', 
            lastActivity: now, 
            tasksCompleted: agents.auditor.tasksCompleted + 1 
          }
        }
        
        if (Math.random() > 0.7) {
          agents.executor = { 
            status: 'active', 
            lastActivity: now, 
            tasksCompleted: agents.executor.tasksCompleted + 1 
          }
        }

        return {
          ...prev,
          agents,
          resources: {
            ...prev.resources,
            apiCosts: prev.resources.apiCosts + (Math.random() - 0.5) * 0.1,
            modelLatency: prev.resources.modelLatency + (Math.random() - 0.5) * 100,
            tokenUsage: prev.resources.tokenUsage + Math.floor(Math.random() * 50),
            cpuUsage: Math.max(0, Math.min(100, prev.resources.cpuUsage + (Math.random() - 0.5) * 5)),
            memoryUsage: Math.max(0, Math.min(100, prev.resources.memoryUsage + (Math.random() - 0.5) * 3)),
            diskUsage: Math.max(0, Math.min(100, prev.resources.diskUsage + (Math.random() - 0.5) * 1))
          },
          consultative: {
            ...prev.consultative,
            activeSessions: Math.max(0, prev.consultative.activeSessions + (Math.random() > 0.8 ? 1 : 0)),
            strategicAnalyses: prev.consultative.strategicAnalyses + (Math.random() > 0.9 ? 1 : 0),
            designSystems: prev.consultative.designSystems + (Math.random() > 0.95 ? 1 : 0),
            userFlows: prev.consultative.userFlows + (Math.random() > 0.85 ? 1 : 0),
            prototypes: prev.consultative.prototypes + (Math.random() > 0.92 ? 1 : 0),
            clientSatisfaction: Math.max(90, Math.min(100, prev.consultative.clientSatisfaction + (Math.random() - 0.5) * 2)),
            projectSuccessRate: Math.max(90, Math.min(100, prev.consultative.projectSuccessRate + (Math.random() - 0.5) * 1)),
            averageResponseTime: Math.max(1, Math.min(3, prev.consultative.averageResponseTime + (Math.random() - 0.5) * 0.2))
          }
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-secondary-900">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Agent Graph */}
          <div className="lg:col-span-2 xl:col-span-2">
            <AgentGraph agents={systemStatus.agents} />
          </div>
          
          {/* System Status */}
          <div className="xl:col-span-1">
            <SystemStatus status={systemStatus} />
          </div>
          
          {/* Consultative Agency Dashboard */}
          <div className="lg:col-span-2 xl:col-span-3">
            <ConsultativeAgency metrics={systemStatus.consultative} />
          </div>
          
          {/* Task Queue */}
          <div className="lg:col-span-1">
            <TaskQueue />
          </div>
          
          {/* Resource Monitoring */}
          <div className="lg:col-span-1">
            <ResourceMonitoring resources={systemStatus.resources} />
          </div>
          
          {/* Quality Metrics */}
          <div className="lg:col-span-2">
            <QualityMetrics quality={systemStatus.quality} />
          </div>
        </div>
      </main>
    </div>
  )
} 