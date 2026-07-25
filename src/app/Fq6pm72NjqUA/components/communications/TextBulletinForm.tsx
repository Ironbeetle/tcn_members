'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { bulletinApi } from '../../lib/api'
import { cn, LETTERHEAD_LOGOS } from '../../lib/utils'
import { toast } from 'sonner'
import type { StaffUser } from '../../contexts/StaffAuthContext'
import { BULLETIN_CATEGORY_OPTIONS } from '@/lib/category-constants'
import 'react-quill-new/dist/quill.snow.css'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-white/5 rounded-lg animate-pulse" />
})

// Quill editor configuration
const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ]
}

const QUILL_FORMATS = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet', 'indent',
  'align',
  'link'
]

// Categories matching the API enum values
const CATEGORIES = BULLETIN_CATEGORY_OPTIONS

interface TextBulletinFormProps {
  user: StaffUser | null
  onBack: () => void
}

export default function TextBulletinForm({ user, onBack }: TextBulletinFormProps) {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('COMMUNITY_ADMIN')
  const [textContent, setTextContent] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [useLetterhead, setUseLetterhead] = useState(true)
  const [selectedLogoId, setSelectedLogoId] = useState<string>(LETTERHEAD_LOGOS[0].id)

  // Check if Quill content is empty (strips HTML tags)
  const isContentEmpty = (content: string) => {
    if (!content) return true
    const strippedContent = content.replace(/<[^>]*>/g, '').trim()
    return strippedContent.length === 0
  }

  const handlePost = async () => {
    if (!title.trim() || !subject.trim()) {
      setResult({ success: false, message: 'Please fill in title and subject' })
      toast.error('Please fill in title and subject')
      return
    }

    if (isContentEmpty(textContent)) {
      setResult({ success: false, message: 'Please enter text content' })
      toast.error('Please enter text content')
      return
    }

    setIsPosting(true)
    setResult(null)

    try {
      // Create bulletin record
      const res = await bulletinApi.create({
        title,
        subject,
        category,
        content: textContent,
        logoId: useLetterhead ? selectedLogoId : undefined,
        userId: user?.id,
      })

      if (res.success) {
        setResult({ success: true, message: 'Text bulletin published successfully!' })
        toast.success('Text bulletin published!')
        
        // Clear form
        setTitle('')
        setSubject('')
        setCategory('COMMUNITY_ADMIN')
        setTextContent('')
      } else {
        setResult({ success: false, message: res.error || 'Failed to publish bulletin' })
        toast.error(res.error || 'Failed to publish bulletin')
      }
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
            <h1 className="text-xl font-bold text-white">Text Bulletin</h1>
            <p className="text-staff-secondary">Post a text bulletin to the community portal</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="staff-card rounded-xl p-6 space-y-6">
        {/* Text Content */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Bulletin Text <span className="text-red-400">*</span>
          </label>
          <p className="text-xs text-staff-secondary mb-3">
            Enter the text content for your bulletin
          </p>
          <div className="quill-dark-wrapper">
            <ReactQuill
              theme="snow"
              value={textContent}
              onChange={setTextContent}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder="Enter bulletin content here..."
            />
          </div>
        </div>

        {/* Letterhead Toggle with Logo Selection */}
        <div className="border-t border-white/10 pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useLetterhead}
              onChange={(e) => setUseLetterhead(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-transparent text-staff-accent focus:ring-staff-accent"
            />
            <span className="text-sm font-medium text-white">Include organization letterhead</span>
          </label>

          {useLetterhead && (
            <div className="mt-4 ml-8">
              <p className="text-sm text-staff-secondary mb-3">Select organization:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LETTERHEAD_LOGOS.map((logo) => (
                  <button
                    key={logo.id}
                    onClick={() => setSelectedLogoId(logo.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-left flex items-center gap-3",
                      selectedLogoId === logo.id
                        ? "border-staff-accent bg-staff-accent/10"
                        : "border-white/10 hover:border-white/20"
                    )}
                  >
                    <img 
                      src={`/logos/${logo.filename}`}
                      alt={logo.name}
                      className="w-10 h-10 object-contain"
                    />
                    <span className="text-sm text-white">{logo.name}</span>
                  </button>
                ))}
              </div>
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
              placeholder="e.g., Community Announcement"
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
          disabled={isPosting || !title.trim() || !subject.trim() || isContentEmpty(textContent)}
          className="btn-staff-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPosting ? (
            <>
              <div className="staff-spinner w-5 h-5"></div>
              <span>Publishing...</span>
            </>
          ) : (
            <span>Publish Text Bulletin</span>
          )}
        </button>
      </div>
    </div>
  )
}
