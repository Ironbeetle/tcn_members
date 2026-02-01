'use client'
import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobilePageHeader } from '@/components/MobileNav';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { uploadProfileImage, deleteProfileImage, getFnmemberById } from '@/lib/actions';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Edit,
  Save,
  X,
  ArrowLeft,
  Upload,
  Camera,
  Trash2,
  Download,
  FileText,
  Fingerprint
} from 'lucide-react';
import { FingerprintSettings } from '@/components/FingerprintSettings';


const contactUpdateSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone_number: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(5, 'Address is required'),
});

type ContactUpdateData = z.infer<typeof contactUpdateSchema>;

type MemberData = {
  firstName: string;
  lastName: string;
  tNumber: string;
  birthdate: string;
  profile: {
    email: string;
    phone_number: string;
    address: string;
    province: string;
    community: string;
    o_r_status: string;
    gender: string | null;
    image_url: string | null;
  } | null;
  barcode: {
    barcode: string;
  } | null;
};

export default function MemberAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactUpdateData>({
    resolver: zodResolver(contactUpdateSchema)
  });

  // TanStack Query for fetching member data
  const {
    data: memberData,
    isLoading: loading,
    error: queryError,
  } = useQuery<MemberData | null>({
    queryKey: ['memberData', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const result = await getFnmemberById(session.user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load account data');
      }
      
      // profile and barcode are arrays in the schema, get first item
      const profileData = Array.isArray(result.data.profile) 
        ? result.data.profile[0] 
        : result.data.profile;
      const barcodeData = Array.isArray(result.data.barcode) 
        ? result.data.barcode[0] 
        : result.data.barcode;
      
      return {
        firstName: result.data.first_name,
        lastName: result.data.last_name,
        tNumber: result.data.t_number,
        birthdate: result.data.birthdate,
        profile: profileData || null,
        barcode: barcodeData || null,
      } as MemberData;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Reset form when member data loads
  useEffect(() => {
    if (memberData?.profile) {
      reset({
        email: memberData.profile.email,
        phone_number: memberData.profile.phone_number,
        address: memberData.profile.address,
      });
    }
  }, [memberData, reset]);

  // Contact update mutation
  const contactUpdateMutation = useMutation({
    mutationFn: async (data: ContactUpdateData) => {
      const response = await fetch('/api/member/update-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: session?.user?.id,
          ...data
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update contact information');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Contact information updated successfully');
      setIsEditing(false);
      // Invalidate and refetch member data
      queryClient.invalidateQueries({ queryKey: ['memberData', session?.user?.id] });
    },
    onError: (error: Error) => {
      console.error('Error updating contact info:', error);
      toast.error(error.message || 'An error occurred while updating');
    }
  });

  const onSubmit = useCallback(async (data: ContactUpdateData) => {
    contactUpdateMutation.mutate(data);
  }, [contactUpdateMutation]);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!session?.user?.id) throw new Error('No session');
      return uploadProfileImage(session.user.id, formData);
    },
    onSuccess: (result) => {
      if (result.success && result.data) {
        toast.success('Profile image updated successfully');
        setImagePreview(null);
        // Invalidate and refetch member data
        queryClient.invalidateQueries({ queryKey: ['memberData', session?.user?.id] });
      } else {
        toast.error(result.error || 'Failed to upload image');
        setImagePreview(null);
      }
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('An error occurred while uploading the image');
      setImagePreview(null);
    }
  });

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    const formData = new FormData();
    formData.append('image', file);
    uploadMutation.mutate(formData);
  }, [uploadMutation]);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('No session');
      return deleteProfileImage(session.user.id);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Profile image deleted successfully');
        // Invalidate and refetch member data
        queryClient.invalidateQueries({ queryKey: ['memberData', session?.user?.id] });
      } else {
        toast.error(result.error || 'Failed to delete image');
      }
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('An error occurred while deleting the image');
    }
  });

  const handleDeleteImage = useCallback(() => {
    if (!confirm('Are you sure you want to delete your profile image?')) {
      return;
    }
    deleteMutation.mutate();
  }, [deleteMutation]);



  if (status === "loading" || loading) {
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

  if (!memberData) {
    return (
      <div className="w-full min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-600">Failed to load account data</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-stone-100">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-4">
            <MobilePageHeader 
              title="My Account"
              subtitle="View & manage your info"
              icon={<User className="w-5 h-5" />}
            />
          </div>

          {/* Desktop Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block mb-4"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </motion.div>

          {/* Desktop Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white mb-6"
          >
            <div className="flex items-center gap-4">
              <User className="w-8 h-8" />
              <h1 className="text-2xl font-bold">My Account</h1>
            </div>
            <p className="text-amber-50 mt-2">View and manage your account information</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Left Column - Account Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Image Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
              >
                <h2 className="text-xl font-bold text-stone-800 mb-4">Photo ID</h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Image Display */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-amber-200 bg-stone-100">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : memberData.profile?.image_url ? (
                        <img
                          src={memberData.profile.image_url}
                          alt={`${memberData.firstName} ${memberData.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200">
                          <User className="w-16 h-16 text-amber-700" />
                        </div>
                      )}
                    </div>
                    {(uploadMutation.isPending || deleteMutation.isPending) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors cursor-pointer disabled:opacity-50">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {memberData.profile?.image_url ? 'Change Photo' : 'Upload Photo'}
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploadMutation.isPending || deleteMutation.isPending}
                          className="hidden"
                        />
                      </label>
                      
                      {memberData.profile?.image_url && !imagePreview && (
                        <button
                          onClick={handleDeleteImage}
                          disabled={uploadMutation.isPending || deleteMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Remove</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">
                      Recommended: Square image, at least 300x300px. Max size: 5MB. 
                      Formats: JPEG, PNG, WebP
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Personal Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
              >
                <h2 className="text-xl font-bold text-stone-800 mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-amber-700 mt-1" />
                    <div>
                      <p className="text-sm text-stone-500">Full Name</p>
                      <p className="font-semibold text-stone-800">{memberData.firstName} {memberData.lastName}</p>
                    </div>
                  </div>
                 
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-amber-700 mt-1" />
                    <div>
                      <p className="text-sm text-stone-500">Date of Birth</p>
                      <p className="font-semibold text-stone-800">
                        {(() => {
                          const dateStr = memberData.birthdate;
                          // Handle ISO string from Prisma - use UTC values to avoid timezone shift
                          const date = new Date(dateStr);
                          return date.toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            timeZone: 'UTC'
                          });
                        })()}
                      </p>
                    </div>
                  </div>
                  {memberData.profile?.gender && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-amber-700 mt-1" />
                      <div>
                        <p className="text-sm text-stone-500">Gender</p>
                        <p className="font-semibold text-stone-800">{memberData.profile.gender}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-amber-700 mt-1" />
                    <div>
                      <p className="text-sm text-stone-500">Status</p>
                      <p className="font-semibold text-stone-800">{memberData.profile?.o_r_status || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-stone-800">Contact Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span className="text-sm font-medium">Cancel</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-amber-700 mt-1" />
                      <div>
                        <p className="text-sm text-stone-500">Email</p>
                        <p className="font-semibold text-stone-800">{memberData.profile?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-amber-700 mt-1" />
                      <div>
                        <p className="text-sm text-stone-500">Phone Number</p>
                        <p className="font-semibold text-stone-800">{memberData.profile?.phone_number || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-700 mt-1" />
                      <div>
                        <p className="text-sm text-stone-500">Address</p>
                        <p className="font-semibold text-stone-800">
                          {memberData.profile?.address || 'N/A'}{memberData.profile?.community ? `, ${memberData.profile.community}` : ''}{memberData.profile?.province ? `, ${memberData.profile.province}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-5 h-5 text-stone-400" />
                        <input
                          {...register('email')}
                          type="email"
                          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-stone-400" />
                        <input
                          {...register('phone_number')}
                          type="tel"
                          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      {errors.phone_number && (
                        <p className="text-sm text-red-600 mt-1">{errors.phone_number.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1">Address</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-stone-400" />
                        <input
                          {...register('address')}
                          type="text"
                          className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      {errors.address && (
                        <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Fingerprint Sign-in Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                <FingerprintSettings />
              </motion.div>
            </div>

            {/* Right Column - Barcode */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sticky top-24"
              >
                <h2 className="text-xl font-bold text-stone-800 mb-4">Member Barcode</h2>
                
                {memberData.barcode ? (
                  <div className="space-y-4">
                    {/* Barcode Image */}
                    <div className="bg-white rounded-xl border-2 border-amber-200 overflow-hidden">
                      <img
                        src={`/api/barcode/image?barcode=${memberData.barcode.barcode}`}
                        className="w-full h-auto object-contain"
                        alt={`Barcode ${memberData.barcode.barcode}`}
                      />
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-amber-800 mb-1">Barcode Number</p>
                      <p className="text-lg font-bold text-amber-900 tracking-wider">{memberData.barcode.barcode}</p>
                    </div>

                    {/* Download Button */}
                    <a
                      href={`/api/barcode/download?barcode=${memberData.barcode.barcode}`}
                      download={`TCN-Barcode-${memberData.barcode.barcode}.jpg`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-medium">Download Barcode Image</span>
                    </a>

                    <p className="text-xs text-stone-500 text-center">
                      Show this barcode at community events and services
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-600 text-sm">No barcode assigned</p>
                    <p className="text-xs text-stone-500 mt-2">Contact administration for barcode assignment</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
