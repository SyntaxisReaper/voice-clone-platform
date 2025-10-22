'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
// import { submitSecurityReport, SecurityReportData } from '@/lib/api'
// import { useToast, ToastContainer } from '@/components/ui/Toast'
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  Globe,
  Info,
  CheckCircle,
  X,
  ChevronRight,
  ChevronDown,
  Bug,
  Cpu,
  Volume2,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Download,
  HelpCircle
} from 'lucide-react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const { toasts, dismissToast, showSuccess, showError } = useToast()

  // Mock data
  const securityTips: SecurityTip[] = [
    {
      id: 'tip-1',
      title: 'Voice Authentication Best Practices',
      description: 'Always verify requests for voice samples through multiple channels before sharing access.',
      severity: 'high',
      category: 'voice',
      icon: Volume2
    },
    {
      id: 'tip-2',
      title: 'Enable Two-Factor Authentication',
      description: 'Add an extra layer of security to your account with 2FA to prevent unauthorized access.',
      severity: 'high',
      category: 'account',
      icon: Lock
    },
    {
      id: 'tip-3',
      title: 'Monitor Voice Usage Regularly',
      description: 'Review your voice usage logs frequently to detect any unauthorized generation activity.',
      severity: 'medium',
      category: 'voice',
      icon: Eye
    },
    {
      id: 'tip-4',
      title: 'Watermark Your Audio',
      description: 'Always enable watermarking to track and identify your generated audio content.',
      severity: 'medium',
      category: 'voice',
      icon: Shield
    },
    {
      id: 'tip-5',
      title: 'Review License Agreements',
      description: 'Carefully read and understand licensing terms before granting voice permissions.',
      severity: 'medium',
      category: 'privacy',
      icon: FileText
    },
    {
      id: 'tip-6',
      title: 'Keep Software Updated',
      description: 'Regularly update your browser and operating system to patch security vulnerabilities.',
      severity: 'low',
      category: 'general',
      icon: Cpu
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
        return AlertTriangle
      case 'warning':
      case 'medium':
        return AlertTriangle
      default:
        return Info
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!reportForm.description.trim()) {
      showError('Validation Error', 'Please provide a description of the security issue.')
      return
    }
    
    if (!reportForm.anonymous && !reportForm.email.trim()) {
      showError('Validation Error', 'Please provide an email address or submit anonymously.')
      return
    }
    
    if (reportForm.description.trim().length < 10) {
      showError('Validation Error', 'Description must be at least 10 characters long.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const reportData: SecurityReportData = {
        type: reportForm.type as SecurityReportData['type'],
        severity: reportForm.severity as SecurityReportData['severity'],
        description: reportForm.description.trim(),
        email: reportForm.anonymous ? undefined : reportForm.email.trim(),
        anonymous: reportForm.anonymous
      }
      
      const response = await submitSecurityReport(reportData)
      
      showSuccess(
        'Report Submitted Successfully',
        'Thank you for helping us improve security. We will review your report and respond if necessary.',
        7000
      )
      
      // Reset form
      setReportForm({
        type: 'security',
        severity: 'medium', 
        description: '',
        email: '',
        anonymous: false
      })
      
    } catch (error: any) {
      console.error('Error submitting security report:', error)
      
      let errorMessage = 'Please try again or contact support directly.'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.message) {
        errorMessage = error.message
      }
      
      showError('Submission Failed', errorMessage, 10000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex items-center space-x-4"
        >
          <Link href="/dashboard" className="p-2 glass-button rounded-lg hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-5 w-5 text-navy" />
          </Link>
          <div>
            <h1 className="text-3xl font-poppins font-bold text-navy mb-2 flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-berry-600" />
              <span>Security Help 🔒</span>
            </h1>
            <p className="text-navy/70">
              Comprehensive security resources and threat protection
            </p>
          </div>
        </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-card p-2 mb-8 rounded-full"
        >
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-berry-500 to-twilight-500 text-white shadow-lg'
                  : 'text-navy/70 hover:text-navy hover:bg-white/30'
              }`}
            >
              🛡️ Security Tips
            </button>
            <button
              onClick={() => setActiveTab('threats')}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === 'threats'
                  ? 'bg-gradient-to-r from-berry-500 to-twilight-500 text-white shadow-lg'
                  : 'text-navy/70 hover:text-navy hover:bg-white/30'
              }`}
            >
              ⚠️ Threats
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === 'resources'
                  ? 'bg-gradient-to-r from-berry-500 to-twilight-500 text-white shadow-lg'
                  : 'text-navy/70 hover:text-navy hover:bg-white/30'
              }`}
            >
              📚 Resources
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-6 py-3 rounded-full font-medium text-sm transition-all ${
                activeTab === 'contact'
                  ? 'bg-gradient-to-r from-berry-500 to-twilight-500 text-white shadow-lg'
                  : 'text-navy/70 hover:text-navy hover:bg-white/30'
              }`}
            >
              📧 Contact
            </button>
          </nav>
        </motion.div>

        {/* Security Tips Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Security Overview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 bg-gradient-to-r from-berry-500/10 to-twilight-500/10"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-berry-500 to-twilight-500 rounded-full flex items-center justify-center mr-4">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-navy">Voice Security Status</h2>
                  <p className="text-navy/70">Your account security is strong ✨</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4 bg-green-50/30">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-navy">2FA Enabled</span>
                  </div>
                </div>
                <div className="glass-card p-4 bg-green-50/30">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-navy">Watermarking Active</span>
                  </div>
                </div>
                <div className="glass-card p-4 bg-yellow-50/30">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-navy">1 Voice Public</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Security Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {securityTips.map((tip, index) => {
                const Icon = tip.icon
                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className={`glass-card p-6 hover:bg-white/40 transition-all cursor-pointer group`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tip.severity === 'high' ? 'bg-red-100 text-red-600' :
                        tip.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-navy mb-2 group-hover:text-berry-600 transition-colors">
                          {tip.title}
                        </h3>
                        <p className="text-sm text-navy/70 mb-3">{tip.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tip.severity === 'high' ? 'bg-red-100 text-red-800' :
                            tip.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {tip.severity} priority
                          </span>
                          <span className="text-xs text-navy/50 capitalize bg-navy/10 px-2 py-1 rounded-full">
                            {tip.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-navy mb-6 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-berry-600" />
                <span>Quick Security Actions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link 
                  href="/licensing" 
                  className="flex items-center p-4 glass-card hover:bg-white/40 transition-all group rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-berry-500/20 to-twilight-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Shield className="h-5 w-5 text-berry-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-medium text-navy group-hover:text-berry-600 transition-colors">
                    Voice Permissions
                  </span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="flex items-center p-4 glass-card hover:bg-white/40 transition-all group rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Eye className="h-5 w-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-medium text-navy group-hover:text-blue-600 transition-colors">
                    Usage Logs
                  </span>
                </Link>
                <Link 
                  href="#" 
                  className="flex items-center p-4 glass-card hover:bg-white/40 transition-all group rounded-lg"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-green-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-medium text-navy group-hover:text-green-600 transition-colors">
                    Security Guide
                  </span>
                </Link>
                <button className="flex items-center p-4 glass-card hover:bg-white/40 transition-all group rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                    <Bug className="h-5 w-5 text-red-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="font-medium text-navy group-hover:text-red-600 transition-colors">
                    Report Issue
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Threat Alerts Tab */}
        {activeTab === 'threats' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-navy/10">
                <h3 className="text-xl font-semibold text-navy flex items-center space-x-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <span>Current Threat Alerts</span>
                </h3>
                <p className="text-navy/70 mt-1">Stay informed about security threats and updates</p>
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
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                        Submit Security Report
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      
      </div>
    </div>
  )
}
