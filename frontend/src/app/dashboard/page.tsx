'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Mic, 
  PlayCircle, 
  BarChart3, 
  Plus, 
  Download, 
  Eye,
  TrendingUp,
  Users,
  Volume2,
  Clock,
  Star,
  Zap,
  Shield,
  Calendar
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  // Mock data - replace with real API calls
  const stats = [
    { 
      title: 'Total Voices', 
      value: '12', 
      change: '+2 this week',
      icon: Mic,
      color: 'from-berry-500 to-berry-600',
      trend: 'up'
    },
    { 
      title: 'Audio Generated', 
      value: '1.2K', 
      change: '+18% vs last week',
      icon: Volume2,
      color: 'from-twilight-500 to-twilight-600',
      trend: 'up'
    },
    { 
      title: 'API Calls', 
      value: '8.7K', 
      change: '+24% vs last week',
      icon: Zap,
      color: 'from-berry-600 to-twilight-600',
      trend: 'up'
    },
    { 
      title: 'Revenue', 
      value: '$342', 
      change: '+12% vs last week',
      icon: TrendingUp,
      color: 'from-twilight-600 to-berry-500',
      trend: 'up'
    }
  ]

  const recentVoices = [
    { id: 1, name: 'Professional Narrator', status: 'Ready', createdAt: '2024-01-15', usage: 145 },
    { id: 2, name: 'Casual Friend', status: 'Training', createdAt: '2024-01-14', usage: 89 },
    { id: 3, name: 'News Anchor', status: 'Ready', createdAt: '2024-01-12', usage: 267 },
    { id: 4, name: 'Character Voice', status: 'Ready', createdAt: '2024-01-10', usage: 156 }
  ]

  const recentActivity = [
    { id: 1, action: 'Voice generated', voice: 'Professional Narrator', time: '2 hours ago', icon: Volume2 },
    { id: 2, action: 'New voice created', voice: 'Casual Friend', time: '1 day ago', icon: Plus },
    { id: 3, action: 'API key generated', voice: null, time: '2 days ago', icon: Shield },
    { id: 4, action: 'License purchased', voice: 'News Anchor', time: '3 days ago', icon: Star }
  ]

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-poppins font-bold text-navy mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-navy/70">
                Here's what's happening with your voice clones today
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="input-glass px-4 py-2 text-sm"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <Link 
                href="/training"
                className="btn-primary px-4 py-2 text-sm inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Voice</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-navy/70 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-navy mb-1">{stat.value}</p>
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Voices */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-navy">Your Voices</h2>
                <Link href="/training" className="text-berry-600 hover:text-berry-700 text-sm font-medium">
                  View All →
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentVoices.map((voice, index) => (
                  <motion.div
                    key={voice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-berry-500 to-twilight-500 rounded-lg flex items-center justify-center">
                        <Mic className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-navy">{voice.name}</h3>
                        <p className="text-sm text-navy/60">
                          Created {voice.createdAt} • {voice.usage} uses
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        voice.status === 'Ready' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {voice.status}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button className="p-1 hover:bg-white/20 rounded">
                          <PlayCircle className="w-4 h-4 text-navy/70" />
                        </button>
                        <button className="p-1 hover:bg-white/20 rounded">
                          <Eye className="w-4 h-4 text-navy/70" />
                        </button>
                        <button className="p-1 hover:bg-white/20 rounded">
                          <Download className="w-4 h-4 text-navy/70" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-navy mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link 
                  href="/training"
                  className="flex items-center space-x-3 p-3 hover:bg-white/20 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-berry-500 to-berry-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-navy">Create New Voice</span>
                </Link>
                
                <Link 
                  href="/playground"
                  className="flex items-center space-x-3 p-3 hover:bg-white/20 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-twilight-500 to-twilight-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-navy">Try Playground</span>
                </Link>
                
                <Link 
                  href="/billing"
                  className="flex items-center space-x-3 p-3 hover:bg-white/20 rounded-lg transition-colors group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-berry-600 to-twilight-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium text-navy">View Analytics</span>
                </Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-navy mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-berry-500/20 to-twilight-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-berry-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-navy">
                          <span className="font-medium">{activity.action}</span>
                          {activity.voice && (
                            <span className="text-navy/70"> for {activity.voice}</span>
                          )}
                        </p>
                        <p className="text-xs text-navy/60 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
