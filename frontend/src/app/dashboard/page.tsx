'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MicrophoneIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function Dashboard() {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Mock data for voice samples
  const voiceSamples = [
    {
      id: '1',
      name: 'Professional Voice',
      status: 'trained',
      quality: 95,
      usageCount: 1247,
      lastUsed: '2 hours ago',
      duration: '2:34'
    },
    {
      id: '2',
      name: 'Casual Narrator',
      status: 'training',
      quality: 0,
      usageCount: 0,
      lastUsed: 'Never',
      duration: '1:45'
    },
    {
      id: '3',
      name: 'Character Voice',
      status: 'trained',
      quality: 88,
      usageCount: 523,
      lastUsed: '1 day ago',
      duration: '3:12'
    }
  ]

  const stats = [
    { label: 'Total Voices', value: '12', icon: SpeakerWaveIcon, change: '+2' },
    { label: 'Minutes Generated', value: '1,247', icon: ChartBarIcon, change: '+15%' },
    { label: 'Active Training', value: '3', icon: MicrophoneIcon, change: '0' },
    { label: 'Storage Used', value: '2.4GB', icon: Cog6ToothIcon, change: '+0.2GB' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-3 p-2 text-gray-600 hover:text-gray-900 md:hidden">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <Link href="/" className="flex items-center">
                <SpeakerWaveIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/training"
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium flex items-center"
              >
                <PlusIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Voice</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div className="ml-2 flex items-baseline text-sm">
                        <div className={`${stat.change.startsWith('+') ? 'text-green-600' : 'text-gray-500'}`}>
                          {stat.change}
                        </div>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Voice Samples */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Your Voice Samples</h3>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Cog6ToothIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {voiceSamples.map((voice) => (
                <div 
                  key={voice.id} 
                  className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    selectedVoice === voice.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedVoice(voice.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                          <SpeakerWaveIcon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{voice.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                              voice.status === 'trained' ? 'bg-green-400' : 
                              voice.status === 'training' ? 'bg-yellow-400' : 'bg-gray-400'
                            }`}></span>
                            {voice.status === 'trained' ? 'Ready' : 'Training'}
                          </span>
                          <span className="hidden sm:inline">Duration: {voice.duration}</span>
                          {voice.quality > 0 && <span className="hidden sm:inline">Quality: {voice.quality}%</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
                      <div className="text-left sm:text-right text-sm">
                        <div className="text-gray-900 font-medium">{voice.usageCount} uses</div>
                        <div className="text-gray-500 text-xs sm:text-sm">Last: {voice.lastUsed}</div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsPlaying(!isPlaying)
                          }}
                        >
                          {isPlaying ? (
                            <PauseIcon className="h-4 w-4" />
                          ) : (
                            <PlayIcon className="h-4 w-4" />
                          )}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                          <ShareIcon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  { action: 'Voice clone generated', target: 'Professional Voice', time: '2 hours ago', type: 'generation' },
                  { action: 'Training completed', target: 'Character Voice', time: '1 day ago', type: 'training' },
                  { action: 'New voice sample uploaded', target: 'Casual Narrator', time: '2 days ago', type: 'upload' }
                ].map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== 2 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'generation' ? 'bg-green-500' :
                            activity.type === 'training' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}>
                            <SpeakerWaveIcon className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.action} <span className="font-medium text-gray-900">{activity.target}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
