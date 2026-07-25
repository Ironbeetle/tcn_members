'use client'

/**
 * Create New Sign-up Form Page
 * 
 * Build custom sign-up forms with drag-and-drop fields.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, Eye, Type, Hash, Mail, Phone, Calendar, List, CheckSquare, AlignLeft, ChevronUp, ChevronDown, ListChecks, UserPlus } from 'lucide-react'
import { signupFormsApi, SignUpForm, FormField } from '../../../lib/api'
import { cn } from '../../../lib/utils'
import { toast } from 'sonner'
import { useStaffAuth } from '../../../contexts/StaffAuthContext'
import HelpTooltip from '../../../components/HelpTooltip'
import { FORM_CATEGORY_OPTIONS } from '@/lib/category-constants'

// Local type for form field builder
interface BuilderField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  options?: string[]
}

const FIELD_TYPES = [
  { type: 'TEXT', label: 'Short Text', icon: Type },
  { type: 'TEXTAREA', label: 'Long Text', icon: AlignLeft },
  { type: 'NUMBER', label: 'Number', icon: Hash },
  { type: 'EMAIL', label: 'Email', icon: Mail },
  { type: 'PHONE', label: 'Phone', icon: Phone },
  { type: 'DATE', label: 'Date', icon: Calendar },
  { type: 'SELECT', label: 'Dropdown', icon: List },
  { type: 'MULTISELECT', label: 'Multi-Select', icon: ListChecks },
  { type: 'CHECKBOX', label: 'Checkbox', icon: CheckSquare },
]

// Category options matching Prisma schema FormCategory enum
const CATEGORY_OPTIONS = FORM_CATEGORY_OPTIONS

export default function NewFormPage() {
  const router = useRouter()
  const { user } = useStaffAuth()
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)

  const [formData, setFormData] = useState<Partial<SignUpForm>>({
    title: '',
    description: '',
    category: 'BAND_OFFICE',
    fields: [],
    maxEntries: undefined,
    deadline: '',
    isActive: true,
    allowResubmit: false,
    resubmitMessage: '',
  })

  const [fields, setFields] = useState<BuilderField[]>([])

  const addField = (type: string) => {
    const newField: BuilderField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      placeholder: '',
      required: false,
      options: type === 'SELECT' || type === 'MULTISELECT' ? ['Option 1', 'Option 2'] : undefined,
    }
    setFields([...fields, newField])
  }

  // Add standard contact fields preset
  const addContactFields = () => {
    const contactFields: BuilderField[] = [
      { id: 'first_name', type: 'TEXT', label: 'First Name', placeholder: 'Enter your first name', required: true },
      { id: 'last_name', type: 'TEXT', label: 'Last Name', placeholder: 'Enter your last name', required: true },
      { id: 'email', type: 'EMAIL', label: 'Email', placeholder: 'your.email@example.com', required: true },
      { id: 'phone', type: 'PHONE', label: 'Phone Number', placeholder: '(555) 123-4567', required: false },
    ]
    setFields(contactFields)
  }

  const updateField = (id: string, updates: Partial<BuilderField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f))
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === fields.length - 1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    const updated = [...fields]
    const [removed] = updated.splice(index, 1)
    updated.splice(newIndex, 0, removed)
    setFields(updated)
  }

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Please enter a form title')
      return
    }

    if (fields.length === 0) {
      toast.error('Please add at least one field')
      return
    }

    // Validate all fields have labels
    const missingLabels = fields.filter(f => !f.label.trim())
    if (missingLabels.length > 0) {
      toast.error('Please add labels to all fields')
      return
    }

    setSaving(true)
    try {
      const formFieldsForApi: FormField[] = fields.map((f, order) => ({
        fieldId: f.id,
        label: f.label,
        fieldType: f.type as FormField['fieldType'],
        options: f.options,
        placeholder: f.placeholder,
        required: f.required,
        order,
      }))

      const data: Partial<SignUpForm> = {
        title: formData.title!,
        description: formData.description || '',
        category: formData.category || 'BAND_OFFICE',
        fields: formFieldsForApi,
        maxEntries: formData.maxEntries,
        deadline: formData.deadline || undefined,
        isActive: formData.isActive ?? true,
        allowResubmit: formData.allowResubmit ?? false,
        resubmitMessage: formData.allowResubmit ? formData.resubmitMessage : undefined,
        createdBy: user?.id,
      }

      const res = await signupFormsApi.create(data)
      if (res.success) {
        toast.success('Form created successfully')
        router.push('/Fq6pm72NjqUA/dashboard/forms')
      } else {
        toast.error(res.error || 'Failed to create form')
      }
    } catch (error) {
      toast.error('Failed to create form')
    } finally {
      setSaving(false)
    }
  }

  const renderFieldPreview = (field: BuilderField) => {
    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
      case 'NUMBER':
        return (
          <input
            type={field.type.toLowerCase()}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            disabled
            className="staff-input w-full px-4 py-2 rounded-lg opacity-70"
          />
        )
      case 'TEXTAREA':
        return (
          <textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
            disabled
            rows={3}
            className="staff-input w-full px-4 py-2 rounded-lg opacity-70 resize-none"
          />
        )
      case 'DATE':
        return (
          <input
            type="date"
            disabled
            className="staff-input w-full px-4 py-2 rounded-lg opacity-70"
          />
        )
      case 'SELECT':
        return (
          <select disabled className="staff-input w-full px-4 py-2 rounded-lg opacity-70">
            <option>Select an option...</option>
            {(field.options || []).map((opt: string, i: number) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
        )
      case 'MULTISELECT':
        return (
          <select disabled multiple className="staff-input w-full px-4 py-2 rounded-lg opacity-70 h-24">
            {(field.options || []).map((opt: string, i: number) => (
              <option key={i}>{opt}</option>
            ))}
          </select>
        )
      case 'CHECKBOX':
        return (
          <label className="flex items-center gap-2">
            <input type="checkbox" disabled className="w-4 h-4 rounded" />
            <span className="text-staff-secondary">{field.placeholder || 'Check this box'}</span>
          </label>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Create Sign-up Form</h1>
              <p className="text-staff-secondary">Build a custom registration form</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center gap-2 transition-colors",
                preview ? "bg-staff-accent text-[#1F2937]" : "bg-[rgba(100,116,139,0.15)] hover:bg-[rgba(100,116,139,0.22)] text-staff-primary"
              )}
            >
              <Eye className="w-4 h-4" />
              {preview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <div className="staff-spinner w-4 h-4"></div> : <Save className="w-4 h-4" />}
              Save Form
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form Settings */}
          <div className="staff-card rounded-xl p-6 space-y-4">
            <h2 className="text-white font-medium">Form Details<HelpTooltip text="Set the basic info for your sign-up form — title, category, and submission limits." /></h2>
            
            <div>
              <label className="block text-sm text-staff-secondary mb-2">Title *<HelpTooltip text="The form title displayed to community members. Be clear and descriptive." /></label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Community Event Registration"
                className="staff-input w-full px-4 py-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-staff-secondary mb-2">Department / Category</label>
              <select
                value={formData.category || 'BAND_OFFICE'}
                onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, category: e.target.value }))}
                className="staff-input w-full px-4 py-3 rounded-lg"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-xs text-staff-muted mt-1">Select the department this form belongs to</p>
            </div>

            <div>
              <label className="block text-sm text-staff-secondary mb-2">Description</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, description: e.target.value }))}
                placeholder="Provide details about this form..."
                rows={3}
                className="staff-input w-full px-4 py-3 rounded-lg resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-staff-secondary mb-2">Max Submissions</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxEntries || ''}
                  onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ 
                    ...prev, 
                    maxEntries: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="Unlimited"
                  className="staff-input w-full px-4 py-3 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-staff-secondary mb-2">Deadline</label>
                <input
                  type="datetime-local"
                  value={formData.deadline || ''}
                  onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, deadline: e.target.value }))}
                  className="staff-input w-full px-4 py-3 rounded-lg"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-staff-secondary">Enable This Form</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowResubmit || false}
                onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, allowResubmit: e.target.checked }))}
                className="w-4 h-4 rounded"
              />
              <span className="text-staff-secondary">Allow resubmissions (for recurring programs)</span>
            </label>
            {formData.allowResubmit && (
              <div className="ml-6">
                <label className="block text-sm text-staff-secondary mb-2">Resubmit Message (Optional)</label>
                <input
                  type="text"
                  value={formData.resubmitMessage || ''}
                  onChange={(e) => setFormData((prev: Partial<SignUpForm>) => ({ ...prev, resubmitMessage: e.target.value }))}
                  placeholder="e.g., Submit again for the next session"
                  className="staff-input w-full px-4 py-3 rounded-lg"
                />
                <p className="text-xs text-staff-muted mt-1">Custom message shown to members who have already submitted</p>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="staff-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-medium">Form Fields</h2>
              <button
                onClick={addContactFields}
                disabled={fields.length > 0}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  fields.length > 0 
                    ? "bg-white/5 text-staff-muted cursor-not-allowed"
                    : "bg-staff-accent/20 text-staff-accent hover:bg-staff-accent/30"
                )}
                title={fields.length > 0 ? "Clear fields first to use preset" : "Add standard contact fields"}
              >
                <UserPlus className="w-4 h-4" />
                Add Contact Fields
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-lg">
                <p className="text-staff-muted mb-3">No fields added yet. Use the field types on the right to add fields.</p>
                <p className="text-xs text-staff-muted">Or use "Add Contact Fields" for a quick preset with name, email, and phone.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div 
                    key={field.id}
                    className="staff-card rounded-lg p-4 border-white/10"
                  >
                    {preview ? (
                      <div>
                        <label className="block text-sm text-white mb-2">
                          {field.label || 'Untitled Field'}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {renderFieldPreview(field)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          {/* Up/Down reorder buttons */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveField(index, 'up')}
                              disabled={index === 0}
                              className={cn(
                                "p-1 rounded transition-colors",
                                index === 0 ? "text-staff-muted/30 cursor-not-allowed" : "text-staff-muted hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveField(index, 'down')}
                              disabled={index === fields.length - 1}
                              className={cn(
                                "p-1 rounded transition-colors",
                                index === fields.length - 1 ? "text-staff-muted/30 cursor-not-allowed" : "text-staff-muted hover:bg-white/10 hover:text-white"
                              )}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex-1 flex items-center gap-3">
                            <span className="text-xs text-staff-muted uppercase bg-white/5 px-2 py-0.5 rounded">{field.type}</span>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              placeholder="Field Label *"
                              className="staff-input flex-1 px-3 py-1.5 rounded text-sm"
                            />
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="w-3 h-3 rounded"
                            />
                            <span className="text-xs text-staff-muted">Required</span>
                          </label>
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                          placeholder="Placeholder text (optional)"
                          className="staff-input w-full px-3 py-1.5 rounded text-sm"
                        />

                        {(field.type === 'SELECT' || field.type === 'MULTISELECT') && (
                          <div>
                            <label className="block text-xs text-staff-muted mb-1">Options (one per line)</label>
                            <textarea
                              value={(field.options || []).join('\n')}
                              onChange={(e) => updateField(field.id, { 
                                options: e.target.value.split('\n').filter(Boolean) 
                              })}
                              rows={3}
                              className="staff-input w-full px-3 py-2 rounded text-sm resize-none"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Field Types Sidebar */}
        <div className="space-y-6">
          <div className="staff-card rounded-xl p-4 lg:sticky lg:top-6">
            <h3 className="text-white font-medium mb-4">Add Field</h3>
            <div className="space-y-2">
              {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-left transition-colors"
                >
                  <Icon className="w-4 h-4 text-staff-accent" />
                  <span className="text-white text-sm">{label}</span>
                  <Plus className="w-4 h-4 text-staff-muted ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
