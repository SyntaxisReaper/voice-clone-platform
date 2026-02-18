'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  CheckIcon,
  XMarkIcon,
  StarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { subscriptionPlans, formatPrice, calculateYearlySavings } from '@/lib/subscription'

interface PricingFeature {
  name: string
  starter: boolean | string
  pro: boolean | string  
  enterprise: boolean | string
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const features: PricingFeature[] = [
    {
      name: 'Voice Models',
      starter: '3 models',
      pro: '15 models',
      enterprise: 'Unlimited'
    },
    {
      name: 'Monthly Minutes',
      starter: '60 minutes',
      pro: '500 minutes', 
      enterprise: '2500 minutes'
    },
    {
      name: 'Voice Quality',
      starter: 'Basic',
      pro: 'High-quality',
      enterprise: 'Premium'
    },
    {
      name: 'Storage',
      starter: '1GB',
      pro: '10GB',
      enterprise: '100GB'
    },
    {
      name: 'API Access',
      starter: false,
      pro: true,
      enterprise: true
    },
    {
      name: 'Custom Voice Training',
      starter: false,
      pro: true,
      enterprise: true
    },
    {
      name: 'Priority Support',
      starter: false,
      pro: true,
      enterprise: true
    },
    {
      name: 'Advanced Analytics',
      starter: false,
      pro: false,
      enterprise: true
    },
    {
      name: 'White-label Options',
      starter: false,
      pro: false,
      enterprise: true
    },
    {
      name: 'Custom Integrations',
      starter: false,
      pro: false,
      enterprise: true
    },
    {
      name: 'Dedicated Support',
      starter: false,
      pro: false,
      enterprise: '24/7 Support'
    }
  ]

  const getPrice = (plan: any) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.price
  }

  const getPriceDisplay = (plan: any) => {
    const price = getPrice(plan)
    if (price === 0) return 'Free'
    
    if (billingCycle === 'yearly') {
      return `$${price}/year`
    }
    return `$${price}/month`
  }

  const getSavings = (plan: any) => {
    if (billingCycle === 'monthly' || plan.price === 0) return null
    const savings = calculateYearlySavings(plan.price, plan.yearlyPrice)
    if (savings <= 0) return null
    return `Save $${savings}/year`
  }

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckIcon className="h-5 w-5 text-green-500" />
      ) : (
        <XMarkIcon className="h-5 w-5 text-gray-300" />
      )
    }
    return <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
  }

  const getButtonStyles = (plan: any) => {
    if (plan.color === 'primary') {
      return 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600'
    } else if (plan.color === 'accent') {
      return 'bg-accent-600 hover:bg-accent-700 text-white border-accent-600'
    } else {
      return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600'
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass gradient-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <CreditCardIcon className="h-8 w-8 text-primary-600 dark:text-primary-500" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Pricing</span>
              </div>
            </div>
            <Link 
              href="/login"
              className="btn-shine bg-gradient-to-r from-primary-600 via-emerald-500 to-cyan-500 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-md hover:opacity-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="typewriter text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-emerald-500 to-cyan-500 mb-6">
            Choose Your Voice Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            From individuals to enterprises, we have the perfect plan to bring your voice cloning projects to life.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {subscriptionPlans.map((plan, index) => {
            const savings = getSavings(plan)
            return (
              <div
                key={plan.id}
                className={`relative glass gradient-border rounded-2xl transition-all duration-200 hover:shadow-xl ${
                  plan.popular
                    ? 'border-primary-500 dark:border-primary-400 scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary-600 dark:bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {plan.description}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-gray-900 dark:text-white">
                          {getPrice(plan) === 0 ? 'Free' : `$${getPrice(plan)}`}
                        </span>
                        {getPrice(plan) > 0 && (
                          <span className="text-gray-600 dark:text-gray-300 ml-1">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </span>
                        )}
                      </div>
                      {savings && (
                        <div className="text-green-600 dark:text-green-400 text-sm font-medium mt-1">
                          {savings}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="ml-3 text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={plan.price === 0 ? "/signup" : "/billing"}
                    className={`w-full flex justify-center py-3 px-6 border-2 rounded-lg font-medium transition-colors ${getButtonStyles(plan)}`}
                  >
                    {plan.price === 0 ? 'Get Started Free' : `Start ${plan.name} Plan`}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              Compare All Features
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">
                    Features
                  </th>
                  {subscriptionPlans.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 text-center text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr key={feature.name} className={`${
                    index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                  } border-b border-gray-200 dark:border-gray-600`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderFeatureValue(feature.starter)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderFeatureValue(feature.pro)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderFeatureValue(feature.enterprise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16">
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Secure & Private</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">End-to-end encryption</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Global Infrastructure</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">99.9% uptime guarantee</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <RocketLaunchIcon className="h-8 w-8 text-purple-500" />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">Lightning Fast</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Real-time processing</div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan at any time?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be charged pro-rated amounts.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We offer a 30-day money-back guarantee for all paid plans. Contact support if you're not satisfied.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We'll notify you when you're approaching your limits. You can upgrade your plan or purchase additional usage credits.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there an Enterprise trial available?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Contact our sales team for a custom Enterprise trial with access to all premium features.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Clone Your Voice?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of creators, businesses, and developers who trust our platform for their voice cloning needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}