'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, Users, Palette, Lightbulb, TrendingUp, Shield, Zap, Brain } from 'lucide-react'

interface ConsultativeMetrics {
  activeSessions: number
  strategicAnalyses: number
  designSystems: number
  userFlows: number
  prototypes: number
  clientSatisfaction: number
  projectSuccessRate: number
  averageResponseTime: number
}

interface ConsultativeAgencyProps {
  metrics: ConsultativeMetrics
}

export function ConsultativeAgency({ metrics }: ConsultativeAgencyProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const capabilities = [
    {
      icon: Brain,
      title: 'Strategic Vision Refinement',
      description: 'Genesis leads consultative conversations to understand core business goals',
      metrics: ['Active Sessions', 'Strategic Analyses', 'Client Satisfaction']
    },
    {
      icon: Palette,
      title: 'Design System Creation',
      description: 'UX-Maestro translates abstract visions into concrete design systems',
      metrics: ['Design Systems', 'User Flows', 'Prototypes']
    },
    {
      icon: Users,
      title: 'User Research & Personas',
      description: 'Comprehensive user research and journey mapping',
      metrics: ['User Personas', 'Journey Maps', 'Research Plans']
    },
    {
      icon: TrendingUp,
      title: 'Business Impact Analysis',
      description: 'Strategic analysis of market opportunities and competitive advantages',
      metrics: ['Market Analysis', 'ROI Projections', 'Risk Assessment']
    }
  ]

  const workflowSteps = [
    {
      step: 1,
      title: 'Client Vision',
      description: 'Genesis conducts strategic conversations',
      agent: 'Genesis',
      icon: Brain
    },
    {
      step: 2,
      title: 'Strategic Analysis',
      description: 'Business goals and market opportunity analysis',
      agent: 'Genesis',
      icon: Target
    },
    {
      step: 3,
      title: 'Design System',
      description: 'UX-Maestro creates cohesive design systems',
      agent: 'UX-Maestro',
      icon: Palette
    },
    {
      step: 4,
      title: 'Architecture Planning',
      description: 'Architectus designs technical architecture',
      agent: 'Architectus',
      icon: Shield
    },
    {
      step: 5,
      title: 'Development & QA',
      description: 'Scriba and Auditor ensure quality delivery',
      agent: 'Scriba + Auditor',
      icon: Zap
    },
    {
      step: 6,
      title: 'Production Deployment',
      description: 'Executor and Production handle deployment',
      agent: 'Executor + Production',
      icon: TrendingUp
    }
  ]

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-lg font-semibold text-white">Consultative Agency Dashboard</h2>
        <p className="text-sm text-secondary-400">Strategic development partnership metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-white">Key Performance Indicators</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.1 }}
              className="p-3 bg-primary-500/10 rounded-lg border border-primary-500/20"
            >
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-primary-400" />
                <span className="text-xs text-primary-400">Active Sessions</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.activeSessions}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.2 }}
              className="p-3 bg-success-500/10 rounded-lg border border-success-500/20"
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-success-400" />
                <span className="text-xs text-success-400">Strategic Analyses</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.strategicAnalyses}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.3 }}
              className="p-3 bg-pink-500/10 rounded-lg border border-pink-500/20"
            >
              <div className="flex items-center space-x-2">
                <Palette className="w-4 h-4 text-pink-400" />
                <span className="text-xs text-pink-400">Design Systems</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.designSystems}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ delay: 0.4 }}
              className="p-3 bg-warning-500/10 rounded-lg border border-warning-500/20"
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-warning-400" />
                <span className="text-xs text-warning-400">User Flows</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.userFlows}</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-info-500/10 rounded-lg border border-info-500/20">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-info-400" />
                <span className="text-xs text-info-400">Prototypes</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.prototypes}</p>
            </div>

            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400">Success Rate</span>
              </div>
              <p className="text-lg font-bold text-white">{metrics.projectSuccessRate}%</p>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-white">Core Capabilities</h3>
          
          <div className="space-y-3">
            {capabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="p-3 bg-secondary-800/50 rounded-lg border border-secondary-700"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary-500/20 rounded-lg">
                    <capability.icon className="w-4 h-4 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white">{capability.title}</h4>
                    <p className="text-xs text-secondary-400 mt-1">{capability.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {capability.metrics.map((metric) => (
                        <span
                          key={metric}
                          className="px-2 py-1 text-xs bg-secondary-700 rounded-full text-secondary-300"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Process */}
      <div className="mt-6 pt-6 border-t border-secondary-700">
        <h3 className="text-md font-medium text-white mb-4">Consultative Workflow Process</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="relative"
            >
              <div className="p-3 bg-secondary-800/50 rounded-lg border border-secondary-700 text-center">
                <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <step.icon className="w-4 h-4 text-primary-400" />
                </div>
                <h4 className="text-xs font-medium text-white">{step.title}</h4>
                <p className="text-xs text-secondary-400 mt-1">{step.description}</p>
                <p className="text-xs text-primary-400 mt-1">{step.agent}</p>
              </div>
              
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-1.5 transform -translate-y-1/2">
                  <div className="w-3 h-0.5 bg-secondary-600"></div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Client Satisfaction */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary-500/10 to-success-500/10 rounded-lg border border-primary-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-medium text-white">Client Satisfaction</h3>
            <p className="text-sm text-secondary-400">Based on strategic consultation quality</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{metrics.clientSatisfaction}%</p>
            <p className="text-xs text-success-400">Excellent</p>
          </div>
        </div>
        
        <div className="mt-3">
          <div className="w-full bg-secondary-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-500 to-success-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.clientSatisfaction}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
} 