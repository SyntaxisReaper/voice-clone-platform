'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  SpeakerWaveIcon,
  Cog6ToothIcon,
  BookmarkIcon,
  HeartIcon,
  FaceSmileIcon,
  FaceFrownIcon,
  FireIcon,
  CloudIcon,
  BoltIcon,
  MusicalNoteIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { 
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid 
} from '@heroicons/react/24/solid'

interface Voice {
  id: string
  name: string
  owner: string
  category: 'owned' | 'licensed' | 'public'
  quality: 'excellent' | 'good' | 'fair'
  tags: string[]
  avatar: string
  previewUrl?: string
}

interface EmotionalTag {
  id: string
  name: string
  icon: React.ElementType
  color: string
  description: string
}

interface GenerationJob {
  id: string
  text: string
  voice: string
  status: 'generating' | 'completed' | 'failed'
  audioUrl?: string
  duration?: number
  createdAt: Date
  emotions: string[]
}

export default function VoicePlayground() {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null)
  const [text, setText] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null)
  const [recentJobs, setRecentJobs] = useState<GenerationJob[]>([])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [voices, setVoices] = useState<Voice[]>([])
  const [isLoadingVoices, setIsLoadingVoices] = useState(true)
  const [settings, setSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    addWatermark: true
  })
  const [favoriteVoices, setFavoriteVoices] = useState<Set<string>>(new Set())
  const [bookmarkedTexts, setBookmarkedTexts] = useState<Set<string>>(new Set())
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Load voices from API
  useEffect(() => {
    const loadVoices = async () => {
      try {
        // Check if we're in development mode and backend is available
        const isDevelopment = process.env.NODE_ENV === 'development'
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        if (isDevelopment) {
          // Try to check if backend is available
          const response = await fetch(`${backendUrl}/health`, { 
            method: 'GET',
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          
          if (response.ok) {
            // Backend is available, load real data
            const { getAvailableVoices, getTrainedVoices } = await import('@/lib/api')
            
            const availableVoicesData = await getAvailableVoices()
            const trainedVoicesData = await getTrainedVoices()
            
            const allVoices = [
              ...availableVoicesData.owned_voices.map((v: any) => ({
                ...v,
                category: 'owned' as const
              })),
              ...availableVoicesData.licensed_voices.map((v: any) => ({
                ...v,
                category: 'licensed' as const  
              })),
              ...availableVoicesData.public_voices.map((v: any) => ({
                ...v,
                category: 'public' as const
              })),
              ...trainedVoicesData.voices.map((v: any) => ({
                id: v.id,
                name: v.name,
                owner: 'You',
                status: v.status,
                quality: v.quality_score >= 90 ? 'excellent' : v.quality_score >= 70 ? 'good' : 'fair',
                can_use: v.status === 'ready',
                category: 'owned' as const,
                tags: v.tags,
                avatar: '🎤'
              }))
            ]
            
            setVoices(allVoices)
            if (allVoices.length > 0 && !selectedVoice) {
              setSelectedVoice(allVoices[0])
            }
            return
          }
        }
        
        throw new Error('Backend not available or in production mode')
        
      } catch (error) {
        console.log('Loading fallback demo voices...', error.message)
        
        // Use comprehensive demo data for production or when backend is unavailable
        const demoVoices = [
          {
            id: 'demo-alice',
            name: 'Alice (Professional)',
            owner: 'Demo',
            status: 'ready',
            quality: 'excellent',
            can_use: true,
            category: 'public' as const,
            tags: ['business', 'clear', 'authoritative', 'professional'],
            avatar: '👩‍💼'
          },
          {
            id: 'demo-bob',
            name: 'Bob (Narrator)',
            owner: 'Demo',
            status: 'ready',
            quality: 'excellent',
            can_use: true,
            category: 'public' as const,
            tags: ['warm', 'storytelling', 'deep', 'narrator'],
            avatar: '👨‍🎤'
          },
          {
            id: 'demo-emma',
            name: 'Emma (Friendly)',
            owner: 'Demo',
            status: 'ready',
            quality: 'good',
            can_use: true,
            category: 'licensed' as const,
            tags: ['friendly', 'casual', 'young', 'upbeat'],
            avatar: '👩‍🦱'
          },
          {
            id: 'demo-james',
            name: 'James (News)',
            owner: 'Demo',
            status: 'ready',
            quality: 'excellent',
            can_use: true,
            category: 'public' as const,
            tags: ['news', 'authoritative', 'clear', 'broadcast'],
            avatar: '📺'
          },
          {
            id: 'demo-sarah',
            name: 'Sarah (Assistant)',
            owner: 'You',
            status: 'ready',
            quality: 'good',
            can_use: true,
            category: 'owned' as const,
            tags: ['helpful', 'assistant', 'calm', 'supportive'],
            avatar: '🤖'
          }
        ]
        
        setVoices(demoVoices)
        setSelectedVoice(demoVoices[0])
      } finally {
        setIsLoadingVoices(false)
      }
    }
    
    loadVoices()
  }, [])

  const emotionalTags: EmotionalTag[] = [
    { id: 'happy', name: 'Happy', icon: FaceSmileIcon, color: 'text-yellow-500', description: 'Cheerful and upbeat' },
    { id: 'sad', name: 'Sad', icon: FaceFrownIcon, color: 'text-blue-500', description: 'Melancholic and somber' },
    { id: 'angry', name: 'Angry', icon: FireIcon, color: 'text-red-500', description: 'Intense and forceful' },
    { id: 'calm', name: 'Calm', icon: CloudIcon, color: 'text-green-500', description: 'Peaceful and serene' },
    { id: 'excited', name: 'Excited', icon: BoltIcon, color: 'text-purple-500', description: 'Energetic and enthusiastic' },
    { id: 'romantic', name: 'Romantic', icon: HeartIcon, color: 'text-pink-500', description: 'Loving and intimate' },
    { id: 'mysterious', name: 'Mysterious', icon: MusicalNoteIcon, color: 'text-indigo-500', description: 'Enigmatic and intriguing' }
  ]

  const sampleTexts = [
    "Welcome to our podcast. Today we'll be discussing the future of artificial intelligence.",
    "In a world where technology evolves at lightning speed, staying ahead of the curve is essential.",
    "Thank you for choosing our service. Your satisfaction is our top priority.",
    "Once upon a time, in a land far, far away, there lived a curious inventor.",
    "Breaking news: Scientists have made a groundbreaking discovery that could change everything."
  ]


  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim()) return

    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      text: text.trim(),
      voice: selectedVoice.name,
      status: 'generating',
      createdAt: new Date(),
      emotions: [...selectedEmotions]
    }

    setCurrentJob(newJob)
    setRecentJobs(prev => [newJob, ...prev.slice(0, 9)])

    try {
      // Check if we're in demo mode (no backend available)
      const isDemoMode = selectedVoice.id.startsWith('demo-') || process.env.NODE_ENV === 'production'
      
      if (isDemoMode) {
        // Simulate generation process for demo
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
        
        // Create a demo audio URL (silent audio for demo purposes)
        const demoAudioUrl = createDemoAudio(text.trim(), selectedVoice.name)
        
        const completedJob = {
          ...newJob,
          status: 'completed' as const,
          audioUrl: demoAudioUrl,
          duration: Math.max(2, Math.floor(text.length * 0.1)) // Estimate duration
        }
        
        setCurrentJob(completedJob)
        setRecentJobs(prev => [completedJob, ...prev.slice(1)])
        return
      }
      
      // Real API mode (development with backend)
      const { generateSpeech, pollJobStatus, downloadAudio, createAudioUrl } = await import('@/lib/api')
      
      // Start TTS generation
      const result = await generateSpeech({
        text: text.trim(),
        voice_id: selectedVoice.id,
        emotions: selectedEmotions,
        speed: settings.speed,
        pitch: settings.pitch,
        volume: settings.volume,
        add_watermark: settings.addWatermark
      })

      // Poll for completion
      const completedJob = await pollJobStatus(result.id)
      
      // Download audio
      const audioBlob = await downloadAudio(result.id)
      const audioUrl = createAudioUrl(audioBlob)

      const finalJob = {
        ...newJob,
        id: result.id,
        status: 'completed' as const,
        audioUrl: audioUrl,
        duration: completedJob.duration || Math.floor(text.length * 0.05) + 2
      }
      
      setCurrentJob(finalJob)
      setRecentJobs(prev => [finalJob, ...prev.slice(1)])
      
    } catch (error) {
      console.error('TTS Generation failed:', error)
      const failedJob = {
        ...newJob,
        status: 'failed' as const
      }
      setCurrentJob(failedJob)
      setRecentJobs(prev => [failedJob, ...prev.slice(1)])
    }
  }

  const handlePlay = (audioUrl?: string) => {
    if (!audioUrl) return
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev => 
      prev.includes(emotionId) 
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    )
  }

  const toggleFavorite = (voiceId: string) => {
    setFavoriteVoices(prev => {
      const newSet = new Set(prev)
      if (newSet.has(voiceId)) {
        newSet.delete(voiceId)
      } else {
        newSet.add(voiceId)
      }
      return newSet
    })
  }

  const bookmarkText = (text: string) => {
    setBookmarkedTexts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(text)) {
        newSet.delete(text)
      } else {
        newSet.add(text)
      }
      return newSet
    })
  }

  const createDemoAudio = (text: string, voiceName: string): string => {
    // Create a simple demo audio (1-second beep for demonstration)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const duration = Math.max(1, text.length * 0.05) // Base duration on text length
    const sampleRate = audioContext.sampleRate
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const channelData = buffer.getChannelData(0)
    
    // Generate a simple tone (for demo purposes)
    for (let i = 0; i < channelData.length; i++) {
      // Create a soft sine wave tone at 440Hz
      const frequency = 440
      const sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate)) * 0.1
      channelData[i] = sample * Math.exp(-i / (sampleRate * 0.5)) // Fade out
    }
    
    // Convert buffer to blob
    const audioBlob = bufferToWave(buffer, buffer.length)
    return URL.createObjectURL(audioBlob)
  }
  
  // Helper function to convert AudioBuffer to WAV blob
  const bufferToWave = (audioBuffer: AudioBuffer, len: number): Blob => {
    const numOfChan = audioBuffer.numberOfChannels
    const length = len * numOfChan * 2 + 44
    const buffer = new ArrayBuffer(length)
    const view = new DataView(buffer)
    const channels = []
    let sample
    let offset = 0
    let pos = 0
    
    // Write WAV header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true)
      pos += 2
    }
    
    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true)
      pos += 4
    }
    
    // RIFF identifier
    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8) // file length minus RIFF identifier
    setUint32(0x45564157) // "WAVE"
    
    // format chunk identifier
    setUint32(0x20746d66) // "fmt "
    setUint32(16) // format chunk length
    setUint16(1) // sample format (raw)
    setUint16(numOfChan)
    setUint32(audioBuffer.sampleRate)
    setUint32(audioBuffer.sampleRate * 2 * numOfChan) // byte rate
    setUint16(numOfChan * 2) // block align
    setUint16(16) // bits per sample
    
    // data chunk identifier
    setUint32(0x61746164) // "data"
    setUint32(length - pos - 4) // data chunk length
    
    // write the PCM samples
    for (let i = 0; i < audioBuffer.numberOfChannels; i++)
      channels.push(audioBuffer.getChannelData(i))
    
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]))
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
        view.setInt16(pos, sample, true)
        pos += 2
      }
      offset++
    }
    
    return new Blob([buffer], { type: 'audio/wav' })
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600' 
      case 'fair': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Voice Playground</h1>
              <p className="text-xs sm:text-sm text-gray-600">Generate speech with AI voices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Demo Mode Notification */}
        {voices.length > 0 && voices[0].id.startsWith('demo-') && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>You're using demo voices. Audio generation will create sample tones. Connect to a backend server for full TTS functionality.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Text Input */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Enter Your Text</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => bookmarkText(text)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {bookmarkedTexts.has(text) ? (
                      <BookmarkIconSolid className="h-5 w-5 text-primary-600" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 resize-none"
                maxLength={1000}
              />
              
              <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                <span>{text.length}/1000 characters</span>
                <span>Est. {Math.max(1, Math.floor(text.length * 0.05))}s duration</span>
              </div>

              {/* Sample Texts */}
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Quick samples:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setText(sample)}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {sample.slice(0, 50)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Emotional Tags */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Emotional Style</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {emotionalTags.map((emotion) => (
                  <button
                    key={emotion.id}
                    onClick={() => toggleEmotion(emotion.id)}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all text-center ${
                      selectedEmotions.includes(emotion.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <emotion.icon className={`h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 ${emotion.color}`} />
                    <p className="text-xs sm:text-sm font-medium text-gray-900">{emotion.name}</p>
                    <p className="hidden sm:block text-xs text-gray-500">{emotion.description}</p>
                  </button>
                ))}
              </div>
              
              {selectedEmotions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Selected emotions: {selectedEmotions.map(id => 
                      emotionalTags.find(e => e.id === id)?.name
                    ).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Generation Controls */}
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Voice Settings</h3>
                <Cog6ToothIcon className="h-5 w-5 text-gray-400" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Speed: {settings.speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.speed}
                    onChange={(e) => setSettings({...settings, speed: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Pitch: {settings.pitch}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.pitch}
                    onChange={(e) => setSettings({...settings, pitch: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Volume: {Math.round(settings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => setSettings({...settings, volume: parseFloat(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <input
                    id="watermark"
                    type="checkbox"
                    checked={settings.addWatermark}
                    onChange={(e) => setSettings({...settings, addWatermark: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="watermark" className="ml-2 text-xs sm:text-sm text-gray-700">
                    Add watermark (recommended)
                  </label>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={!selectedVoice || !text.trim() || currentJob?.status === 'generating'}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <SpeakerWaveIcon className="h-4 w-4" />
                  <span>
                    {currentJob?.status === 'generating' ? 'Generating...' : 'Generate Speech'}
                  </span>
                </button>
              </div>
            </div>

            {/* Current Generation */}
            {currentJob && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Generation</h3>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{currentJob.voice}</p>
                      <p className="text-sm text-gray-500">
                        {currentJob.emotions.length > 0 && `Emotions: ${currentJob.emotions.join(', ')}`}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentJob.status === 'generating' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : currentJob.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentJob.status}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3 line-clamp-3">
                    {currentJob.text}
                  </p>
                  
                  {currentJob.status === 'generating' && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  )}
                  
                  {currentJob.status === 'completed' && currentJob.audioUrl && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handlePlay(currentJob.audioUrl)}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                      >
                        {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        <span>Play</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                        <ShareIcon className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                      
                      {currentJob.duration && (
                        <span className="text-sm text-gray-500 ml-auto">
                          {Math.floor(currentJob.duration / 60)}:{(currentJob.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Voice</h3>
              
              <div className="space-y-3">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedVoice?.id === voice.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{voice.avatar}</span>
                        <div>
                          <p className="font-medium text-gray-900">{voice.name}</p>
                          <p className="text-sm text-gray-500">by {voice.owner}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              voice.category === 'owned' 
                                ? 'bg-green-100 text-green-800'
                                : voice.category === 'licensed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {voice.category}
                            </span>
                            <span className={`text-xs ${getQualityColor(voice.quality)}`}>
                              {voice.quality}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(voice.id)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {favoriteVoices.has(voice.id) ? (
                          <HeartIconSolid className="h-4 w-4 text-red-500" />
                        ) : (
                          <HeartIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      {voice.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Generations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Generations</h3>
              
              <div className="space-y-3">
                {recentJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900">{job.voice}</p>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        job.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'generating'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {job.status}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {job.text}
                    </p>
                    <p className="text-xs text-gray-500">
                      {job.createdAt.toLocaleTimeString()}
                    </p>
                    
                    {job.status === 'completed' && job.audioUrl && (
                      <button
                        onClick={() => handlePlay(job.audioUrl)}
                        className="mt-2 flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-800"
                      >
                        <PlayIcon className="h-3 w-3" />
                        <span>Play</span>
                      </button>
                    )}
                  </div>
                ))}
                
                {recentJobs.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent generations yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio element for playback */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  )
}
