'use client'
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getAllSignupForms,
  submitSignupForm,
  getUserSignupSubmissions,
  resubmitSignupForm,
  getSubmissionHistory,
  getFnmemberById,
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
  ClipboardCheck,
  FolderOpen,
  Edit3,
  History,
  RefreshCw,
  ChevronRight,
  Menu,
  Filter,
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
  hasUserSubmitted?: boolean;
  allow_resubmit?: boolean;
};

// Category display info
const categoryInfo: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  GENERAL: { label: 'General', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: <FolderOpen className="w-4 h-4" /> },
  HEALTH: { label: 'Health', color: 'text-green-700', bgColor: 'bg-green-100', icon: <ClipboardCheck className="w-4 h-4" /> },
  EDUCATION: { label: 'Education', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: <FileText className="w-4 h-4" /> },
  HOUSING: { label: 'Housing', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: <Home className="w-4 h-4" /> },
  EMPLOYMENT: { label: 'Employment', color: 'text-teal-700', bgColor: 'bg-teal-100', icon: <Users className="w-4 h-4" /> },
  RECREATION: { label: 'Recreation', color: 'text-pink-700', bgColor: 'bg-pink-100', icon: <Calendar className="w-4 h-4" /> },
  SOCIAL_SERVICES: { label: 'Social Services', color: 'text-red-700', bgColor: 'bg-red-100', icon: <Users className="w-4 h-4" /> },
  CHIEFNCOUNCIL: { label: 'Chief & Council', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: <ClipboardCheck className="w-4 h-4" /> },
  PROGRAM_EVENTS: { label: 'Programs & Events', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: <Calendar className="w-4 h-4" /> },
  ANNOUNCEMENTS: { label: 'Announcements', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: <Info className="w-4 h-4" /> },
};

export default function TCNFormsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'browse' | 'myforms'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<SignupForm | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Fetch logged-in user's member data for auto-fill
  const {
    data: memberData,
  } = useQuery({
    queryKey: ['memberData', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const result = await getFnmemberById(session.user.id);
      
      if (!result.success) {
        return null;
      }
      
      return result.data;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Helper to get user's contact info from profile
  const userContactInfo = useMemo(() => {
    if (!memberData) return null;
    
    const profile = Array.isArray(memberData.profile) 
      ? memberData.profile[0] 
      : memberData.profile;
    
    return {
      firstName: memberData.first_name || '',
      lastName: memberData.last_name || '',
      fullName: `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim(),
      email: profile?.email || '',
      phone: profile?.phone_number || '',
      address: profile?.address || '',
      community: profile?.community || '',
    };
  }, [memberData]);

  // Fetch all forms grouped by category
  const {
    data: allFormsData,
    isLoading: loadingForms,
  } = useQuery({
    queryKey: ['allSignupForms', session?.user?.id],
    queryFn: async () => {
      const result = await getAllSignupForms(session?.user?.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5,
  });

  // Get user's past submissions
  const {
    data: userSubmissions,
    isLoading: loadingSubmissions,
  } = useQuery({
    queryKey: ['userSignupSubmissions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const result = await getUserSignupSubmissions(session.user.id);
      if (!result.success) return [];
      return result.data || [];
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch submission history when modal is open
  const {
    data: submissionHistory,
    isLoading: loadingHistory,
  } = useQuery({
    queryKey: ['submissionHistory', selectedForm?.tcn_form_id, session?.user?.id],
    queryFn: async () => {
      if (!selectedForm?.tcn_form_id || !session?.user?.id) return [];
      const result = await getSubmissionHistory(selectedForm.tcn_form_id, session.user.id);
      if (!result.success) return [];
      return result.data || [];
    },
    enabled: showHistoryModal && !!selectedForm?.tcn_form_id && !!session?.user?.id,
  });

  // Helper function to auto-fill form fields
  const getAutoFillValue = useCallback((field: SignupFormField): string | undefined => {
    if (!userContactInfo) return undefined;
    
    const fieldIdLower = field.fieldId.toLowerCase();
    const labelLower = field.label.toLowerCase();
    
    if (field.fieldType === 'EMAIL') return userContactInfo.email;
    if (field.fieldType === 'PHONE') return userContactInfo.phone;
    
    if (fieldIdLower.includes('email') || labelLower.includes('email')) return userContactInfo.email;
    if (fieldIdLower.includes('phone') || labelLower.includes('phone')) return userContactInfo.phone;
    if (fieldIdLower.includes('address') || labelLower.includes('address')) return userContactInfo.address;
    if (fieldIdLower.includes('community') || labelLower.includes('community')) return userContactInfo.community;
    if (fieldIdLower.includes('fullname') || fieldIdLower.includes('full_name') || labelLower.includes('full name') || labelLower === 'name') return userContactInfo.fullName;
    if ((fieldIdLower.includes('firstname') || fieldIdLower.includes('first_name') || labelLower.includes('first name')) && !fieldIdLower.includes('last')) return userContactInfo.firstName;
    if (fieldIdLower.includes('lastname') || fieldIdLower.includes('last_name') || labelLower.includes('last name')) return userContactInfo.lastName;
    
    return undefined;
  }, [userContactInfo]);

  // Open form modal
  const openFormModal = useCallback((form: SignupForm, editMode: boolean = false, existingResponses?: Record<string, any>) => {
    setSelectedForm(form);
    setIsEditMode(editMode);
    reset();
    
    if (editMode && existingResponses) {
      // Pre-fill with existing responses
      Object.entries(existingResponses).forEach(([key, value]) => {
        setValue(key, value);
      });
    } else if (!editMode && userContactInfo) {
      // Auto-fill contact fields for new submissions
      form.fields.forEach((field) => {
        const autoFillValue = getAutoFillValue(field);
        if (autoFillValue) setValue(field.fieldId, autoFillValue);
      });
    }
    
    setIsModalOpen(true);
  }, [reset, userContactInfo, getAutoFillValue, setValue]);

  // Close modal
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedForm(null);
    setIsEditMode(false);
    reset();
  }, [reset]);

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async (formData: Record<string, any>) => {
      if (!session?.user?.id || !selectedForm) throw new Error('Missing data');
      
      if (isEditMode) {
        const result = await resubmitSignupForm(selectedForm.tcn_form_id, session.user.id, formData);
        if (!result.success) throw new Error(result.error || 'Failed to resubmit form');
        return result.data;
      } else {
        const result = await submitSignupForm(selectedForm.tcn_form_id, session.user.id, formData);
        if (!result.success) throw new Error(result.error || 'Failed to submit form');
        return result.data;
      }
    },
    onSuccess: () => {
      toast.success(isEditMode ? 'Form updated successfully!' : 'Registration submitted successfully!');
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['allSignupForms'] });
      queryClient.invalidateQueries({ queryKey: ['userSignupSubmissions'] });
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
      
      default:
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

  // Format deadline
  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline: Date | null) => {
    if (!deadline) return null;
    const d = new Date(deadline);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Get forms to display based on selected category
  const displayForms = useMemo(() => {
    if (!allFormsData?.forms) return [];
    
    if (selectedCategory) {
      return allFormsData.forms[selectedCategory] || [];
    }
    
    // Return all forms flat
    return Object.values(allFormsData.forms).flat();
  }, [allFormsData, selectedCategory]);

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
      {/* Form Modal */}
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
                  {isEditMode ? <Edit3 className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-white" />}
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedForm.title}</h2>
                    <div className="flex items-center gap-2">
                      {selectedForm.created_by && (
                        <span className="text-xs text-amber-200">by {selectedForm.created_by}</span>
                      )}
                      {isEditMode && (
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">Edit Mode</span>
                      )}
                    </div>
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
                  {selectedForm.fields
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
                          {isEditMode ? 'Updating...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {isEditMode ? 'Update Submission' : 'Submit Registration'}
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

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && selectedForm && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setShowHistoryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-indigo-700 to-indigo-900">
                <div className="flex items-center gap-3">
                  <History className="w-6 h-6 text-white" />
                  <h2 className="text-lg font-bold text-white">Submission History</h2>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : submissionHistory && submissionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {submissionHistory.map((entry: any, index: number) => (
                      <div 
                        key={entry.id || index}
                        className={`p-4 rounded-lg border ${entry.isCurrent ? 'border-indigo-300 bg-indigo-50' : 'border-stone-200 bg-stone-50'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-semibold ${entry.isCurrent ? 'text-indigo-700' : 'text-stone-700'}`}>
                            {entry.isCurrent ? 'Current Submission' : `Submission #${entry.submission_cycle}`}
                          </span>
                          <span className="text-xs text-stone-500">
                            {new Date(entry.created).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-stone-600">
                          <span className={`px-2 py-0.5 rounded ${
                            entry.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            entry.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            entry.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-stone-500">
                    No submission history found
                  </div>
                )}
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
        {/* Back Button & Header */}
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white mb-6"
          >
            <div className="flex items-center gap-4 mb-3">
              <ClipboardCheck className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Sign-Up Forms & Event Registrations</h1>
            </div>
            <p className="text-amber-50">
              Browse available sign-up forms by category or manage your submitted forms.
            </p>
          </motion.div>
        </div>

        {/* Main Content with Tabs */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'browse' | 'myforms')} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Browse Forms
              </TabsTrigger>
              <TabsTrigger value="myforms" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Forms
                {userSubmissions && userSubmissions.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-600 text-white rounded-full">
                    {userSubmissions.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Browse Forms Tab */}
            <TabsContent value="browse">
              <div className="flex gap-6">
                {/* Category Sidebar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${sidebarOpen ? 'w-64' : 'w-12'} flex-shrink-0 transition-all duration-300`}
                >
                  {/* Mobile toggle */}
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden mb-4 p-2 rounded-lg bg-white border border-stone-200 hover:bg-stone-50"
                  >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>

                  <div className={`bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden ${!sidebarOpen && 'hidden lg:block'}`}>
                    <div className="p-4 border-b border-stone-100 bg-stone-50">
                      <div className="flex items-center gap-2 text-stone-700">
                        <Filter className="w-4 h-4" />
                        <h3 className="font-semibold text-sm">Categories</h3>
                      </div>
                    </div>
                    <div className="p-2">
                      {/* All Forms option */}
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                          selectedCategory === null 
                            ? 'bg-amber-100 text-amber-800 font-medium' 
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <FolderOpen className="w-4 h-4" />
                        <span>All Forms</span>
                        {allFormsData?.totalForms && (
                          <span className="ml-auto text-xs bg-stone-100 px-2 py-0.5 rounded-full">
                            {allFormsData.totalForms}
                          </span>
                        )}
                      </button>

                      {/* Category list */}
                      {allFormsData?.categories?.map((category: string) => {
                        const info = categoryInfo[category] || { label: category, color: 'text-stone-700', bgColor: 'bg-stone-100', icon: <FolderOpen className="w-4 h-4" /> };
                        const formCount = allFormsData.forms[category]?.length || 0;
                        
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-colors ${
                              selectedCategory === category 
                                ? `${info.bgColor} ${info.color} font-medium` 
                                : 'hover:bg-stone-50 text-stone-700'
                            }`}
                          >
                            {info.icon}
                            <span>{info.label}</span>
                            <span className={`ml-auto text-xs ${selectedCategory === category ? 'bg-white/50' : 'bg-stone-100'} px-2 py-0.5 rounded-full`}>
                              {formCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>

                {/* Forms List */}
                <div className="flex-1">
                  {loadingForms ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
                      <p className="text-stone-600">Loading forms...</p>
                    </div>
                  ) : displayForms.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <Calendar className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-stone-800 mb-2">No Forms Available</h2>
                      <p className="text-stone-600">
                        {selectedCategory 
                          ? `No forms available in this category.` 
                          : 'There are currently no sign-up forms available.'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {displayForms.map((form: SignupForm) => {
                        const daysRemaining = getDaysRemaining(form.deadline);
                        const catInfo = categoryInfo[form.category] || { label: form.category, color: 'text-stone-700', bgColor: 'bg-stone-100' };
                        
                        return (
                          <motion.div
                            key={form.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${catInfo.bgColor} ${catInfo.color}`}>
                                      {catInfo.label}
                                    </span>
                                    {form.hasUserSubmitted && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        Submitted
                                      </span>
                                    )}
                                    {form.allow_resubmit && (
                                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                        <RefreshCw className="w-3 h-3" />
                                        Recurring
                                      </span>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-semibold text-stone-900 mb-1">{form.title}</h3>
                                  {form.description && (
                                    <p className="text-sm text-stone-600 line-clamp-2">{form.description}</p>
                                  )}
                                </div>
                                
                                {/* Action Button */}
                                <div className="flex-shrink-0">
                                  {form.hasUserSubmitted && !form.allow_resubmit ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                      <CheckCircle className="w-4 h-4" />
                                      Registered
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => openFormModal(form, false)}
                                      className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors text-sm font-medium"
                                    >
                                      <FileText className="w-4 h-4" />
                                      {form.hasUserSubmitted && form.allow_resubmit ? 'Resubmit' : 'Sign Up'}
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Meta info */}
                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-stone-100 text-sm">
                                {form.deadline && (
                                  <div className={`flex items-center gap-1.5 ${daysRemaining && daysRemaining <= 3 ? 'text-red-600' : 'text-stone-500'}`}>
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {formatDeadline(form.deadline)}
                                      {daysRemaining !== null && daysRemaining > 0 && (
                                        <span className="ml-1">({daysRemaining}d left)</span>
                                      )}
                                    </span>
                                  </div>
                                )}
                                {form.max_entries && (
                                  <div className="flex items-center gap-1.5 text-stone-500">
                                    <Users className="w-4 h-4" />
                                    <span>{form.submissionCount || 0}/{form.max_entries} spots</span>
                                  </div>
                                )}
                                {form.created_by && (
                                  <div className="flex items-center gap-1.5 text-stone-500">
                                    <Info className="w-4 h-4" />
                                    <span>{form.created_by}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* My Forms Tab */}
            <TabsContent value="myforms">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Your Submitted Forms</h3>
                      <p className="text-sm text-blue-800">
                        View and manage forms you&apos;ve submitted. Some programs allow you to edit and resubmit your registration for recurring sign-up cycles.
                      </p>
                    </div>
                  </div>
                </div>

                {loadingSubmissions ? (
                  <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-600 mx-auto mb-4" />
                    <p className="text-stone-600">Loading your submissions...</p>
                  </div>
                ) : !userSubmissions || userSubmissions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                    <FileText className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-stone-800 mb-2">No Forms Submitted</h2>
                    <p className="text-stone-600 mb-4">
                      You haven&apos;t submitted any sign-up forms yet. Browse available forms to get started.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Browse Forms
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {userSubmissions.map((submission: any) => {
                      const catInfo = categoryInfo[submission.form.category] || { label: submission.form.category, color: 'text-stone-700', bgColor: 'bg-stone-100' };
                      const canResubmit = submission.form.allow_resubmit;
                      const historyCount = submission.history?.length || 0;
                      
                      return (
                        <motion.div
                          key={submission.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
                        >
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${catInfo.bgColor} ${catInfo.color}`}>
                                    {catInfo.label}
                                  </span>
                                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                    submission.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                    submission.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                    submission.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {submission.status || 'SUBMITTED'}
                                  </span>
                                  {canResubmit && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                      <RefreshCw className="w-3 h-3" />
                                      Editable
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-lg font-semibold text-stone-900 mb-1">{submission.form.title}</h3>
                                <p className="text-sm text-stone-600">
                                  Submitted on {new Date(submission.created).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                  {historyCount > 0 && (
                                    <span className="ml-2 text-stone-400">• {historyCount + 1} submission{historyCount > 0 ? 's' : ''}</span>
                                  )}
                                </p>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                {historyCount > 0 && (
                                  <button
                                    onClick={() => {
                                      setSelectedForm({
                                        ...submission.form,
                                        fields: submission.form.fields as SignupFormField[],
                                      });
                                      setShowHistoryModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-2 text-sm border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors"
                                  >
                                    <History className="w-4 h-4" />
                                    History
                                  </button>
                                )}
                                {canResubmit && (
                                  <button
                                    onClick={() => openFormModal(
                                      {
                                        ...submission.form,
                                        fields: submission.form.fields as SignupFormField[],
                                      },
                                      true,
                                      submission.responses
                                    )}
                                    className="flex items-center gap-1 px-3 py-2 text-sm bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Edit & Resubmit
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Deadline info if still active */}
                            {submission.form.deadline && new Date(submission.form.deadline) > new Date() && (
                              <div className="mt-4 pt-4 border-t border-stone-100">
                                <div className="flex items-center gap-1.5 text-sm text-stone-500">
                                  <Clock className="w-4 h-4" />
                                  <span>Form deadline: {formatDeadline(submission.form.deadline)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>

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
        </div>
      </div>
    </div>
  );
}
