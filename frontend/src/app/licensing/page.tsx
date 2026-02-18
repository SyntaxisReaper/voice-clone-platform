'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  UserGroupIcon,
  KeyIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid'

interface License {
  id: string
  voiceName: string
  voiceId: string
  licenseeEmail: string
  licenseeName: string
  licenseType: 'personal' | 'commercial' | 'educational' | 'research'
  status: 'pending' | 'active' | 'expired' | 'revoked'
  createdDate: Date
  startDate?: Date
  endDate?: Date
  price?: number
  currency: string
  usageLimit?: number
  currentUsage: number
  permissions: {
    canModify: boolean
    canRedistribute: boolean
    requiresAttribution: boolean
    commercialUse: boolean
  }
  restrictions?: string[]
}

interface VoicePermission {
  voiceId: string
  voiceName: string
  isPublic: boolean
  totalLicenses: number
  activeLicenses: number
  pendingRequests: number
  monthlyEarnings: number
}

export default function LicensingPage() {
  const [activeTab, setActiveTab] = useState<'granted' | 'received' | 'voices'>('granted')
  const [grantedLicenses, setGrantedLicenses] = useState<License[]>([])
  const [receivedLicenses, setReceivedLicenses] = useState<License[]>([])
  const [voicePermissions, setVoicePermissions] = useState<VoicePermission[]>([])
  const [showCreateLicense, setShowCreateLicense] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [showLicenseDetails, setShowLicenseDetails] = useState(false)

  // Mock data
  useEffect(() => {
    setGrantedLicenses([
      {
        id: 'lic-1',
        voiceName: 'Professional Voice',
        voiceId: 'voice-1',
        licenseeEmail: 'john@example.com',
        licenseeName: 'John Doe',
        licenseType: 'commercial',
        status: 'active',
        createdDate: new Date('2024-01-15'),
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-12-31'),
        price: 299,
        currency: 'USD',
        usageLimit: 1000,
        currentUsage: 245,
        permissions: {
          canModify: false,
          canRedistribute: false,
          requiresAttribution: true,
          commercialUse: true
        },
        restrictions: ['No adult content', 'No political campaigns']
      },
      {
        id: 'lic-2',
        voiceName: 'Character Voice',
        voiceId: 'voice-3',
        licenseeEmail: 'sarah@studio.com',
        licenseeName: 'Sarah Studio',
        licenseType: 'educational',
        status: 'pending',
        createdDate: new Date('2024-01-20'),
        currency: 'USD',
        currentUsage: 0,
        permissions: {
          canModify: false,
          canRedistribute: false,
          requiresAttribution: true,
          commercialUse: false
        }
      }
    ])

    setReceivedLicenses([
      {
        id: 'lic-3',
        voiceName: 'Celebrity Clone',
        voiceId: 'voice-cel-1',
        licenseeEmail: 'your@email.com',
        licenseeName: 'You',
        licenseType: 'personal',
        status: 'active',
        createdDate: new Date('2024-01-10'),
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-06-10'),
        price: 99,
        currency: 'USD',
        usageLimit: 500,
        currentUsage: 123,
        permissions: {
          canModify: false,
          canRedistribute: false,
          requiresAttribution: false,
          commercialUse: false
        }
      }
    ])

    setVoicePermissions([
      {
        voiceId: 'voice-1',
        voiceName: 'Professional Voice',
        isPublic: true,
        totalLicenses: 12,
        activeLicenses: 8,
        pendingRequests: 3,
        monthlyEarnings: 1247
      },
      {
        voiceId: 'voice-2',
        voiceName: 'Casual Narrator',
        isPublic: false,
        totalLicenses: 3,
        activeLicenses: 2,
        pendingRequests: 1,
        monthlyEarnings: 150
      }
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-800 bg-green-100'
      case 'pending': return 'text-yellow-800 bg-yellow-100'
      case 'expired': return 'text-gray-800 bg-gray-100'
      case 'revoked': return 'text-red-800 bg-red-100'
      default: return 'text-gray-800 bg-gray-100'
    }
  }

  const getLicenseTypeColor = (type: string) => {
    switch (type) {
      case 'commercial': return 'text-purple-800 bg-purple-100'
      case 'personal': return 'text-blue-800 bg-blue-100'
      case 'educational': return 'text-green-800 bg-green-100'
      case 'research': return 'text-indigo-800 bg-indigo-100'
      default: return 'text-gray-800 bg-gray-100'
    }
  }

  const handleApproveLicense = (licenseId: string) => {
    setGrantedLicenses(prev => 
      prev.map(license => 
        license.id === licenseId 
          ? { ...license, status: 'active' as const, startDate: new Date() }
          : license
      )
    )
  }

  const handleRevokeLicense = (licenseId: string) => {
    setGrantedLicenses(prev =>
      prev.map(license =>
        license.id === licenseId
          ? { ...license, status: 'revoked' as const }
          : license
      )
    )
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateUsagePercentage = (current: number, limit?: number) => {
    if (!limit) return 0
    return Math.min((current / limit) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-3 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Voice Licensing</h1>
                <p className="text-xs sm:text-sm text-gray-600">Manage voice permissions and licensing</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateLicense(true)}
                className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create License</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('granted')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'granted'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Licenses </span>Granted ({grantedLicenses.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'received'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Licenses </span>Received ({receivedLicenses.length})
            </button>
            <button
              onClick={() => setActiveTab('voices')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'voices'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Voice </span>Permissions ({voicePermissions.length})
            </button>
          </nav>
        </div>

        {/* Granted Licenses Tab */}
        {activeTab === 'granted' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Licenses You've Granted</h3>
                <p className="text-sm text-gray-500">Voice licenses you've given to others</p>
              </div>
              <div className="divide-y divide-gray-200">
                {grantedLicenses.map((license) => (
                  <div key={license.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <UserGroupIcon className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{license.voiceName}</h4>
                          <p className="text-sm text-gray-500">
                            Licensed to {license.licenseeName} ({license.licenseeEmail})
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLicenseTypeColor(license.licenseType)}`}>
                              {license.licenseType}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                              {license.status}
                            </span>
                            {license.price && (
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(license.price, license.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Usage Progress */}
                        {license.usageLimit && (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${calculateUsagePercentage(license.currentUsage, license.usageLimit)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {license.currentUsage}/{license.usageLimit}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedLicense(license)
                              setShowLicenseDetails(true)
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          {license.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveLicense(license.id)}
                                className="p-1 text-green-600 hover:text-green-800"
                              >
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleRevokeLicense(license.id)}
                                className="p-1 text-red-600 hover:text-red-800"
                              >
                                <XCircleIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {license.status === 'active' && (
                            <button
                              onClick={() => handleRevokeLicense(license.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {license.endDate && (
                      <div className="mt-2 text-xs text-gray-500">
                        Expires: {formatDate(license.endDate)}
                      </div>
                    )}
                  </div>
                ))}
                
                {grantedLicenses.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses granted</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You haven't granted any voice licenses yet.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowCreateLicense(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Your First License
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Received Licenses Tab */}
        {activeTab === 'received' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Licenses You've Received</h3>
                <p className="text-sm text-gray-500">Voice licenses others have granted to you</p>
              </div>
              <div className="divide-y divide-gray-200">
                {receivedLicenses.map((license) => (
                  <div key={license.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <KeyIcon className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{license.voiceName}</h4>
                          <p className="text-sm text-gray-500">
                            {license.licenseType} license
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(license.status)}`}>
                              {license.status}
                            </span>
                            {license.price && (
                              <span className="text-sm text-gray-600">
                                {formatCurrency(license.price, license.currency)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Usage Progress */}
                        {license.usageLimit && (
                          <div className="text-right">
                            <div className="text-xs text-gray-500 mb-1">
                              {license.currentUsage}/{license.usageLimit} uses
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  calculateUsagePercentage(license.currentUsage, license.usageLimit) > 80
                                    ? 'bg-red-600'
                                    : calculateUsagePercentage(license.currentUsage, license.usageLimit) > 60
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                                }`}
                                style={{ width: `${calculateUsagePercentage(license.currentUsage, license.usageLimit)}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedLicense(license)
                            setShowLicenseDetails(true)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {license.endDate && (
                      <div className="mt-2 text-xs text-gray-500">
                        Expires: {formatDate(license.endDate)}
                      </div>
                    )}
                  </div>
                ))}
                
                {receivedLicenses.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No licenses received</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any voice licenses from other users yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Voice Permissions Tab */}
        {activeTab === 'voices' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <GlobeAltIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Public Voices</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {voicePermissions.filter(v => v.isPublic).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <LockClosedIcon className="h-8 w-8 text-gray-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Private Voices</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {voicePermissions.filter(v => !v.isPublic).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Licenses</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {voicePermissions.reduce((sum, v) => sum + v.activeLicenses, 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Earnings</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {formatCurrency(voicePermissions.reduce((sum, v) => sum + v.monthlyEarnings, 0), 'USD')}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Your Voice Permissions</h3>
                <p className="text-sm text-gray-500">Manage licensing settings for your voices</p>
              </div>
              <div className="divide-y divide-gray-200">
                {voicePermissions.map((voice) => (
                  <div key={voice.voiceId} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            voice.isPublic ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {voice.isPublic ? (
                              <GlobeAltIcon className="h-5 w-5 text-green-600" />
                            ) : (
                              <LockClosedIcon className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{voice.voiceName}</h4>
                          <p className="text-sm text-gray-500">
                            {voice.isPublic ? 'Public' : 'Private'} • {voice.totalLicenses} total licenses
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              {voice.activeLicenses} active
                            </span>
                            {voice.pendingRequests > 0 && (
                              <span className="text-xs text-yellow-600">
                                {voice.pendingRequests} pending
                              </span>
                            )}
                            {voice.monthlyEarnings > 0 && (
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(voice.monthlyEarnings, 'USD')}/month
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* License Details Modal */}
        {showLicenseDetails && selectedLicense && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">License Details</h3>
                  <button
                    onClick={() => setShowLicenseDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{selectedLicense.voiceName}</h4>
                    <p className="text-sm text-gray-500">
                      {selectedLicense.licenseType} license for {selectedLicense.licenseeName}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className={`text-sm px-2 py-1 rounded-full inline-block ${getStatusColor(selectedLicense.status)}`}>
                        {selectedLicense.status}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm text-gray-900">{formatDate(selectedLicense.createdDate)}</dd>
                    </div>
                    {selectedLicense.price && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Price</dt>
                        <dd className="text-sm text-gray-900">
                          {formatCurrency(selectedLicense.price, selectedLicense.currency)}
                        </dd>
                      </div>
                    )}
                    {selectedLicense.endDate && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Expires</dt>
                        <dd className="text-sm text-gray-900">{formatDate(selectedLicense.endDate)}</dd>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Permissions</h5>
                    <div className="space-y-2">
                      {Object.entries(selectedLicense.permissions).map(([key, value]) => (
                        <div key={key} className="flex items-center">
                          {value ? (
                            <CheckCircleIconSolid className="h-4 w-4 text-green-600 mr-2" />
                          ) : (
                            <XCircleIconSolid className="h-4 w-4 text-red-600 mr-2" />
                          )}
                          <span className="text-sm text-gray-700">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {selectedLicense.restrictions && selectedLicense.restrictions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Restrictions</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedLicense.restrictions.map((restriction, index) => (
                          <li key={index} className="text-sm text-gray-600">{restriction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {selectedLicense.usageLimit && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Usage</h5>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${calculateUsagePercentage(selectedLicense.currentUsage, selectedLicense.usageLimit)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedLicense.currentUsage} / {selectedLicense.usageLimit}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowLicenseDetails(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {activeTab === 'granted' && selectedLicense.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveLicense(selectedLicense.id)
                          setShowLicenseDetails(false)
                        }}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          handleRevokeLicense(selectedLicense.id)
                          setShowLicenseDetails(false)
                        }}
                        className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
