'use client'

import { useState, useRef } from 'react'
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { bulletinApi } from '../../lib/api'
import { cn } from '../../lib/utils'
import { toast } from 'sonner'
import type { StaffUser } from '../../contexts/StaffAuthContext'
import { BULLETIN_CATEGORY_OPTIONS } from '@/lib/category-constants'

// Categories matching the API enum values
const CATEGORIES = BULLETIN_CATEGORY_OPTIONS

interface PosterBulletinFormProps {
  user: StaffUser | null
  onBack: () => void
}

export default function PosterBulletinForm({ user, onBack }: PosterBulletinFormProps) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('COMMUNITY_ADMIN')
  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setResult({ success: false, message: 'Please select an image file (PNG, JPG, etc.)' })
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setResult({ success: false, message: 'Image must be less than 10MB' })
      toast.error('Image must be less than 10MB')
      return
    }

    setIsOptimizing(true)
    setResult({ success: true, message: 'Processing image...' })

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64Data = reader.result as string
      
      // For web, we'll validate dimensions client-side
      const img = new Image()
      img.onload = () => {
        // Check aspect ratio (should be portrait - taller than wide)
        const aspectRatio = img.width / img.height
        
        // 8.5x11 ratio = 0.773, 8.5x14 ratio = 0.607
        // Allow some tolerance for both formats
        const isValidRatio = aspectRatio <= 0.85 && aspectRatio >= 0.55
        
        if (!isValidRatio) {
          setResult({ 
            success: false, 
            message: 'Image should be in portrait format (8.5" × 11" or 8.5" × 14"). Current ratio: ' + aspectRatio.toFixed(2)
          })
          setIsOptimizing(false)
          return
        }

        setPosterFile(file)
        setPosterPreview(base64Data)
        setResult({ 
          success: true, 
          message: `Image validated (${img.width}×${img.height}px)`
        })
        setIsOptimizing(false)
      }
      img.onerror = () => {
        setResult({ success: false, message: 'Failed to load image. Please try another file.' })
        setIsOptimizing(false)
      }
      img.src = base64Data
    }
    reader.onerror = () => {
      setResult({ success: false, message: 'Failed to read file. Please try again.' })
      setIsOptimizing(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePoster = () => {
    setPosterFile(null)
    setPosterPreview(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePost = async () => {
    if (!title.trim() || !subject.trim()) {
      setResult({ success: false, message: 'Please fill in title and subject' })
      toast.error('Please fill in title and subject')
      return
    }

    if (!posterFile) {
      setResult({ success: false, message: 'Please upload a valid poster image (8.5" × 11" or 8.5" × 14" format)' })
      toast.error('Please upload a poster image')
      return
    }

    setIsPosting(true)
    setResult(null)

    try {
      // Step 1: Create bulletin record first (with empty poster_url) - this gives us the ID
      const createRes = await bulletinApi.create({
        title,
        subject,
        category,
        poster_url: '', // Will update after upload
        userId: user?.id,
      })

      if (!createRes.success || !createRes.data?.id) {
        throw new Error(createRes.error || 'Failed to create bulletin record')
      }

      const bulletinId = createRes.data.id

      // Step 2: Upload poster using bulletinId as sourceId
      const formData = new FormData()
      formData.append('file', posterFile)
      formData.append('sourceId', bulletinId)

      const uploadRes = await bulletinApi.uploadPoster(formData)
      if (!uploadRes.success) {
        // Clean up the bulletin record on failure
        await bulletinApi.delete(bulletinId).catch(() => {})
        throw new Error(uploadRes.error || 'Failed to upload poster')
      }

      const posterUrl = uploadRes.data?.url || uploadRes.data?.poster_url

      // Step 3: Update bulletin with poster_url
      const updateRes = await bulletinApi.update(bulletinId, { poster_url: posterUrl })
      if (!updateRes.success) {
        console.error('Failed to update bulletin with poster URL:', updateRes.error)
        // Don't throw - poster was uploaded successfully
      }

      // Step 4: Sync to portal
      await bulletinApi.syncToPortal(bulletinId).catch(err => {
        console.error('Portal sync failed:', err)
        // Don't throw - bulletin was created successfully
      })

      setResult({ success: true, message: 'Poster bulletin published successfully!' })
      toast.success('Poster bulletin published!')
      
      // Clear form
      setTitle('')
      setSubject('')
      setCategory('COMMUNITY_ADMIN')
      handleRemovePoster()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Network error. Please try again.'
      setResult({ success: false, message })
      toast.error(message)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-staff-secondary" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Poster Bulletin</h1>
            <p className="text-staff-secondary">Upload a poster image to the community portal</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="staff-card rounded-xl p-6 space-y-6">
        {/* Poster Upload Section */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Poster Image <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-staff-secondary mb-3">
            Upload the poster you've created (PNG, JPG - max 10MB, 8.5" × 11" or 8.5" × 14" format)
          </p>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!posterPreview ? (
            <div
              onClick={() => !isOptimizing && fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                isOptimizing 
                  ? "border-staff-accent/50 bg-staff-accent/5" 
                  : "border-white/20 hover:border-staff-accent/50"
              )}
            >
              <div className="flex flex-col items-center gap-3">
                {isOptimizing ? (
                  <div className="staff-spinner w-8 h-8"></div>
                ) : (
                  <Upload className="w-12 h-12 text-staff-muted" />
                )}
                <span className="text-staff-secondary">
                  {isOptimizing ? 'Processing image...' : 'Click to select poster image'}
                </span>
             
              </div>
            </div>
          ) : (
            <div className="relative inline-block">
              <img
                src={posterPreview}
                alt="Poster preview"
                className="max-h-80 rounded-xl border border-white/10"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={handleRemovePoster}
                  className="px-4 py-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 text-white text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
              {posterFile && (
                <p className="text-xs text-staff-secondary mt-2">{posterFile.name}</p>
              )}
            </div>
          )}
        </div>

        {/* Title and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-white mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Community Feast - March 15th"
              className="staff-input staff-focus-ring w-full px-4 py-3 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="staff-input staff-focus-ring w-full px-4 py-3 rounded-lg appearance-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Subject / Summary <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description that appears in the bulletin list..."
            className="staff-input staff-focus-ring w-full px-4 py-3 rounded-lg"
          />
        </div>

        {/* Result Message */}
        {result && (
          <div className={cn(
            "p-4 rounded-xl flex items-start gap-3",
            result.success 
              ? "bg-green-500/10 border border-green-500/20" 
              : "bg-red-500/10 border border-red-500/20"
          )}>
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            )}
            <p className={cn("text-sm", result.success ? "text-green-400" : "text-red-400")}>
              {result.message}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handlePost}
          disabled={isPosting || isOptimizing || !title.trim() || !subject.trim() || !posterFile}
          className="btn-staff-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? (
            <>
              <div className="staff-spinner w-5 h-5"></div>
              <span>Publishing...</span>
            </>
          ) : isOptimizing ? (
            <>
              <div className="staff-spinner w-5 h-5"></div>
              <span>Optimizing Image...</span>
            </>
          ) : (
            <span>Publish Poster Bulletin</span>
          )}
        </button>
      </div>
    </div>
  )
}
