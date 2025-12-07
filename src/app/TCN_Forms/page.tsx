'use client'
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getActiveSignupForm,
  checkUserSubmission,
  submitSignupForm,
  getUserSignupSubmissions,
} from '@/lib/actions';
import { 
  FileText,
  ArrowLeft,
  X,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Home,
  Calendar,
  Users,
  Info,
  ClipboardCheck
} from 'lucide-react';

// Field type definitions
type SignupFormField = {
  fieldId: string;
  label: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'CHECKBOX';
  required: boolean;
  order: number;
  placeholder?: string;
  options?: string[];
};

type SignupForm = {
  id: string;
  tcn_form_id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  max_entries: number | null;
  is_active: boolean;
  category: string;
  created_by: string | null;
  fields: SignupFormField[];
  created: Date;
  updated: Date;
  submissionCount?: number;
};

// Category colors for display
const categoryColors: Record<string, string> = {
  GENERAL: 'bg-blue-100 text-blue-800',
  HEALTH: 'bg-green-100 text-green-800',
  EDUCATION: 'bg-purple-100 text-purple-800',
  HOUSING: 'bg-orange-100 text-orange-800',
  EMPLOYMENT: 'bg-teal-100 text-teal-800',
  RECREATION: 'bg-pink-100 text-pink-800',
  SOCIAL_SERVICES: 'bg-red-100 text-red-800',
  CHIEFNCOUNCIL: 'bg-amber-100 text-amber-800',
  PROGRAM_EVENTS: 'bg-indigo-100 text-indigo-800',
  ANNOUNCEMENTS: 'bg-yellow-100 text-yellow-800',
};

export default function TCNFormsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form handling
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // TanStack Query for fetching active signup form
  const {
    data: formData,
    isLoading: loadingForm,
    error: formError,
  } = useQuery({
    queryKey: ['activeSignupForm'],
    queryFn: async () => {
      const result = await getActiveSignupForm();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load form');
      }
      
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Check if user has already submitted
  const {
    data: submissionStatus,
    isLoading: loadingSubmissionStatus,
  } = useQuery({
    queryKey: ['signupSubmissionStatus', formData?.tcn_form_id, session?.user?.id],
    queryFn: async () => {
      if (!formData?.tcn_form_id || !session?.user?.id) return null;
      
      const result = await checkUserSubmission(formData.tcn_form_id, session.user.id);
      
      if (!result.success) {
        return { hasSubmitted: false };
      }
      
      return result.data;
    },
    enabled: status === 'authenticated' && !!formData?.tcn_form_id && !!session?.user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get user's past submissions
  const {
    data: userSubmissions,
  } = useQuery({
    queryKey: ['userSignupSubmissions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const result = await getUserSignupSubmissions(session.user.id);
      
      if (!result.success) {
        return [];
      }
      
      return result.data || [];
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  const activeForm = formData as SignupForm | null;
  const hasSubmitted = submissionStatus?.hasSubmitted || false;

  // Open form modal
  const openFormModal = useCallback(() => {
    if (hasSubmitted) {
      toast.info('You have already submitted this form');
      return;
    }
    reset(); // Reset form values
    setIsModalOpen(true);
  }, [reset, hasSubmitted]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    reset();
  }, [reset]);

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      if (!session?.user?.id || !activeForm) throw new Error('Missing data');
      
      const result = await submitSignupForm(
        activeForm.tcn_form_id,
        session.user.id,
        formData
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      return result.data;
    },
    onSuccess: () => {
      toast.success('Registration submitted successfully!');
      closeModal();
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['signupSubmissionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['userSignupSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['activeSignupForm'] });
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
  const renderFormField = (field: SignupFormField) => {
    const fieldError = errors[field.fieldId];
    const baseInputClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent";
    const errorClass = fieldError ? "border-red-500" : "border-stone-300";

    switch (field.fieldType) {
      case 'TEXTAREA':
        return (
          <textarea
            {...register(field.fieldId, { required: field.required })}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'SELECT':
        return (
          <select
            {...register(field.fieldId, { required: field.required })}
            className={`${baseInputClass} ${errorClass}`}
          >
            <option value="">Select an option...</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'MULTISELECT':
        return (
          <select
            {...register(field.fieldId, { required: field.required })}
            multiple
            className={`${baseInputClass} ${errorClass} min-h-[100px]`}
          >
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      
      case 'CHECKBOX':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register(field.fieldId, { required: field.required })}
              className="w-4 h-4 text-amber-600 border-stone-300 rounded focus:ring-amber-500"
            />
            <span className="text-sm text-stone-600">{field.placeholder || 'Yes'}</span>
          </div>
        );
      
      case 'DATE':
        return (
          <input
            type="date"
            {...register(field.fieldId, { required: field.required })}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'NUMBER':
        return (
          <input
            type="number"
            {...register(field.fieldId, { required: field.required })}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'EMAIL':
        return (
          <input
            type="email"
            {...register(field.fieldId, { 
              required: field.required,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            })}
            placeholder={field.placeholder || 'email@example.com'}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      case 'PHONE':
        return (
          <input
            type="tel"
            {...register(field.fieldId, { required: field.required })}
            placeholder={field.placeholder || '(000) 000-0000'}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
      
      default: // TEXT
        return (
          <input
            type="text"
            {...register(field.fieldId, { required: field.required })}
            placeholder={field.placeholder}
            className={`${baseInputClass} ${errorClass}`}
          />
        );
    }
  };

  // Format deadline for display
  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    return d.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline: Date | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
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

  const daysRemaining = activeForm?.deadline ? getDaysRemaining(activeForm.deadline) : null;

  return (
    <div className="w-full min-h-screen bg-stone-100">
      {/* Form Fill Modal */}
      <AnimatePresence>
        {isModalOpen && activeForm && (
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
                    <h2 className="text-lg font-bold text-white">{activeForm.title}</h2>
                    {activeForm.created_by && (
                      <span className="text-xs text-amber-200">by {activeForm.created_by}</span>
                    )}
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
                {activeForm.description && (
                  <p className="text-stone-600 mb-6">{activeForm.description}</p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {activeForm.fields
                    .sort((a, b) => a.order - b.order)
                    .map((field) => (
                    <div key={field.fieldId} className="space-y-1">
                      <label className="block text-sm font-medium text-stone-700">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFormField(field)}
                      {errors[field.fieldId] && (
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
                          Submit Registration
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
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white mb-6"
          >
            <div className="flex items-center gap-4 mb-3">
              <ClipboardCheck className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Community Sign-Up</h1>
            </div>
            <p className="text-amber-50">
              Register for community programs, events, and services. Sign-up forms are posted here 
              as they become available and each has its own deadline.
            </p>
          </motion.div>

          {/* Info Box about how sign-ups work */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6"
          >
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How Community Sign-Ups Work</h3>
                <p className="text-sm text-blue-800">
                  Sign-up forms are posted by community departments for specific programs, events, or services. 
                  Each form has a deadline after which it will no longer accept registrations. Once you submit 
                  a form, your registration is sent directly to the organizing department. Check back regularly 
                  for new sign-up opportunities!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Loading State */}
          {loadingForm && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <p className="text-stone-600">Loading current sign-up form...</p>
            </div>
          )}

          {/* No Active Form */}
          {!loadingForm && !activeForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center"
            >
              <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-stone-800 mb-2">No Active Sign-Up Forms</h2>
              <p className="text-stone-600 max-w-md mx-auto">
                There are currently no sign-up forms available. Check back later for upcoming 
                community programs, events, and services that require registration.
              </p>
            </motion.div>
          )}

          {/* Active Form Card */}
          {!loadingForm && activeForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden"
            >
              {/* Form Header */}
              <div className="p-6 border-b border-stone-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${categoryColors[activeForm.category] || 'bg-stone-100 text-stone-800'}`}>
                        {activeForm.category.replace('_', ' ')}
                      </span>
                      {activeForm.created_by && (
                        <span className="text-xs text-stone-500">
                          by {activeForm.created_by}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">{activeForm.title}</h2>
                    {activeForm.description && (
                      <p className="text-stone-600">{activeForm.description}</p>
                    )}
                  </div>
                </div>

                {/* Form Meta Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {/* Deadline */}
                  {activeForm.deadline && (
                    <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-3">
                      <Clock className={`w-5 h-5 ${daysRemaining && daysRemaining <= 3 ? 'text-red-600' : 'text-amber-600'}`} />
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">Deadline</p>
                        <p className="text-sm font-semibold text-stone-800">
                          {formatDeadline(activeForm.deadline)}
                        </p>
                        {daysRemaining !== null && (
                          <p className={`text-xs ${daysRemaining <= 3 ? 'text-red-600 font-semibold' : 'text-stone-500'}`}>
                            {daysRemaining <= 0 ? 'Deadline passed' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Entries */}
                  {activeForm.max_entries && (
                    <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-3">
                      <Users className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-xs text-stone-500 uppercase tracking-wide">Spots</p>
                        <p className="text-sm font-semibold text-stone-800">
                          {activeForm.submissionCount || 0} / {activeForm.max_entries}
                        </p>
                        <p className="text-xs text-stone-500">
                          {activeForm.max_entries - (activeForm.submissionCount || 0)} remaining
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-3 bg-stone-50 rounded-lg p-3">
                    {hasSubmitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide">Your Status</p>
                          <p className="text-sm font-semibold text-green-700">Registered</p>
                          <p className="text-xs text-stone-500">
                            Submitted {submissionStatus?.submittedAt 
                              ? new Date(submissionStatus.submittedAt).toLocaleDateString() 
                              : ''}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide">Your Status</p>
                          <p className="text-sm font-semibold text-amber-700">Not Registered</p>
                          <p className="text-xs text-stone-500">Click below to sign up</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 bg-stone-50">
                {hasSubmitted ? (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">You're Already Registered!</span>
                    </div>
                    <p className="text-sm text-stone-500 mt-2">
                      Your registration has been submitted to the organizing department.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={openFormModal}
                    disabled={loadingSubmissionStatus}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold text-lg disabled:opacity-50"
                  >
                    {loadingSubmissionStatus ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Checking status...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        Sign Up Now
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Past Submissions Section */}
          {userSubmissions && userSubmissions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8"
            >
              <h3 className="text-lg font-bold text-stone-800 mb-4">Your Past Registrations</h3>
              <div className="space-y-3">
                {userSubmissions.map((submission: any) => (
                  <div 
                    key={submission.id}
                    className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-stone-800">{submission.form.title}</h4>
                      <p className="text-sm text-stone-500">
                        Submitted {new Date(submission.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Registered</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-white rounded-xl shadow-sm border border-stone-200 p-4"
          >
            <h3 className="font-bold text-stone-800 mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/TCN_BulletinBoard" className="p-3 rounded-lg hover:bg-amber-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-700" />
                  <span className="text-sm font-medium text-stone-700">Bulletin Board</span>
                </div>
              </Link>
              <Link href="/TCN_Home" className="p-3 rounded-lg hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-amber-700" />
                  <span className="text-sm font-medium text-stone-700">Back to Home</span>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Error State */}
          {formError && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center mt-4">
              <p className="text-red-600">{formError instanceof Error ? formError.message : 'An error occurred'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
