'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChartBarIcon,
  UsersIcon,
  SpeakerWaveIcon,
  CpuChipIcon,
  BellIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ServerIcon,
  DatabaseIcon,
  CloudIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { adminAuth, useAdminAuth } from '@/lib/adminAuth'
import { voiceCloningEngine } from '@/lib/voiceCloning'
import { licensingManager } from '@/lib/licensing'

export default function AdminDashboard() {
  const router = useRouter()
  const { isAdmin, session, logout, hasPermission } = useAdminAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'voices' | 'system' | 'analytics'>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Protect the route
  useEffect(() => {
    if (!isClient) return // Wait for client-side hydration
    
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    // Load dashboard data
    try {
      const data = adminAuth.getAdminDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin, router, isClient])

  const handleLogout = () => {
    logout()
    adminAuth.disableAdminFeatures()
    router.push('/')
  }

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {session?.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                <span>All systems operational</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'users', label: 'Users', icon: UsersIcon },
              { id: 'voices', label: 'Voices', icon: SpeakerWaveIcon },
              { id: 'system', label: 'System', icon: CpuChipIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Total Users',
                  value: dashboardData.systemStats.totalUsers.toLocaleString(),
                  icon: UsersIcon,
                  color: 'blue',
                  change: '+12%'
                },
                {
                  title: 'Active Voices',
                  value: dashboardData.systemStats.activeVoices.toLocaleString(),
                  icon: SpeakerWaveIcon,
                  color: 'green',
                  change: '+8%'
                },
                {
                  title: 'Total Generations',
                  value: dashboardData.systemStats.totalGenerations.toLocaleString(),
                  icon: CpuChipIcon,
                  color: 'purple',
                  change: '+24%'
                },
                {
                  title: 'Monthly Revenue',
                  value: dashboardData.systemStats.monthlyRevenue,
                  icon: CurrencyDollarIcon,
                  color: 'red',
                  change: '+15%'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <p className={`text-sm mt-1 ${
                        stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                      stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                      stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* System Health */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'API Status', status: dashboardData.systemHealth.apiStatus, icon: ServerIcon },
                  { label: 'Database', status: dashboardData.systemHealth.databaseStatus, icon: DatabaseIcon },
                  { label: 'Storage', status: dashboardData.systemHealth.storageStatus, icon: CloudIcon }
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      item.status === 'healthy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className={`text-sm ${
                        item.status === 'healthy' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {dashboardData.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      <div>
                        <p className="text-white font-medium">
                          {activity.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-gray-400 text-sm">{activity.count} events</p>
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            {dashboardData.alerts.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">System Alerts</h3>
                <div className="space-y-3">
                  {dashboardData.alerts.map((alert: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${
                      alert.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500' : 'bg-blue-500/10 border-blue-500'
                    }`}>
                      <div className="flex items-center">
                        {alert.level === 'warning' ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                        ) : (
                          <BellIcon className="h-5 w-5 text-blue-500 mr-2" />
                        )}
                        <p className="text-white">{alert.message}</p>
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && hasPermission('canViewAllData') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">User Management</h2>
              <div className="flex space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Export Users
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Add User
                </button>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">Active Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-gray-400 font-medium">User</th>
                      <th className="px-6 py-3 text-gray-400 font-medium">Plan</th>
                      <th className="px-6 py-3 text-gray-400 font-medium">Voices</th>
                      <th className="px-6 py-3 text-gray-400 font-medium">Usage</th>
                      <th className="px-6 py-3 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {/* Mock user data */}
                    {[
                      { email: 'user1@example.com', plan: 'Pro', voices: 12, usage: '85%' },
                      { email: 'user2@example.com', plan: 'Basic', voices: 3, usage: '45%' },
                      { email: 'user3@example.com', plan: 'Enterprise', voices: 25, usage: '92%' }
                    ].map((user, index) => (
                      <tr key={index} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-white">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-400' :
                            user.plan === 'Pro' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{user.voices}</td>
                        <td className="px-6 py-4 text-gray-300">{user.usage}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {hasPermission('canDeleteAnyUser') && (
                              <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Voices Tab */}
        {activeTab === 'voices' && hasPermission('canCloneAnyVoice') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Voice Management</h2>
              <div className="flex space-x-2">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Analytics
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Create Voice
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Total Voices</h3>
                <p className="text-3xl font-bold text-blue-400">{dashboardData.systemStats.activeVoices.toLocaleString()}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Training Jobs</h3>
                <p className="text-3xl font-bold text-yellow-400">23</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Failed Training</h3>
                <p className="text-3xl font-bold text-red-400">2</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Voice Activity</h3>
              <div className="text-gray-400">
                <p>Voice management features would be implemented here with full CRUD operations.</p>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && hasPermission('canManageSystem') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">System Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Server Configuration</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Storage Used:</span>
                    <span className="text-white">{dashboardData.systemStats.storageUsed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processing Queue:</span>
                    <span className="text-white">{dashboardData.systemHealth.processingQueue} jobs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Sessions:</span>
                    <span className="text-white">{dashboardData.systemStats.dailyActiveUsers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Admin Actions</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Clear Cache
                  </button>
                  <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Restart Services
                  </button>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Emergency Stop
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && hasPermission('canAccessAnalytics') && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
            
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Advanced Analytics</h3>
              <p className="text-gray-400">
                Detailed analytics and reporting features would be implemented here, including:
              </p>
              <ul className="list-disc list-inside text-gray-400 mt-2 space-y-1">
                <li>User engagement metrics</li>
                <li>Voice generation statistics</li>
                <li>Revenue tracking</li>
                <li>Performance monitoring</li>
                <li>Custom report generation</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}