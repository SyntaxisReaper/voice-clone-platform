'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit3,
  Save,
  X,
  Shield,
  Key,
  Bell,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [profile, setProfile] = useState({
    name: 'John Creator',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    bio: 'Professional voice artist and content creator specializing in narrative and commercial work.',
    avatar: '/api/placeholder/150/150',
    plan: 'Pro',
    apiKey: 'vcaas_sk_1234567890abcdef',
    notifications: {
      email: true,
      push: true,
      marketing: false
    }
  })

  const [editProfile, setEditProfile] = useState(profile)

  const handleSave = () => {
    setProfile(editProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditProfile(profile)
    setIsEditing(false)
  }

  const stats = [
    { label: 'Voices Created', value: '12', icon: User },
    { label: 'Audio Generated', value: '1.2K', icon: Download },
    { label: 'API Calls', value: '8.7K', icon: Key },
    { label: 'Total Usage', value: '342 min', icon: Calendar }
  ]

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
            Profile Settings 👤
          </h1>
          <p className="text-navy/70">
            Manage your account, preferences, and API access
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-navy">Profile Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-white/20 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Avatar */}
                <div className="md:col-span-2 flex items-center space-x-6 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-berry-500 to-twilight-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-berry-500 rounded-full flex items-center justify-center text-white hover:bg-berry-600 transition-colors">
                        <Upload className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-navy">{profile.name}</h3>
                    <p className="text-navy/60">{profile.plan} Plan Member</p>
                    <p className="text-sm text-navy/50">Member since {profile.joinDate}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                      className="input-glass w-full"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-navy/60" />
                      <span className="text-navy">{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editProfile.email}
                      onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                      className="input-glass w-full"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-navy/60" />
                      <span className="text-navy">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                      className="input-glass w-full"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-navy/60" />
                      <span className="text-navy">{profile.phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editProfile.location}
                      onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                      className="input-glass w-full"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-navy/60" />
                      <span className="text-navy">{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                      className="input-glass w-full h-24 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-navy bg-white/10 p-3 rounded-lg">
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* API Access */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-navy mb-4 flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>API Access</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    API Key
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={profile.apiKey}
                      readOnly
                      className="input-glass flex-1"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="glass-button p-2 rounded-lg"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button className="glass-button px-3 py-2 rounded-lg text-sm">
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-navy/60 mt-1">
                    Use this key to authenticate API requests
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button className="btn-secondary px-4 py-2 rounded-lg">
                    Generate New Key
                  </button>
                  <button className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                    <Trash2 className="w-4 h-4" />
                    <span>Revoke Key</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-navy mb-4">Account Stats</h3>
              
              <div className="space-y-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-berry-500/20 to-twilight-500/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-berry-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-navy">{stat.value}</p>
                        <p className="text-sm text-navy/60">{stat.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Security */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-navy mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </h3>
              
              <div className="space-y-3">
                <button className="w-full glass-button p-3 rounded-lg text-left hover:bg-white/20 transition-colors">
                  <p className="font-medium text-navy">Change Password</p>
                  <p className="text-sm text-navy/60">Update your account password</p>
                </button>
                
                <button className="w-full glass-button p-3 rounded-lg text-left hover:bg-white/20 transition-colors">
                  <p className="font-medium text-navy">Two-Factor Auth</p>
                  <p className="text-sm text-navy/60">Enable 2FA for extra security</p>
                </button>
                
                <button className="w-full glass-button p-3 rounded-lg text-left hover:bg-white/20 transition-colors">
                  <p className="font-medium text-navy">Login History</p>
                  <p className="text-sm text-navy/60">View recent account activity</p>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}