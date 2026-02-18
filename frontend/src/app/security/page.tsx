'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  AlertTriangle,
  Lock,
  Eye,
  Shield,
  FileText,
  Zap
} from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-berry-500 to-twilight-600 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-poppins font-bold text-navy">Security Center</h1>
            <p className="text-navy/70">Your account, voices, and generations at a glance</p>
          </div>
        </motion.div>

        {/* Status cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            {
              title: '2FA',
              value: 'Enabled',
              icon: Lock,
              tone: 'bg-green-50 text-green-700',
            },
            {
              title: 'Watermarking',
              value: 'Active',
              icon: Shield,
              tone: 'bg-green-50 text-green-700',
            },
            {
              title: 'Active Licenses',
              value: '3',
              icon: FileText,
              tone: 'bg-blue-50 text-blue-700',
            },
            {
              title: 'Alerts (30d)',
              value: '0',
              icon: AlertTriangle,
              tone: 'bg-emerald-50 text-emerald-700',
            },
          ].map((c, i) => {
            const Icon = c.icon
            return (
              <div key={c.title} className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-navy/60">{c.title}</span>
                </div>
                <div className="text-2xl font-semibold text-navy">{c.value}</div>
              </div>
            )
          })}
        </motion.div>

        {/* Recent activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div className="lg:col-span-2 glass-card p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Recent Activity</h2>
            <ul className="divide-y divide-navy/10">
              {[ 
                { id: 1, title: 'Login verified', meta: 'New device · 2 hours ago' },
                { id: 2, title: 'License updated', meta: 'Voice “Atlas” · yesterday' },
                { id: 3, title: 'Generation watermarked', meta: 'Project “Promo” · 2 days ago' },
              ].map(item => (
                <li key={item.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-navy">{item.title}</p>
                    <p className="text-xs text-navy/60">{item.meta}</p>
                  </div>
                  <Eye className="h-4 w-4 text-navy/40" />
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/licensing" className="flex items-center justify-between px-4 py-3 rounded-xl glass-card hover:bg-white/40 transition">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-berry-600" />
                  <span className="text-sm text-navy">Manage Voice Permissions</span>
                </div>
                <Zap className="h-4 w-4 text-navy/40" />
              </Link>
              <Link href="/help" className="flex items-center justify-between px-4 py-3 rounded-xl glass-card hover:bg-white/40 transition">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-navy">Report Security Issue</span>
                </div>
                <Zap className="h-4 w-4 text-navy/40" />
              </Link>
              <Link href="/dashboard" className="flex items-center justify-between px-4 py-3 rounded-xl glass-card hover:bg-white/40 transition">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-navy">View Usage Logs</span>
                </div>
                <Zap className="h-4 w-4 text-navy/40" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
