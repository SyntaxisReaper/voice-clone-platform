'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  PlayCircle,
  Pause,
  Download,
  Upload,
  Mic,
  Volume2,
  Settings,
  Wand2,
  Copy,
  RotateCcw,
  Zap
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function PlaygroundPage() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('xtts-default')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 0,
    volume: 0.8,
    emotion: 'neutral'
  })
  const [language, setLanguage] = useState('en')
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [addWatermark, setAddWatermark] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const voices = [
    { id: 'xtts-default', name: 'XTTS v2 (Zero-shot)', type: 'System', status: 'Ready' },
  ]

  const sampleTexts = [
    "Welcome to VCaaS, where your voice becomes a powerful creative tool.",
    "The future of voice technology is here, and it's ethical, traceable, and creator-first.",
    "Transform any text into speech with professional-quality voice cloning.",
    "Create, license, and monetize your unique voice with confidence."
  ]

  const handleGenerate = async () => {
    if (!text.trim()) return
    if (!referenceFile) { alert('Please upload a reference voice sample (wav/mp3/m4a/flac).'); return }
    setIsGenerating(true)
    setGeneratedAudio(null)
    try {
      const fd = new FormData()
      fd.append('text', text)
      fd.append('language', language)
      fd.append('reference', referenceFile)
      if (addWatermark) {
        fd.append('watermark', 'true')
      }
      const res = await axios.post(`${API}/api/v1/tts/clone`, fd, { responseType: 'blob' })
      const blobUrl = URL.createObjectURL(new Blob([res.data], { type: 'audio/wav' }))
      setGeneratedAudio(blobUrl)
    } catch (error) {
      console.error('Generation failed:', error)
      alert('Failed to generate audio. Check backend logs.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const onPickFile = () => fileInputRef.current?.click()
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null
    setReferenceFile(f)
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-poppins font-bold text-navy mb-2">
              Voice Playground 🎭
            </h1>
            <p className="text-navy/70">
              Test your voice clones and experiment with different settings
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Playground */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-navy mb-4">Text to Speech</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-navy/70 mb-2">
                  Enter your text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste the text you want to convert to speech..."
                  className="input-glass w-full h-32 resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-navy/60">{text.length}/1000 characters</p>
                  <button
                    onClick={() => setText('')}
                    className="text-xs text-berry-600 hover:text-berry-700 flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Sample Text Buttons */}
              <div className="mb-6">
                <p className="text-sm font-medium text-navy/70 mb-2">Quick samples:</p>
                <div className="flex flex-wrap gap-2">
                  {sampleTexts.map((sample, index) => (
                    <button
                      key={index}
                      onClick={() => setText(sample)}
                      className="text-xs px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full text-navy/80 transition-colors"
                    >
                      Sample {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference + Language */}
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Reference voice</label>
                  <div className="flex items-center gap-2">
                    <input ref={fileInputRef} onChange={onFileChange} type="file" accept="audio/*,.wav,.mp3,.m4a,.flac" className="hidden" />
                    <button onClick={onPickFile} className="glass-button px-3 py-2 rounded">{referenceFile ? referenceFile.name : 'Choose file'}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">Language</label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-glass w-full">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!text.trim() || !referenceFile || isGenerating}
                className="w-full btn-primary py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner" />
                    <span>Generating Speech...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Generate Speech</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Audio Player */}
            {generatedAudio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-navy mb-4">Generated Audio</h3>

                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  {/* Waveform Visualization */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="waveform">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, i) => (
                        <div key={i} className="waveform-bar" />
                      ))}
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={handlePlay}
                      className="w-12 h-12 bg-gradient-to-br from-berry-500 to-berry-600 rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                    </button>

                    <button className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 text-navy">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>

                    <button className="glass-button px-4 py-2 rounded-lg flex items-center space-x-2 text-navy">
                      <Copy className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                <audio ref={audioRef} src={generatedAudio} />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Voice Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-navy mb-4">Voice Selection</h3>

              <div className="space-y-3">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedVoice === voice.id
                        ? 'border-berry-400 bg-berry-50/30'
                        : 'border-white/20 hover:border-white/30'
                      }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-navy text-sm">{voice.name}</p>
                        <p className="text-xs text-navy/60">{voice.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${voice.status === 'Ready'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {voice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Voice Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-navy mb-4 flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Voice Settings</span>
              </h3>

              <div className="space-y-4">
                {/* Speed */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Speed: {voiceSettings.speed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, speed: parseFloat(e.target.value) })}
                    className="w-full accent-berry-500"
                  />
                </div>

                {/* Pitch */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Pitch: {voiceSettings.pitch > 0 ? '+' : ''}{voiceSettings.pitch}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, pitch: parseInt(e.target.value) })}
                    className="w-full accent-berry-500"
                  />
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Volume: {Math.round(voiceSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, volume: parseFloat(e.target.value) })}
                    className="w-full accent-berry-500"
                  />
                </div>

                {/* Emotion */}
                <div>
                  <label className="block text-sm font-medium text-navy/70 mb-2">
                    Emotion
                  </label>
                  <select
                    value={voiceSettings.emotion}
                    onChange={(e) => setVoiceSettings({ ...voiceSettings, emotion: e.target.value })}
                    className="input-glass w-full"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="happy">Happy</option>
                    <option value="sad">Sad</option>
                    <option value="excited">Excited</option>
                    <option value="calm">Calm</option>
                  </select>
                </div>

                {/* Watermarking */}
                <div className="pt-2 flex items-center">
                  <input
                    type="checkbox"
                    id="watermark-toggle"
                    checked={addWatermark}
                    onChange={(e) => setAddWatermark(e.target.checked)}
                    className="w-4 h-4 text-berry-600 rounded focus:ring-berry-500 bg-white/10 border-white/20"
                  />
                  <label htmlFor="watermark-toggle" className="ml-2 block text-sm font-medium text-navy/70 cursor-pointer">
                    Apply invisible watermark
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-navy mb-4">Quick Actions</h3>

              <div className="space-y-3">
                <button onClick={onPickFile} className="w-full glass-button p-3 rounded-lg flex items-center space-x-3 hover:bg-white/20 transition-colors">
                  <Upload className="w-4 h-4 text-berry-600" />
                  <span className="font-medium text-navy">Upload Reference</span>
                </button>
                <input ref={fileInputRef} onChange={onFileChange} type="file" accept="audio/*,.wav,.mp3,.m4a,.flac" className="hidden" />

                <button className="w-full glass-button p-3 rounded-lg flex items-center space-x-3 hover:bg-white/20 transition-colors" disabled>
                  <Mic className="w-4 h-4 text-berry-600" />
                  <span className="font-medium text-navy">Record Voice (soon)</span>
                </button>

                <button className="w-full glass-button p-3 rounded-lg flex items-center space-x-3 hover:bg-white/20 transition-colors" disabled>
                  <Zap className="w-4 h-4 text-berry-600" />
                  <span className="font-medium text-navy">API Access</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}