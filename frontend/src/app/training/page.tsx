'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud, FileText, Trash2, ArrowLeft, Upload } from 'lucide-react'
import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type AudioFile = {
  id: string
  name: string
  size: number
  duration: number
  file: File
  preview?: string
}

export default function VoiceTrainingPage() {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [spectralOk, setSpectralOk] = useState<boolean | null>(null)
  const [voiceName, setVoiceName] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      duration: 0,
      file,
      preview: URL.createObjectURL(file)
    }))
    setAudioFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.wav', '.mp3', '.m4a', '.flac', '.ogg'] },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024
  })

  const removeFile = (id: string) => setAudioFiles(prev => prev.filter(f => f.id !== id))

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleAnalyze = async () => {
    if (audioFiles.length === 0) return alert('Upload at least one audio file')
    try {
      setIsUploading(true)
      const fd = new FormData()
      fd.append('file', audioFiles[0].file)
      const res = await axios.post(`${API}/api/v1/verify/spectral-graphs`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSpectralOk(!!res.data?.mel_db)
    } catch (e) {
      setSpectralOk(false)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8 flex items-center space-x-4">
          <Link href="/dashboard" className="p-2 glass-button rounded-lg hover:bg-white/20 transition-colors">
            <ArrowLeft className="h-5 w-5 text-navy" />
          </Link>
          <div>
            <h1 className="text-3xl font-poppins font-bold text-navy mb-2">Voice Training</h1>
            <p className="text-navy/70">Upload audio and analyze real spectral features</p>
          </div>
        </motion.div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-navy mb-6 flex items-center space-x-2">
              <Upload className="w-6 h-6" />
              <span>Upload Voice Samples</span>
            </h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-berry-500 bg-berry-50/30' : 'border-navy/20 hover:border-berry-400 hover:bg-white/50'}`}>
              <input {...getInputProps()} />
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-berry-500 to-twilight-500 rounded-full flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-navy mb-2">{isDragActive ? 'Drop files here' : 'Upload Audio Files'}</p>
              <p className="text-navy/70 mb-2">Drag and drop your audio files, or click to browse</p>
            </div>

            {audioFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {audioFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 glass-card">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-berry-600" />
                      <div>
                        <p className="font-medium text-navy">{file.name}</p>
                        <p className="text-xs text-navy/60">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <input value={voiceName} onChange={(e) => setVoiceName(e.target.value)} placeholder="Voice name" className="input-glass flex-1" />
              <button onClick={handleAnalyze} disabled={audioFiles.length === 0 || isUploading} className="btn-primary px-6 py-2 rounded-lg disabled:bg-gray-300">
                {isUploading ? 'Analyzing…' : 'Analyze Spectral Features'}
              </button>
            </div>

            {spectralOk !== null && (
              <p className={`mt-4 text-sm ${spectralOk ? 'text-green-700' : 'text-red-700'}`}>
                {spectralOk ? 'Spectral features processed (real backend output).' : 'Analysis failed.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
