'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  PlayCircle, 
  Settings, 
  User, 
  Menu, 
  X, 
  Sparkles,
  Shield,
  BarChart3,
  CreditCard
} from 'lucide-react'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Playground', href: '/playground', icon: PlayCircle },
    { name: 'Training', href: '/training', icon: Mic },
    { name: 'Billing', href: '/billing', icon: CreditCard },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'glass-navbar backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-berry-500 to-berry-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-berry-500/25 transition-all duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-berry-500 to-twilight-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-poppins font-bold gradient-text-berry">VCaaS</h1>
              <p className="text-xs text-navy/70 -mt-1">Voice Clone as a Service</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                    ${isActive(item.href)
                      ? 'text-berry-600 bg-white/20'
                      : 'text-navy hover:text-berry-600 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  
                  {isActive(item.href) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-berry-500 to-berry-600 rounded-full"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {/* Create Voice Button */}
            <Link
              href="/training"
              className="hidden sm:flex items-center space-x-2 btn-primary text-sm px-4 py-2 rounded-lg"
            >
              <Mic className="w-4 h-4" />
              <span>Create Voice</span>
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="glass-button p-2 rounded-lg hover:bg-white/20 transition-all duration-300">
                <User className="w-5 h-5 text-navy" />
              </button>
              
              {/* Dropdown - You can expand this later */}
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="p-2">
                  <Link href="/profile" className="flex items-center space-x-2 px-3 py-2 text-sm text-navy hover:bg-white/20 rounded-lg">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link href="/settings" className="flex items-center space-x-2 px-3 py-2 text-sm text-navy hover:bg-white/20 rounded-lg">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden glass-button p-2 rounded-lg"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-navy" />
              ) : (
                <Menu className="w-5 h-5 text-navy" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden glass-card mx-4 mt-2 rounded-lg overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300
                      ${isActive(item.href)
                        ? 'text-berry-600 bg-white/20'
                        : 'text-navy hover:text-berry-600 hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="pt-2 border-t border-white/20">
                <Link
                  href="/training"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-berry-500 to-berry-600 text-white rounded-lg font-medium"
                >
                  <Mic className="w-5 h-5" />
                  <span>Create Voice</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}