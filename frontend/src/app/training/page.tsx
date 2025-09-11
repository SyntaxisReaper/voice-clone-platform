'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  InformationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import VoiceRecorder from '../../components/training/VoiceRecorder'
import TrainingConfigForm from '../../components/training/TrainingConfigForm'

interface AudioFile {
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
  const [trainingConfig, setTrainingConfig] = useState({
    voiceName: '',
    language: 'en',
    description: '',
    isPublic: false,
    trainingSettings: {
      epochs: 100,
      learningRate: 0.0002,
      batchSize: 16,
      clipDuration: 10
    }
  })
  const [currentStep, setCurrentStep] = useState(1)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      size: file.size,
      duration: 0, // Would be calculated from actual audio file
      file,
      preview: URL.createObjectURL(file)
    }))
    setAudioFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleRecordingComplete = (file: File, duration: number) => {
    const newFile: AudioFile = {
      id: `rec-${Date.now()}`,
      name: file.name,
      size: file.size,
      duration,
      file,
      preview: URL.createObjectURL(file)
    }
    setAudioFiles(prev => [...prev, newFile])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.wav', '.mp3', '.m4a', '.flac', '.ogg']
    },
    maxFiles: 10,
    maxSize: 100 * 1024 * 1024 // 100MB
  })

  const removeFile = (id: string) => {
    setAudioFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleStartTraining = async () => {
    setIsUploading(true)
    // TODO: Implement actual training API call
    setTimeout(() => {
      setIsUploading(false)
      setCurrentStep(4) // Training in progress
    }, 2000)
  }

  const steps = [
    { id: 1, name: 'Upload Audio', description: 'Add voice samples' },
    { id: 2, name: 'Configure', description: 'Set training parameters' },
    { id: 3, name: 'Review', description: 'Confirm settings' },
    { id: 4, name: 'Training', description: 'Model creation' }
  ]

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
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Voice Training</h1>
              <p className="text-xs sm:text-sm text-gray-600">Create a new AI voice clone</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center overflow-x-auto pb-2">
            {steps.map((step, stepIdx) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step.id}
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className={`text-xs sm:text-sm font-medium ${
                    currentStep >= step.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </p>
                  <p className="hidden sm:block text-xs text-gray-500">{step.description}</p>
                </div>
                {stepIdx < steps.length - 1 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-4 ${
                    currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Upload Audio */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Voice Samples</h2>
              
              {/* Recording Section */}
              <div className="mb-6">
                <VoiceRecorder onRecordingComplete={handleRecordingComplete} />
              </div>

              {/* File Drop Zone */}
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop files here' : 'Upload audio files'}
                </p>
                <p className="text-sm text-gray-600">
                  Drag and drop your audio files, or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supports WAV, MP3, M4A, FLAC, OGG (max 100MB each)
                </p>
              </div>

              {/* Uploaded Files List */}
              {audioFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">
                    Uploaded Files ({audioFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {audioFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DocumentIcon className="h-8 w-8 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • {formatTime(file.duration)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.preview && (
                            <audio controls className="h-8" style={{ width: '200px' }}>
                              <source src={file.preview} type={file.file.type} />
                            </audio>
                          )}
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Tips for better results</h3>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Upload at least 5-10 minutes of clear speech</li>
                      <li>• Use high-quality recordings (44kHz, 16-bit minimum)</li>
                      <li>• Speak at a normal pace with varied expressions</li>
                      <li>• Minimize background noise and echo</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={audioFiles.length === 0}
                  className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next: Configure Training
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {currentStep === 2 && (
          <div>
            <TrainingConfigForm 
              config={trainingConfig} 
              onChange={setTrainingConfig}
            />

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!trainingConfig.voiceName}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Review Settings
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Review Training Setup</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Voice Configuration</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Voice Name</dt>
                    <dd className="text-sm text-gray-900">{trainingConfig.voiceName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Language</dt>
                    <dd className="text-sm text-gray-900">{trainingConfig.language.toUpperCase()}</dd>
                  </div>
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="text-sm text-gray-900">{trainingConfig.description || 'No description'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Visibility</dt>
                    <dd className="text-sm text-gray-900">
                      {trainingConfig.isPublic ? 'Public' : 'Private'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Audio Files ({audioFiles.length})</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Files:</span>
                      <span className="ml-2 font-medium">{audioFiles.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Size:</span>
                      <span className="ml-2 font-medium">
                        {formatFileSize(audioFiles.reduce((sum, file) => sum + file.size, 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Duration:</span>
                      <span className="ml-2 font-medium">
                        {formatTime(audioFiles.reduce((sum, file) => sum + file.duration, 0))}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quality:</span>
                      <span className="ml-2 font-medium text-green-600">Good</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">Training Settings</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-500">Epochs</dt>
                      <dd className="font-medium">{trainingConfig.trainingSettings.epochs}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Learning Rate</dt>
                      <dd className="font-medium">{trainingConfig.trainingSettings.learningRate}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Estimated Time</dt>
                      <dd className="font-medium">45-60 minutes</dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Cost</dt>
                      <dd className="font-medium text-green-600">Free</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleStartTraining}
                disabled={isUploading}
                className="px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 font-medium"
              >
                {isUploading ? 'Starting Training...' : 'Start Training'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Training in Progress */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mb-4"></div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Training Your Voice Model</h2>
            <p className="text-gray-600 mb-6">This may take 45-60 minutes. You can close this page and check back later.</p>
            
            <div className="bg-gray-100 rounded-full h-4 mb-4">
              <div className="bg-primary-600 h-4 rounded-full transition-all duration-1000" style={{ width: '35%' }}></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Progress:</span>
                <span className="ml-2 font-medium">35%</span>
              </div>
              <div>
                <span className="text-gray-500">Current Epoch:</span>
                <span className="ml-2 font-medium">35/100</span>
              </div>
              <div>
                <span className="text-gray-500">ETA:</span>
                <span className="ml-2 font-medium">32 minutes</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
