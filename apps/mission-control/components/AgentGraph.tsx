'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Code, Shield, Zap, Wrench, Rocket, Settings, Palette, Users, Target, Lightbulb } from 'lucide-react'

interface Agent {
  status: 'active' | 'idle' | 'error' | 'warning'
  lastActivity: Date
  tasksCompleted: number
}

interface AgentGraphProps {
  agents: Record<string, Agent>
}

const agentIcons = {
  genesis: Brain,
  prometheus: Zap,
  scriba: Code,
  auditor: Shield,
  architectus: Settings,
  executor: Wrench,
  production: Rocket,
  ux_maestro: Palette
}

const agentNames = {
  genesis: 'Genesis',
  prometheus: 'Prometheus',
  scriba: 'Scriba',
  auditor: 'Auditor',
  architectus: 'Architectus',
  executor: 'Executor',
  production: 'Production',
  ux_maestro: 'UX-Maestro'
}

const agentRoles = {
  genesis: 'Lead Consultant',
  prometheus: 'Project Manager',
  scriba: 'Code Generator',
  auditor: 'Quality Assurance',
  architectus: 'Solutions Architect',
  executor: 'DevOps Lead',
  production: 'Production Manager',
  ux_maestro: 'UX Designer'
}

const agentDescriptions = {
  genesis: 'Strategic vision refinement and consultative conversations',
  prometheus: 'Workflow orchestration and resource optimization',
  scriba: 'Multi-language code generation and implementation',
  auditor: 'Code analysis, security auditing, and quality assessment',
  architectus: 'Intelligent blueprint generation and architecture design',
  executor: 'Code execution, deployment automation, and command line operations',
  production: 'Advanced production deployment, security hardening, and compliance',
  ux_maestro: 'Design system creation, user flows, and UX strategy'
}

export function AgentGraph({ agents }: AgentGraphProps) {
  const [activeAgents, setActiveAgents] = useState<string[]>([])

  useEffect(() => {
    const active = Object.entries(agents)
      .filter(([_, agent]) => agent.status === 'active')
      .map(([name, _]) => name)
    setActiveAgents(active)
  }, [agents])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success-400'
      case 'idle': return 'text-secondary-400'
      case 'error': return 'text-error-400'
      case 'warning': return 'text-warning-400'
      default: return 'text-secondary-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success-500/20'
      case 'idle': return 'bg-secondary-500/20'
      case 'error': return 'bg-error-500/20'
      case 'warning': return 'bg-warning-500/20'
      default: return 'bg-secondary-500/20'
    }
  }

  const getAgentGlowColor = (agentName: string) => {
    const glowColors = {
      genesis: 'shadow-success-500/50',
      prometheus: 'shadow-warning-500/50',
      scriba: 'shadow-primary-500/50',
      auditor: 'shadow-error-500/50',
      architectus: 'shadow-info-500/50',
      executor: 'shadow-secondary-500/50',
      production: 'shadow-purple-500/50',
      ux_maestro: 'shadow-pink-500/50'
    }
    return glowColors[agentName as keyof typeof glowColors] || 'shadow-primary-500/50'
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Mount Olympus - Agent Society</h2>
        <p className="text-sm text-secondary-400">Real-time agent activity and consultative coordination</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(agents).map(([agentName, agent]) => {
          const Icon = agentIcons[agentName as keyof typeof agentIcons]
          const isActive = agent.status === 'active'
          const isGlowing = activeAgents.includes(agentName)
          const glowColor = getAgentGlowColor(agentName)
          
          return (
            <motion.div
              key={agentName}
              className={`relative p-4 rounded-lg border transition-all duration-300 ${
                isGlowing ? `agent-glow border-primary-500 ${glowColor}` : 'border-secondary-600'
              } ${getStatusBg(agent.status)}`}
              whileHover={{ scale: 1.02 }}
              animate={isGlowing ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: isGlowing ? Infinity : 0 }}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getStatusBg(agent.status)}`}>
                  <Icon className={`w-5 h-5 ${getStatusColor(agent.status)}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-white">{agentNames[agentName as keyof typeof agentNames]}</h3>
                  <p className="text-xs text-secondary-400">{agentRoles[agentName as keyof typeof agentRoles]}</p>
                  <p className={`text-xs ${getStatusColor(agent.status)}`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-secondary-400">
                <div className="flex justify-between">
                  <span>Tasks: {agent.tasksCompleted}</span>
                  <span>{agent.lastActivity.toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}</span>
                </div>
              </div>
              
              {isActive && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
                </div>
              )}
              
              {/* Agent Description Tooltip */}
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-secondary-800 rounded text-xs text-white z-10">
                  {agentDescriptions[agentName as keyof typeof agentDescriptions]}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
      
      <div className="mt-4 pt-4 border-t border-secondary-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-secondary-400">Active Agents: {activeAgents.length}</span>
          <span className="text-secondary-400">
            Total Tasks: {Object.values(agents).reduce((sum, agent) => sum + agent.tasksCompleted, 0)}
          </span>
        </div>
        
        {/* Consultative Agency Status */}
        <div className="mt-3 p-3 bg-primary-500/10 rounded-lg border border-primary-500/20">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Consultative Agency Mode</span>
          </div>
          <p className="text-xs text-secondary-400 mt-1">
            Genesis leads strategic conversations while UX-Maestro ensures cohesive design experiences
          </p>
        </div>
      </div>
    </div>
  )
} 