'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MicrophoneIcon, 
  SpeakerWaveIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  PlayIcon,
  StopIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Logo from '../components/common/Logo'

export default function Home() {
  const [isRecording, setIsRecording] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: MicrophoneIcon,
      title: 'Voice Recording',
      description: 'Record high-quality voice samples for training'
    },
    {
      icon: SpeakerWaveIcon,
      title: 'AI Voice Cloning',
      description: 'Clone voices with advanced AI models'
    },
    {
      icon: ChartBarIcon,
      title: 'Usage Dashboard',
      description: 'Monitor your voice usage and analytics'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Licensed',
      description: 'Watermarked audio with permission controls'
    }
  ]

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <Logo size="md" variant="full" />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link href="/training" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Voice Training
              </Link>
              <Link href="/playground" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Playground
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Pricing
              </Link>
              
              {/* Auth Buttons */}
              <div className="flex items-center space-x-2 ml-4 border-l border-gray-300 pl-4">
                <Link href="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-primary-600 p-2"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/training" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Voice Training
                </Link>
                <Link 
                  href="/playground" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Playground
                </Link>
                <Link 
                  href="/pricing" 
                  className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                
                {/* Auth Links - Mobile */}
                <div className="border-t border-gray-200 pt-2 mt-4">
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-primary-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/signup" 
                    className="bg-primary-600 hover:bg-primary-700 text-white block px-3 py-2 rounded-md text-base font-medium mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-8">
              VCAAS: Voice Cloning
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                {' '}as a Service
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Create realistic voice clones, generate speech with emotional control, 
              and manage your voice assets with advanced security and licensing features.
            </p>
            
            {/* Quick Demo */}
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto mb-16">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Try Voice Recording</h3>
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isRecording ? (
                    <StopIcon className="h-8 w-8 text-white" />
                  ) : (
                    <MicrophoneIcon className="h-8 w-8 text-white" />
                  )}
                </button>
                <p className="text-gray-600">
                  {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300 ${
                      isRecording ? 'w-full animate-pulse' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful Voice Cloning Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, manage, and protect your voice clones
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="voice-card bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl border border-gray-200"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Ready to Clone Your Voice?
          </h2>
          <p className="text-xl text-primary-100 mb-12">
            Join thousands of creators using AI voice cloning for content creation, 
            accessibility, and creative projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-block">
              Start Free Trial
            </Link>
            <Link href="/pricing" className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors inline-block">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo size="md" variant="full" textColor="light" />
              <span className="ml-2 text-sm text-gray-400">by Ritesh Kumar Mishra</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms</a>
              <a href="#" className="text-gray-400 hover:text-white">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 VCAAS - Voice Cloning as a Service. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
