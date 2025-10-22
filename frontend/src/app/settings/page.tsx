'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Volume2,
  Download,
  Upload,
  Trash2,
  Key,
  Mail,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Zap,
  Database,
  Cloud,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'system', // light, dark, system
    colorScheme: 'twilight-berry',
    glassEffect: true,
    animations: true,
    compactMode: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    soundNotifications: false,
    marketingEmails: false,
    securityAlerts: true,
    
    // Privacy & Security
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    dataRetention: 90, // days
    analyticsTracking: true,
    
    // Voice & Audio
    defaultVoiceQuality: 'high', // low, medium, high, ultra
    audioFormat: 'wav', // wav, mp3, flac
    sampleRate: 44100,
    autoWatermark: true,
    
    // API & Integration
    rateLimitWarning: true,
    webhookRetries: 3,
    apiTimeout: 30, // seconds
    
    // Storage
    autoBackup: true,
    cloudSync: true,
    localCache: true,
    storageLimit: 5000, // MB
    
    // Language & Region
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  })

  const [activeTab, setActiveTab] = useState('general')

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'voice', name: 'Voice & Audio', icon: Volume2 },
    { id: 'api', name: 'API & Integration', icon: Zap },
    { id: 'storage', name: 'Storage', icon: Database },
    { id: 'advanced', name: 'Advanced', icon: AlertTriangle }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Color Scheme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'twilight-berry', name: 'Twilight Berry', colors: 'from-twilight-500 to-berry-500' },
                      { id: 'ocean-breeze', name: 'Ocean Breeze', colors: 'from-blue-400 to-cyan-500' },
                      { id: 'sunset-glow', name: 'Sunset Glow', colors: 'from-orange-400 to-pink-500' }
                    ].map((scheme) => (
                      <button
                        key={scheme.id}
                        onClick={() => updateSetting('colorScheme', scheme.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.colorScheme === scheme.id 
                            ? 'border-berry-500 bg-berry-50/30' 
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <div className={`w-full h-8 bg-gradient-to-r ${scheme.colors} rounded mb-2`} />
                        <p className="text-xs text-navy">{scheme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">Glass Effects</p>
                    <p className="text-sm text-navy/60">Enable glassmorphism design</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.glassEffect}
                      onChange={(e) => updateSetting('glassEffect', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">Animations</p>
                    <p className="text-sm text-navy/60">Enable smooth transitions and effects</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.animations}
                      onChange={(e) => updateSetting('animations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Language & Region</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                  { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications', icon: Smartphone },
                  { key: 'soundNotifications', label: 'Sound Notifications', desc: 'Play sounds for alerts', icon: Volume2 },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Product updates and offers', icon: Mail },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Important security notifications', icon: Shield }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-berry-600" />
                        <div>
                          <p className="font-medium text-navy">{item.label}</p>
                          <p className="text-sm text-navy/60">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings] as boolean}
                          onChange={(e) => updateSetting(item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Security Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 glass-card rounded-lg">
                  <div>
                    <p className="font-medium text-navy">Two-Factor Authentication</p>
                    <p className="text-sm text-navy/60">Add extra security to your account</p>
                  </div>
                  <button className="btn-primary px-4 py-2">
                    {settings.twoFactorAuth ? 'Enabled' : 'Enable 2FA'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Session Timeout (minutes)</label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
                    className="input-glass w-full"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={0}>Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                    className="input-glass w-full"
                    min="30"
                    max="365"
                  />
                  <p className="text-xs text-navy/60 mt-1">How long to keep your data before automatic deletion</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'voice':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Voice & Audio Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Default Voice Quality</label>
                  <select
                    value={settings.defaultVoiceQuality}
                    onChange={(e) => updateSetting('defaultVoiceQuality', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="low">Low (Fastest)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Recommended)</option>
                    <option value="ultra">Ultra (Slowest)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Audio Format</label>
                  <select
                    value={settings.audioFormat}
                    onChange={(e) => updateSetting('audioFormat', e.target.value)}
                    className="input-glass w-full"
                  >
                    <option value="wav">WAV (Uncompressed)</option>
                    <option value="mp3">MP3 (Compressed)</option>
                    <option value="flac">FLAC (Lossless)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Sample Rate</label>
                  <select
                    value={settings.sampleRate}
                    onChange={(e) => updateSetting('sampleRate', parseInt(e.target.value))}
                    className="input-glass w-full"
                  >
                    <option value={22050}>22.05 kHz</option>
                    <option value={44100}>44.1 kHz (CD Quality)</option>
                    <option value={48000}>48 kHz (Professional)</option>
                    <option value={96000}>96 kHz (Hi-Res)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">Automatic Watermarking</p>
                    <p className="text-sm text-navy/60">Add watermarks to all generated audio</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoWatermark}
                      onChange={(e) => updateSetting('autoWatermark', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">API & Integration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">API Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.apiTimeout}
                    onChange={(e) => updateSetting('apiTimeout', parseInt(e.target.value))}
                    className="input-glass w-full"
                    min="5"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Webhook Retry Attempts</label>
                  <select
                    value={settings.webhookRetries}
                    onChange={(e) => updateSetting('webhookRetries', parseInt(e.target.value))}
                    className="input-glass w-full"
                  >
                    <option value={1}>1 retry</option>
                    <option value={3}>3 retries</option>
                    <option value={5}>5 retries</option>
                    <option value={10}>10 retries</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">Rate Limit Warnings</p>
                    <p className="text-sm text-navy/60">Get notified when approaching rate limits</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.rateLimitWarning}
                      onChange={(e) => updateSetting('rateLimitWarning', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'storage':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Storage & Backup</h3>
              <div className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-navy">Storage Usage</p>
                    <p className="text-sm text-navy/60">2.1 GB of 5 GB used</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-berry-500 to-twilight-500 h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>

                {[
                  { key: 'autoBackup', label: 'Automatic Backup', desc: 'Backup data automatically', icon: Cloud },
                  { key: 'cloudSync', label: 'Cloud Synchronization', desc: 'Sync across devices', icon: Wifi },
                  { key: 'localCache', label: 'Local Cache', desc: 'Cache data locally for faster access', icon: HardDrive }
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-berry-600" />
                        <div>
                          <p className="font-medium text-navy">{item.label}</p>
                          <p className="text-sm text-navy/60">{item.desc}</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[item.key as keyof typeof settings] as boolean}
                          onChange={(e) => updateSetting(item.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      case 'advanced':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-navy mb-4">Advanced Settings</h3>
              <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Caution</p>
                    <p className="text-sm text-yellow-700">These settings can affect system performance and stability.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy">Analytics Tracking</p>
                    <p className="text-sm text-navy/60">Help improve VCaaS with anonymous usage data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.analyticsTracking}
                      onChange={(e) => updateSetting('analyticsTracking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-berry-500"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <button className="w-full glass-button p-4 rounded-lg text-left hover:bg-white/20 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Download className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-navy">Export All Data</p>
                        <p className="text-sm text-navy/60">Download a copy of all your data</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-red-50 hover:bg-red-100 p-4 rounded-lg text-left transition-colors border border-red-200">
                    <div className="flex items-center space-x-3">
                      <Trash2 className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-700">Clear All Cache</p>
                        <p className="text-sm text-red-600">Remove all locally cached data</p>
                      </div>
                    </div>
                  </button>

                  <button className="w-full bg-red-50 hover:bg-red-100 p-4 rounded-lg text-left transition-colors border border-red-200">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-700">Reset All Settings</p>
                        <p className="text-sm text-red-600">Restore default configuration</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
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
          className="mb-8"
        >
          <h1 className="text-3xl font-poppins font-bold text-navy mb-2">
            Settings ⚙️
          </h1>
          <p className="text-navy/70">
            Customize your VCaaS experience and preferences
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-4 sticky top-24"
            >
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-berry-500 text-white'
                          : 'text-navy hover:bg-white/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </motion.div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-navy/10 mt-8">
                <div className="flex space-x-3">
                  <button className="btn-secondary px-6 py-2 rounded-lg">
                    Reset
                  </button>
                  <button className="btn-primary px-6 py-2 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}