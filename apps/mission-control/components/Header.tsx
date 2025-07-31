'use client'

import { Activity, Zap, Shield, Settings } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-secondary-800 border-b border-secondary-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">ARiS Mission Control</h1>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-secondary-300">
              <span className="flex items-center space-x-1">
                <Activity className="w-4 h-4 text-success-400" />
                <span>Live Monitoring</span>
              </span>
              <span className="flex items-center space-x-1">
                <Shield className="w-4 h-4 text-primary-400" />
                <span>Production Ready</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
              <span className="text-secondary-300">System Online</span>
            </div>
            <button className="p-2 text-secondary-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 