'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  RotateCw,
  X,
  ArrowLeft,
  DollarSign,
  Download,
  Crown,
  Zap
} from 'lucide-react'
// import Header from '../../components/layout/Header'

interface BillingInfo {
  plan: string
  status: 'active' | 'cancelled' | 'past_due'
  nextBilling: Date
  amount: number
  currency: string
  paymentMethod: string
  cardLast4: string
}

interface Transaction {
  id: string
  date: Date
  description: string
  amount: number
  currency: string
  status: 'completed' | 'pending' | 'failed'
  downloadUrl?: string
}

export default function BillingPage() {
  const [currentBilling] = useState<BillingInfo>({
    plan: 'Creator',
    status: 'active',
    nextBilling: new Date('2024-02-15'),
    amount: 29,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    cardLast4: '4242'
  })

  const [transactions] = useState<Transaction[]>([
    {
      id: 'inv_001',
      date: new Date('2024-01-15'),
      description: 'Creator Plan - January 2024',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 'inv_002',
      date: new Date('2023-12-15'),
      description: 'Creator Plan - December 2023',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      downloadUrl: '#'
    },
    {
      id: 'inv_003',
      date: new Date('2023-11-15'),
      description: 'Creator Plan - November 2023',
      amount: 29,
      currency: 'USD',
      status: 'completed',
      downloadUrl: '#'
    }
  ])

  const [showCancelModal, setShowCancelModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-800 bg-green-100'
      case 'cancelled': return 'text-gray-800 bg-gray-100'
      case 'past_due': return 'text-red-800 bg-red-100'
      case 'completed': return 'text-green-800 bg-green-100'
      case 'pending': return 'text-yellow-800 bg-yellow-100'
      case 'failed': return 'text-red-800 bg-red-100'
      default: return 'text-gray-800 bg-gray-100'
    }
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
      month: 'long',
      day: 'numeric'
    })
  }

  const CancelSubscriptionModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Cancel Subscription</h3>
            <button
              onClick={() => setShowCancelModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-yellow-800">
                  You'll continue to have access to your Creator plan features until {formatDate(currentBilling.nextBilling)}.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">What happens when you cancel:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your subscription will not renew</li>
                <li>• You'll keep access until {formatDate(currentBilling.nextBilling)}</li>
                <li>• Your voice clones will be preserved</li>
                <li>• You can reactivate anytime</li>
              </ul>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowCancelModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Keep Subscription
            </button>
            <button
              onClick={() => {
                // Handle cancellation
                console.log('Subscription cancelled')
                alert('Subscription has been cancelled')
                setShowCancelModal(false)
              }}
              className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  )

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
              <DollarSign className="h-8 w-8 text-berry-600" />
              <span>Billing & Subscription 💳</span>
            </h1>
            <p className="text-navy/70">
              Manage your subscription and payment details
            </p>
          </div>
        </motion.div>
        {/* Company Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-berry-500 to-twilight-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-berry-600 to-twilight-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
          <p className="text-navy/70">
            Secure billing powered by <span className="font-semibold text-berry-600">VCaaS Platform</span>
          </p>
        </motion.div>

        {/* Current Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="glass-card mb-8"
        >
          <div className="p-6 border-b border-navy/10">
            <h3 className="text-xl font-semibold text-navy flex items-center space-x-2">
              <Crown className="w-6 h-6 text-berry-600" />
              <span>Current Subscription</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-2xl font-bold text-navy">{currentBilling.plan} Plan</h4>
                <p className="text-3xl font-bold bg-gradient-to-r from-berry-600 to-twilight-600 bg-clip-text text-transparent mt-1">
                  {formatCurrency(currentBilling.amount, currentBilling.currency)}
                  <span className="text-lg text-navy/60 font-normal">/month</span>
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${
                currentBilling.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                <CheckCircle className="w-4 h-4" />
                <span className="capitalize">{currentBilling.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-navy">Next Billing Date</p>
                  <p className="text-sm text-navy/70">{formatDate(currentBilling.nextBilling)}</p>
                </div>
              </div>
              
              <div className="glass-card p-4 flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-navy">Payment Method</p>
                  <p className="text-sm text-navy/70">{currentBilling.paymentMethod} •••• {currentBilling.cardLast4}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Link 
                href="/pricing"
                className="btn-primary px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
              >
                <Zap className="h-4 w-4" />
                <span>Upgrade Plan</span>
              </Link>
              <button
                onClick={() => {
                  // Handle payment method update
                  alert('Payment method update would be implemented here')
                }}
                className="btn-secondary px-6 py-3 rounded-lg flex items-center justify-center space-x-2 font-medium"
              >
                <CreditCard className="h-4 w-4" />
                <span>Update Payment</span>
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-3 rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center space-x-2 font-medium"
              >
                <X className="h-4 w-4" />
                <span>Cancel Subscription</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Usage Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="glass-card mb-8"
        >
          <div className="p-6 border-b border-navy/10">
            <h3 className="text-xl font-semibold text-navy flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">%</span>
              </div>
              <span>Current Usage</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-navy">Voice Clones</span>
                  <span className="text-sm text-navy/70 font-semibold">3 / 10</span>
                </div>
                <div className="w-full bg-navy/20 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-berry-500 to-twilight-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '30%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-navy">Monthly Generation</span>
                  <span className="text-sm text-navy/70 font-semibold">2.5h / 5h</span>
                </div>
                <div className="w-full bg-navy/20 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '50%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-navy">API Calls</span>
                  <span className="text-sm text-navy/70 font-semibold">1,250 / 10,000</span>
                </div>
                <div className="w-full bg-navy/20 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '12.5%' }}
                    transition={{ duration: 1, delay: 0.9 }}
                  />
                </div>
              </motion.div>
            </div>
            
            <div className="mt-6 p-4 glass-card bg-blue-50/30">
              <p className="text-navy/70 text-center">
                🔄 Usage resets on <span className="font-semibold text-navy">{formatDate(currentBilling.nextBilling)}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Billing History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="glass-card"
        >
          <div className="p-6 border-b border-navy/10">
            <h3 className="text-xl font-semibold text-navy flex items-center space-x-2">
              <FileText className="w-6 h-6 text-berry-600" />
              <span>Billing History</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy/60 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {transactions.map((transaction, index) => (
                  <motion.tr 
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="hover:bg-white/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-navy">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-navy">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-navy">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        <CheckCircle className="w-3 h-3" />
                        <span className="capitalize">{transaction.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.downloadUrl && (
                        <button
                          onClick={() => {
                            console.log(`Downloading invoice ${transaction.id}`)
                            alert('Invoice download would be implemented here')
                          }}
                          className="text-berry-600 hover:text-berry-700 inline-flex items-center space-x-1 font-medium hover:bg-berry-50 px-2 py-1 rounded transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Footer Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8 pt-6 border-t border-navy/20"
        >
          <div className="flex justify-center items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-berry-500 to-twilight-500 rounded-full flex items-center justify-center shadow-sm">
              <div className="w-5 h-5 bg-gradient-to-r from-berry-600 to-twilight-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            <p className="text-navy/70">
              🔒 Secure billing powered by <span className="font-semibold text-berry-600">VCaaS Platform</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && <CancelSubscriptionModal />}
    </div>
  )
}
