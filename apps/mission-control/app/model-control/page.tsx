'use client'

import { useState, useEffect } from 'react'
import { ModelRegistry } from '@/components/ModelRegistry'
import { ABTesting } from '@/components/ABTesting'
import { PerformanceMonitoring } from '@/components/PerformanceMonitoring'
import { ModelDeployment } from '@/components/ModelDeployment'
import { Header } from '@/components/Header'

export default function ModelControlPlane() {
  const [modelData, setModelData] = useState({
    models: {
      'scriba-react': {
        version: '2.1.0',
        status: 'active',
        performance: 94.2,
        deployment: 'production',
        lastUpdated: new Date(Date.now() - 86400000),
        usage: 1250,
        accuracy: 96.8
      },
      'scriba-backend': {
        version: '1.9.5',
        status: 'testing',
        performance: 91.5,
        deployment: 'staging',
        lastUpdated: new Date(Date.now() - 172800000),
        usage: 890,
        accuracy: 93.2
      },
      'auditor-quality': {
        version: '3.0.1',
        status: 'active',
        performance: 97.1,
        deployment: 'production',
        lastUpdated: new Date(Date.now() - 43200000),
        usage: 2100,
        accuracy: 98.5
      },
      'genesis-architect': {
        version: '1.5.2',
        status: 'active',
        performance: 89.7,
        deployment: 'production',
        lastUpdated: new Date(Date.now() - 259200000),
        usage: 650,
        accuracy: 91.3
      }
    },
    abTests: [
      {
        id: 'test-1',
        name: 'Scriba Backend v2.0',
        status: 'running',
        trafficSplit: 15,
        startDate: new Date(Date.now() - 604800000),
        endDate: new Date(Date.now() + 604800000),
        metrics: {
          accuracy: { control: 91.5, variant: 93.2 },
          latency: { control: 1200, variant: 1100 },
          cost: { control: 0.45, variant: 0.42 }
        }
      }
    ],
    performance: {
      modelDrift: 2.3,
      retrainingTriggered: false,
      lastRetraining: new Date(Date.now() - 1209600000),
      dataQuality: 98.7,
      modelHealth: 'excellent'
    }
  })

  return (
    <div className="min-h-screen bg-secondary-900">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Model Control Plane</h1>
          <p className="text-secondary-400">AI Factory - Manage fine-tuned models lifecycle</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Model Registry */}
          <div className="lg:col-span-2">
            <ModelRegistry models={modelData.models} />
          </div>
          
          {/* Performance Monitoring */}
          <div className="xl:col-span-1">
            <PerformanceMonitoring performance={modelData.performance} />
          </div>
          
          {/* A/B Testing */}
          <div className="lg:col-span-2">
            <ABTesting tests={modelData.abTests} />
          </div>
          
          {/* Model Deployment */}
          <div className="lg:col-span-1">
            <ModelDeployment />
          </div>
        </div>
      </main>
    </div>
  )
} 