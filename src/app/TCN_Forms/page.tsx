'use client'
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  queryFillableForms, 
  createFormSubmission,
  submitFormAndGeneratePDF,
  getMemberFormSubmissions
} from '@/lib/actions';
import { 
  FileText,
  Filter,
  ArrowLeft,
  X,
  Download,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Loader2,
  Home,
  ClipboardList
} from 'lucide-react';
import type { FormField } from '@/lib/validation';

// Form categories
const categories = [
  { value: 'ALL', label: 'All Forms', color: 'amber' },
  { value: 'GENERAL', label: 'General', color: 'blue' },
  { value: 'HEALTH', label: 'Health', color: 'green' },
  { value: 'EDUCATION', label: 'Education', color: 'purple' },
  { value: 'HOUSING', label: 'Housing', color: 'orange' },
  { value: 'EMPLOYMENT', label: 'Employment', color: 'teal' },
  { value: 'RECREATION', label: 'Recreation', color: 'pink' },
  { value: 'SOCIAL_SERVICES', label: 'Social Services', color: 'red' },
];

// Status badge colors
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

type FillableForm = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  pdf_url: string;
  form_fields: FormField[];
  is_active: boolean;
  created: Date;
};

type FormSubmission = {
  id: string;
  created: Date;
  status: string;
  filled_pdf_url: string | null;
  form: {
    id: string;
    title: string;
    category: string;
  };
};

export default function TCNFormsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [forms, setForms] = useState<FillableForm[]>([]);
  const [mySubmissions, setMySubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedForm, setSelectedForm] = useState<FillableForm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'forms' | 'submissions'>('forms');

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch forms
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const params = selectedCategory === 'ALL' 
          ? { is_active: true, page: 1, limit: 100, sortBy: 'created' as const, sortOrder: 'desc' as const }
          : { is_active: true, category: selectedCategory as any, page: 1, limit: 100, sortBy: 'created' as const, sortOrder: 'desc' as const };
        
        const [formsResult, submissionsResult] = await Promise.all([
          queryFillableForms(params),
          getMemberFormSubmissions(session.user.id)
        ]);
        
        if (isMounted) {
          if (formsResult.success && formsResult.data) {
            setForms(formsResult.data.forms);
          }
          if (submissionsResult.success && submissionsResult.data) {
            setMySubmissions(submissionsResult.data);
          }
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('An error occurred while loading forms');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, status, session?.user?.id]);

  // Open form modal
  const openFormModal = useCallback((form: FillableForm) => {
    setSelectedForm(form);
    reset(); // Reset form values
    setIsModalOpen(true);
  }, [reset]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedForm(null);
    reset();
  }, [reset]);

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      if (!session?.user?.id || !selectedForm) throw new Error('Missing data');
      
      // Create the submission
      const submissionResult = await createFormSubmission({
        formId: selectedForm.id,
        fnmemberId: session.user.id,
        form_data: formData,
      });

      if (!submissionResult.success) {
        throw new Error(submissionResult.error || 'Failed to save form');
      }

      // Generate the filled PDF
      const pdfResult = await submitFormAndGeneratePDF(submissionResult.data.id);
      
      if (!pdfResult.success) {
        throw new Error(pdfResult.error || 'Failed to generate PDF');
      }

      return pdfResult.data;
    },
    onSuccess: () => {
      toast.success('Form submitted successfully!');
      closeModal();
      // Refresh submissions
      if (session?.user?.id) {
        getMemberFormSubmissions(session.user.id).then(result => {
          if (result.success && result.data) {
            setMySubmissions(result.data);
          }
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit form');
    },
  });

  // Handle form submission
  const onSubmit = useCallback((data: Record<string, any>) => {
    submitMutation.mutate(data);
  }, [submitMutation]);

  // Render form field based on type
  const renderFormField = (field: FormField) => {
    const fieldError = errors[field.name];
    const baseInputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent";
    const errorClass = fieldError ? "border-red-500" : "border-stone-300";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...register(field.name, { required: field.required })}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'select':
        return (
          <select
            {...register(field.name, { required: field.required })}
            className={`${baseInputClass} ${errorClass}`}
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register(field.name, { required: field.required })}
              className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-stone-600">{field.placeholder}</span>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  {...register(field.name, { required: field.required })}
                  value={opt.value}
                  className="w-4 h-4 text-amber-600 border-stone-300 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-700">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      
      case 'date':
        return (
          <input
            type="date"
            {...register(field.name, { required: field.required })}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            {...register(field.name, { 
              required: field.required,
              min: field.validation?.min,
              max: field.validation?.max,
            })}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'email':
        return (
          <input
            type="email"
            {...register(field.name, { 
              required: field.required,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            })}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'phone':
        return (
          <input
            type="tel"
            {...register(field.name, { required: field.required })}
            placeholder={field.placeholder || '(000) 000-0000'}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            {...register(field.name, { 
              required: field.required,
              minLength: field.validation?.minLength,
              maxLength: field.validation?.maxLength,
            })}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
    }
  };

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/TCN_Enter");
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-stone-100">
      {/* Form Fill Modal */}
      <AnimatePresence>
        {isModalOpen && selectedForm && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white" />
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedForm.title}</h2>
                    <span className="text-xs text-amber-200">
                      {categories.find(c => c.value === selectedForm.category)?.label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                {selectedForm.description && (
                  <p className="text-stone-600 mb-6">{selectedForm.description}</p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {selectedForm.form_fields.map((field) => (
                    <div key={field.id} className="space-y-1">
                      <label className="block text-sm font-medium text-stone-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFormField(field)}
                      {errors[field.name] && (
                        <p className="text-xs text-red-600">This field is required</p>
                      )}
                    </div>
                  ))}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-3 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Form
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fixed Top bar */}
      <div className="fixed top-0 z-100 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      <div className="pt-16 lg:pt-16">
        {/* Back Button */}
        <div className="max-w-[80vw] mx-auto px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* 3-Column Layout */}
        <div className="max-w-[80vw] mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR - Category Filter */}
            <aside className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold text-stone-800">Categories</h3>
                </div>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`w-full p-3 rounded-lg transition-all text-left ${
                        selectedCategory === cat.value
                          ? 'bg-amber-100 border border-amber-300'
                          : 'hover:bg-stone-50 border border-transparent'
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        selectedCategory === cat.value ? 'text-amber-900' : 'text-stone-700'
                      }`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-6 space-y-4">
              {/* Page Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <FileText className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Community Forms</h1>
                </div>
                <p className="text-amber-50">Fill out and submit forms online. Your completed forms will be saved and available for download.</p>
              </motion.div>

              {/* Tab Switcher */}
              <div className="flex bg-white rounded-xl shadow-sm border border-stone-200 p-1">
                <button
                  onClick={() => setActiveTab('forms')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                    activeTab === 'forms' 
                      ? 'bg-amber-100 text-amber-900' 
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  Available Forms
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                    activeTab === 'submissions' 
                      ? 'bg-amber-100 text-amber-900' 
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  My Submissions ({mySubmissions.length})
                </button>
              </div>

              {/* Forms List */}
              {activeTab === 'forms' && (
                <div className="space-y-3">
                  {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-stone-600">Loading forms...</p>
                    </div>
                  ) : forms.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-600">No forms available in this category.</p>
                    </div>
                  ) : (
                    forms.map((form, index) => (
                      <motion.div
                        key={form.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 hover:shadow-md hover:border-amber-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                                {categories.find(c => c.value === form.category)?.label}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-stone-800 mb-1">{form.title}</h3>
                            {form.description && (
                              <p className="text-sm text-stone-600 line-clamp-2">{form.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => openFormModal(form)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors ml-4"
                          >
                            <FileText className="w-4 h-4" />
                            Fill Out
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Submissions List */}
              {activeTab === 'submissions' && (
                <div className="space-y-3">
                  {mySubmissions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <FileCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-600">You haven't submitted any forms yet.</p>
                    </div>
                  ) : (
                    mySubmissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="bg-white rounded-xl shadow-sm border border-stone-200 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[submission.status]}`}>
                                {submission.status.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-stone-500">
                                {new Date(submission.created).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-stone-800">{submission.form.title}</h3>
                          </div>
                          {submission.filled_pdf_url && (
                            <a
                              href={submission.filled_pdf_url}
                              download
                              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors ml-4"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-stone-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/TCN_BulletinBoard" className="block p-3 rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-amber-700" />
                      <span className="text-sm font-medium text-stone-700">Bulletin Board</span>
                    </div>
                  </Link>
                  <Link href="/TCN_Home" className="block p-3 rounded-lg hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Home className="w-5 h-5 text-amber-700" />
                      <span className="text-sm font-medium text-stone-700">Back to Home</span>
                    </div>
                  </Link>
                </div>

                {/* Status Legend */}
                <div className="mt-6 pt-4 border-t border-stone-200">
                  <h4 className="text-sm font-semibold text-stone-700 mb-3">Submission Status</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span>Pending - Draft saved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-600" />
                      <span>Submitted - Under review</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>Rejected</span>
                    </div>
                  </div>
                </div>
              </motion.div>              
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}