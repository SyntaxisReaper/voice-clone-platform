'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CreditCardIcon,
  CalendarIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Header from '../../components/layout/Header'

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
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-3" />
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
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Billing & Subscription" 
        subtitle="Manage your subscription and payment details"
        backLink="/dashboard"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company Branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-red-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Managed by <span className="font-semibold text-primary-600">Ritesh Kumar Mishra</span>
          </p>
        </div>

        {/* Current Subscription */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{currentBilling.plan} Plan</h4>
                <p className="text-2xl font-bold text-primary-600 mt-1">
                  {formatCurrency(currentBilling.amount, currentBilling.currency)}
                  <span className="text-sm text-gray-500 font-normal">/month</span>
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentBilling.status)}`}>
                {currentBilling.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Billing Date</p>
                  <p className="text-sm text-gray-600">{formatDate(currentBilling.nextBilling)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment Method</p>
                  <p className="text-sm text-gray-600">{currentBilling.paymentMethod} •••• {currentBilling.cardLast4}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Link 
                href="/pricing"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Link>
              <button
                onClick={() => {
                  // Handle payment method update
                  alert('Payment method update would be implemented here')
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <CreditCardIcon className="h-4 w-4 mr-2" />
                Update Payment Method
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Current Usage</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Voice Clones</span>
                  <span className="text-sm text-gray-600">3 / 10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Monthly Generation</span>
                  <span className="text-sm text-gray-600">2.5h / 5h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">API Calls</span>
                  <span className="text-sm text-gray-600">1,250 / 10,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '12.5%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Usage resets on {formatDate(currentBilling.nextBilling)}
            </div>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {transaction.downloadUrl && (
                        <button
                          onClick={() => {
                            console.log(`Downloading invoice ${transaction.id}`)
                            alert('Invoice download would be implemented here')
                          }}
                          className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                        >
                          <DocumentIcon className="h-4 w-4 mr-1" />
                          Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-red-500 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-600">
              Secure billing powered by <span className="font-semibold text-gray-900">Ritesh Kumar Mishra</span>
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && <CancelSubscriptionModal />}
    </div>
  )
}
