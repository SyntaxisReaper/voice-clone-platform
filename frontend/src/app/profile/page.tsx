'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  UserIcon,
  CogIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  StarIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon,
  PauseIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/contexts/ThemeContext'

interface VoiceModel {
  id: string
  name: string
  status: 'trained' | 'training' | 'failed'
  quality: number
  createdAt: string
  lastUsed: string
  usageCount: number
  duration: string
  size: string
  language: string
  category: string
}

interface UserStats {
  totalVoices: number
  totalMinutes: number
  totalStorage: string
  memberSince: string
  planType: string
  voicesUsedThisMonth: number
  minutesUsedThisMonth: number
}

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'voices' | 'settings'>('overview')
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null)

  // Handle authentication redirect with delay
  useEffect(() => {
    if (!loading && !user) {
      const timeout = setTimeout(() => {
        router.push('/login')
      }, 2000) // Wait 2 seconds before redirecting
      setRedirectTimeout(timeout)
    } else if (user && redirectTimeout) {
      clearTimeout(redirectTimeout)
      setRedirectTimeout(null)
    }
    
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout)
      }
    }
  }, [user, loading, router, redirectTimeout])

  // Mock data - replace with real API calls
  const [userStats] = useState<UserStats>({
    totalVoices: 12,
    totalMinutes: 2847,
    totalStorage: '3.2 GB',
    memberSince: 'January 2024',
    planType: 'Pro',
    voicesUsedThisMonth: 8,
    minutesUsedThisMonth: 245
  })

  const [voiceModels] = useState<VoiceModel[]>([
    {
      id: '1',
      name: 'Professional Narrator',
      status: 'trained',
      quality: 95,
      createdAt: '2024-01-15',
      lastUsed: '2 hours ago',
      usageCount: 1247,
      duration: '2:34',
      size: '245 MB',
      language: 'English (US)',
      category: 'Professional'
    },
    {
      id: '2',
      name: 'Casual Conversational',
      status: 'trained',
      quality: 92,
      createdAt: '2024-01-20',
      lastUsed: '1 day ago',
      usageCount: 856,
      duration: '1:52',
      size: '198 MB',
      language: 'English (US)',
      category: 'Casual'
    },
    {
      id: '3',
      name: 'Character Voice - Hero',
      status: 'training',
      quality: 0,
      createdAt: '2024-01-25',
      lastUsed: 'Never',
      usageCount: 0,
      duration: '3:12',
      size: '312 MB',
      language: 'English (US)',
      category: 'Character'
    },
    {
      id: '4',
      name: 'Audiobook Reader',
      status: 'trained',
      quality: 89,
      createdAt: '2024-01-18',
      lastUsed: '3 days ago',
      usageCount: 432,
      duration: '4:23',
      size: '387 MB',
      language: 'English (US)',
      category: 'Educational'
    }
  ])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Show loading state while checking authentication
  if (loading || (!user && !redirectTimeout)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {loading ? 'Checking authentication...' : 'Redirecting to login...'}
          </p>
        </div>
      </div>
    )
  }

  // Don't render profile if no user and redirect is pending
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <SpeakerWaveIcon className="h-8 w-8 text-primary-600 dark:text-primary-500" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Profile</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="h-20 w-20 rounded-full"
                    />
                  ) : (
                    <div className="h-20 w-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <UserIcon className="h-10 w-10 text-white" />
                    </div>
                  )}
                  <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 rounded-full p-1 shadow-md hover:shadow-lg">
                    <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                  {user?.displayName || 'User'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  <StarIcon className="h-3 w-3 mr-1" />
                  {userStats.planType} Member
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Voices</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.totalVoices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Total Minutes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.totalMinutes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Storage Used</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.totalStorage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Member Since</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.memberSince}</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
              <nav className="space-y-1 p-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'overview'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ChartBarIcon className="h-5 w-5 mr-3" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('voices')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'voices'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <SpeakerWaveIcon className="h-5 w-5 mr-3" />
                  Voice Models
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'settings'
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CogIcon className="h-5 w-5 mr-3" />
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Usage Stats */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">This Month's Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Voices Used</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{userStats.voicesUsedThisMonth}/15</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${(userStats.voicesUsedThisMonth / 15) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Minutes Generated</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{userStats.minutesUsedThisMonth}/500</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-accent-600 dark:bg-accent-500 h-2 rounded-full" 
                          style={{ width: `${(userStats.minutesUsedThisMonth / 500) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-4">
                    {[
                      { action: 'Generated audio', model: 'Professional Narrator', time: '2 hours ago', status: 'completed' },
                      { action: 'Started training', model: 'Character Voice - Hero', time: '1 day ago', status: 'in-progress' },
                      { action: 'Generated audio', model: 'Casual Conversational', time: '2 days ago', status: 'completed' },
                      { action: 'Created new model', model: 'Audiobook Reader', time: '3 days ago', status: 'completed' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' : 
                          activity.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{activity.action}</span> using <span className="font-medium">{activity.model}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'voices' && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Voice Models</h3>
                    <Link 
                      href="/training"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Create New Voice
                    </Link>
                  </div>
                  
                  <div className="space-y-4">
                    {voiceModels.map((voice) => (
                      <div key={voice.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="text-lg font-medium text-gray-900 dark:text-white">{voice.name}</h4>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                voice.status === 'trained' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                voice.status === 'training' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                                'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                              }`}>
                                {voice.status === 'trained' ? 'Ready' : voice.status === 'training' ? 'Training' : 'Failed'}
                              </span>
                              {voice.status === 'trained' && (
                                <div className="flex items-center">
                                  <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                  <span className="text-sm text-gray-600 dark:text-gray-300">{voice.quality}%</span>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                              <div>
                                <span className="font-medium">Category:</span> {voice.category}
                              </div>
                              <div>
                                <span className="font-medium">Language:</span> {voice.language}
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span> {voice.duration}
                              </div>
                              <div>
                                <span className="font-medium">Size:</span> {voice.size}
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {new Date(voice.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Last Used:</span> {voice.lastUsed}
                              </div>
                              <div>
                                <span className="font-medium">Usage:</span> {voice.usageCount} times
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            {voice.status === 'trained' && (
                              <>
                                <button 
                                  onClick={() => setIsPlaying(isPlaying === voice.id ? null : voice.id)}
                                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  {isPlaying === voice.id ? (
                                    <PauseIcon className="h-5 w-5" />
                                  ) : (
                                    <PlayIcon className="h-5 w-5" />
                                  )}
                                </button>
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                                  <PencilIcon className="h-5 w-5" />
                                </button>
                              </>
                            )}
                            <button className="p-2 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 dark:hover:bg-red-900">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Account Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Account Security</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Manage your password and 2FA settings</p>
                        </div>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Configure
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BellIcon className="h-6 w-6 text-blue-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Email and push notification preferences</p>
                        </div>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Manage
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CreditCardIcon className="h-6 w-6 text-purple-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Billing & Subscription</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Manage your {userStats.planType} plan and billing</p>
                        </div>
                      </div>
                      <Link 
                        href="/billing"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DocumentDuplicateIcon className="h-6 w-6 text-orange-500" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Export Data</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Download your voice models and data</p>
                        </div>
                      </div>
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-red-200 dark:border-red-800">
                  <h3 className="text-lg font-medium text-red-900 dark:text-red-400 mb-4">Danger Zone</h3>
                  <div className="space-y-4">
                    <button 
                      onClick={handleSignOut}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Out
                    </button>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}