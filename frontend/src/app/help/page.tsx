'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  BugAntIcon,
  CpuChipIcon,
  SpeakerWaveIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import {
  ShieldCheckIcon as ShieldCheckIconSolid,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/solid'

interface SecurityTip {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  category: 'voice' | 'account' | 'privacy' | 'general'
  icon: React.ElementType
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: 'security' | 'voice' | 'licensing' | 'technical'
}

interface ThreatAlert {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
  date: Date
  isActive: boolean
}

export default function CyberHelpPage() {
  const [activeTab, setActiveTab] = useState<'security' | 'threats' | 'resources' | 'contact'>('security')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [reportForm, setReportForm] = useState({
    type: 'security',
    severity: 'medium',
    description: '',
    email: '',
    anonymous: false
  })

  // Mock data
  const securityTips: SecurityTip[] = [
    {
      id: 'tip-1',
      title: 'Voice Authentication Best Practices',
      description: 'Always verify requests for voice samples through multiple channels before sharing access.',
      severity: 'high',
      category: 'voice',
      icon: SpeakerWaveIcon
    },
    {
      id: 'tip-2',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account with 2FA to prevent unauthorized access.',
      severity: 'high',
      category: 'account',
      icon: LockClosedIcon
    },
    {
      id: 'tip-3',
      title: 'Monitor Voice Usage Regularly',
      description: 'Review your voice usage logs frequently to detect any unauthorized generation activity.',
      severity: 'medium',
      category: 'voice',
      icon: EyeIcon
    },
    {
      id: 'tip-4',
      title: 'Watermark Your Audio',
      description: 'Always enable watermarking to track and identify your generated audio content.',
      severity: 'medium',
      category: 'voice',
      icon: ShieldCheckIcon
    },
    {
      id: 'tip-5',
      title: 'Review License Agreements',
      description: 'Carefully read and understand licensing terms before granting voice permissions.',
      severity: 'medium',
      category: 'privacy',
      icon: DocumentTextIcon
    },
    {
      id: 'tip-6',
      title: 'Keep Software Updated',
      description: 'Regularly update your browser and operating system to patch security vulnerabilities.',
      severity: 'low',
      category: 'general',
      icon: CpuChipIcon
    }
  ]

  const threatAlerts: ThreatAlert[] = [
    {
      id: 'threat-1',
      title: 'Voice Cloning Phishing Campaign Detected',
      description: 'Attackers are impersonating voice clone services to steal credentials. Always verify URLs and use official channels.',
      severity: 'warning',
      date: new Date('2024-01-15'),
      isActive: true
    },
    {
      id: 'threat-2',
      title: 'Deepfake Detection Tools Updated',
      description: 'New AI detection algorithms have been integrated to better identify synthetic audio content.',
      severity: 'info',
      date: new Date('2024-01-10'),
      isActive: true
    }
  ]

  const faqs: FAQ[] = [
    {
      id: 'faq-1',
      question: 'How can I protect my voice from unauthorized cloning?',
      answer: 'Use strong authentication, enable watermarking, regularly monitor usage logs, and only share voice samples with trusted parties through secure channels.',
      category: 'voice'
    },
    {
      id: 'faq-2',
      question: 'What should I do if I suspect my voice has been cloned without permission?',
      answer: 'Immediately report it through our security contact, gather evidence of unauthorized usage, and consider legal consultation if commercial harm occurred.',
      category: 'security'
    },
    {
      id: 'faq-3',
      question: 'How does watermarking protect my generated audio?',
      answer: 'Watermarking embeds invisible identifiers in your audio that can prove ownership and track usage even if the audio is modified or redistributed.',
      category: 'technical'
    },
    {
      id: 'faq-4',
      question: 'Can I revoke voice licenses after granting them?',
      answer: 'Yes, you can revoke active licenses at any time from the licensing panel. However, audio already generated under the license may still be valid depending on your terms.',
      category: 'licensing'
    },
    {
      id: 'faq-5',
      question: 'How do I report suspicious voice generation activity?',
      answer: 'Use the report form in the cyber help section, contact our security team directly, or email security@voiceclone.com with details and evidence.',
      category: 'security'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high': 
        return 'text-red-800 bg-red-100 border-red-200'
      case 'warning':
      case 'medium': 
        return 'text-yellow-800 bg-yellow-100 border-yellow-200'
      case 'info':
      case 'low': 
        return 'text-green-800 bg-green-100 border-green-200'
      default: 
        return 'text-gray-800 bg-gray-100 border-gray-200'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return ExclamationTriangleIconSolid
      case 'warning':
      case 'medium':
        return ExclamationTriangleIcon
      default:
        return InformationCircleIcon
    }
  }

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit report to backend
    console.log('Report submitted:', reportForm)
    // Reset form
    setReportForm({
      type: 'security',
      severity: 'medium', 
      description: '',
      email: '',
      anonymous: false
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/dashboard" className="mr-3 p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
                <ShieldCheckIcon className="h-6 w-6 sm:h-7 sm:w-7 text-primary-600 mr-2" />
                <span className="hidden sm:inline">Cyber Security </span>Help
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Security resources and threat information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security Tips
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'threats'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Threat Alerts
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Resources & </span>FAQ
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'contact'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="hidden sm:inline">Report & </span>Contact
            </button>
          </nav>
        </div>

        {/* Security Tips Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Overview */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center">
                <ShieldCheckIconSolid className="h-8 w-8 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">Voice Security Status</h2>
                  <p className="text-blue-100">Your account security is strong</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-300 mr-2" />
                    <span className="text-sm">2FA Enabled</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-300 mr-2" />
                    <span className="text-sm">Watermarking Active</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-300 mr-2" />
                    <span className="text-sm">1 Voice Public</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityTips.map((tip) => (
                <div key={tip.id} className={`border-l-4 rounded-lg p-6 bg-white shadow ${getSeverityColor(tip.severity)}`}>
                  <div className="flex items-start">
                    <tip.icon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{tip.description}</p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(tip.severity)}`}>
                          {tip.severity} priority
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{tip.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Security Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShieldCheckIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-sm font-medium">Review Voice Permissions</span>
                </button>
                <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <EyeIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-sm font-medium">Check Usage Logs</span>
                </button>
                <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <LockClosedIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-sm font-medium">Update Password</span>
                </button>
                <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <BugAntIcon className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-sm font-medium">Report Issue</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Threat Alerts Tab */}
        {activeTab === 'threats' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Current Threat Alerts</h3>
                <p className="text-sm text-gray-500">Stay informed about security threats and updates</p>
              </div>
              <div className="divide-y divide-gray-200">
                {threatAlerts.map((alert) => {
                  const SeverityIcon = getSeverityIcon(alert.severity)
                  return (
                    <div key={alert.id} className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 p-1 rounded-full ${
                          alert.severity === 'critical' ? 'bg-red-100' :
                          alert.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <SeverityIcon className={`h-5 w-5 ${
                            alert.severity === 'critical' ? 'text-red-600' :
                            alert.severity === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900">{alert.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            {alert.isActive && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-2">{alert.date.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Threat Prevention Tips */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Threat Prevention</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Voice Authentication</h4>
                    <p className="text-sm text-gray-600">Always verify the identity of users requesting voice access through multiple channels.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <EyeIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Regular Monitoring</h4>
                    <p className="text-sm text-gray-600">Check your usage logs and alerts regularly to detect suspicious activity early.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <LockClosedIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-gray-900">Secure Communication</h4>
                    <p className="text-sm text-gray-600">Use encrypted channels when sharing voice samples or discussing licensing agreements.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources & FAQ Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Frequently Asked Questions</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {faqs.map((faq) => (
                  <div key={faq.id} className="px-6 py-4">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      {expandedFaq === faq.id ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedFaq === faq.id && (
                      <div className="mt-2 text-sm text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* External Resources */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="#"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Security Best Practices Guide</h4>
                    <p className="text-sm text-gray-600">Comprehensive security guidelines</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <GlobeAltIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Industry Security Reports</h4>
                    <p className="text-sm text-gray-600">Latest threat intelligence</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CpuChipIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Technical Documentation</h4>
                    <p className="text-sm text-gray-600">Security implementation details</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">Community Forum</h4>
                    <p className="text-sm text-gray-600">Discuss security with other users</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Report & Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">security@voiceclone.com</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Emergency Hotline</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Report Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Report Security Issue</h3>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Type
                    </label>
                    <select
                      value={reportForm.type}
                      onChange={(e) => setReportForm({...reportForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="security">Security Vulnerability</option>
                      <option value="fraud">Fraudulent Activity</option>
                      <option value="unauthorized">Unauthorized Voice Usage</option>
                      <option value="data">Data Privacy Concern</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      value={reportForm.severity}
                      onChange={(e) => setReportForm({...reportForm, severity: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={reportForm.description}
                    onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                    placeholder="Please provide detailed information about the security issue..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white resize-none"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={reportForm.email}
                    onChange={(e) => setReportForm({...reportForm, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="anonymous"
                    type="checkbox"
                    checked={reportForm.anonymous}
                    onChange={(e) => setReportForm({...reportForm, anonymous: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
                    Submit anonymously (we won't be able to follow up)
                  </label>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    Submit Security Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
