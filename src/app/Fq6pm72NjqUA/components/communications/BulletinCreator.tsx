'use client'

import { useState, Suspense, lazy } from 'react'
import { Image, FileText } from 'lucide-react'
import HelpTooltip from '../HelpTooltip'
import type { StaffUser } from '../../contexts/StaffAuthContext'

// Lazy load bulletin forms
const PosterBulletinForm = lazy(() => import('./PosterBulletinForm'))
const TextBulletinForm = lazy(() => import('./TextBulletinForm'))

interface BulletinCreatorProps {
  user: StaffUser | null
}

const LoadingFallback = () => (
  <div className="staff-card rounded-xl p-8 flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="staff-spinner w-8 h-8"></div>
      <p className="text-staff-secondary">Loading editor...</p>
    </div>
  </div>
)

export default function BulletinCreator({ user }: BulletinCreatorProps) {
  const [selectedType, setSelectedType] = useState<'poster' | 'text' | null>(null)

  // Show poster form
  if (selectedType === 'poster') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PosterBulletinForm user={user} onBack={() => setSelectedType(null)} />
      </Suspense>
    )
  }

  // Show text form
  if (selectedType === 'text') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <TextBulletinForm user={user} onBack={() => setSelectedType(null)} />
      </Suspense>
    )
  }

  // Selector view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create Bulletin<HelpTooltip text="Choose between uploading a poster image or creating a text-based announcement for the community portal." /></h1>
            <p className="text-staff-secondary">Choose the type of bulletin you want to create</p>
          </div>
        </div>
      </div>

      {/* Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedType('poster')}
          className="staff-card rounded-xl p-8 text-left hover:border-staff-accent/50 transition-all group"
        >
          <div className="w-16 h-16 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="w-8 h-8 text-pink-500"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Poster Bulletin</h3>
          <p className="text-sm text-staff-secondary">
            Upload a poster image (8.5" × 11" or 8.5" × 14" format)
          </p>
        </button>

        <button
          onClick={() => setSelectedType('text')}
          className="staff-card rounded-xl p-8 text-left hover:border-staff-accent/50 transition-all group"
        >
          <div className="w-16 h-16 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="w-8 h-8 text-cyan-500"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Text Bulletin</h3>
          <p className="text-sm text-staff-secondary">
            Create a text-based announcement with optional letterhead
          </p>
        </button>
      </div>
    </div>
  )
}
