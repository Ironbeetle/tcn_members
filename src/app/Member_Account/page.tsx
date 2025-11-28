'use client'
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Hamburger } from '@/components/Hamburger';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Edit,
  Save,
  X,
  ArrowLeft
} from 'lucide-react';
import Image from 'next/image';

const menuItems = [
  { label: "About Tataskweyak", to: "/pages/AboutTCN", color: "stone" as const },
  { label: "About Who We Are", to: "/pages/WorldViewHome", color: "stone" as const },
  { label: "Photo Gallery", to: "/pages/PhotoGallery", color: "stone" as const },
  { label: "Home", to: "/", color: "stone" as const },
];

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
    community: string;
    o_r_status: string;
    gender: string | null;
  } | null;
  barcode: {
    barcode: string;
  } | null;
};

export default function MemberAccount() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactUpdateData>({
    resolver: zodResolver(contactUpdateSchema)
  });

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchMemberData() {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/member/${session.user.id}`, {
          signal: abortController.signal
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const result = await response.json();

        if (result.success && !abortController.signal.aborted) {
          setMemberData(result.data);
          if (result.data.profile) {
            reset({
              email: result.data.profile.email,
              phone_number: result.data.profile.phone_number,
              address: result.data.profile.address,
            });
          }
        } else if (!abortController.signal.aborted) {
          toast.error('Failed to load account data');
        }
      } catch (error: any) {
        if (error.name !== 'AbortError' && !abortController.signal.aborted) {
          console.error('Error fetching member data:', error);
          toast.error('An error occurred while loading your account');
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchMemberData();
    }

    return () => {
      abortController.abort();
    };
  }, [session?.user?.id, status, reset]);

  const onSubmit = useCallback(async (data: ContactUpdateData) => {
    try {
      const response = await fetch('/api/member/update-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: session?.user?.id,
          ...data
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Contact information updated successfully');
        setIsEditing(false);
        // Refresh member data
        if (memberData && memberData.profile) {
          setMemberData({
            ...memberData,
            profile: {
              ...memberData.profile,
              ...data
            }
          });
        }
      } else {
        toast.error(result.error || 'Failed to update contact information');
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('An error occurred while updating');
    }
  }, [session?.user?.id, memberData]);



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
        <div className="lg:hidden">
          <Hamburger menuItems={menuItems} showBackButton={false} />
        </div>
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      <div className="pt-16 lg:pt-16">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white mb-6"
          >
            <div className="flex items-center gap-4">
              <User className="w-8 h-8" />
              <h1 className="text-2xl font-bold">My Account</h1>
            </div>
            <p className="text-amber-50 mt-2">View and manage your account information</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Column - Account Info */}
            <div className="lg:col-span-3 space-y-6">
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
                    <CreditCard className="w-5 h-5 text-amber-700 mt-1" />
                    <div>
                      <p className="text-sm text-stone-500">Treaty Number</p>
                      <p className="font-semibold text-stone-800">{memberData.tNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-amber-700 mt-1" />
                    <div>
                      <p className="text-sm text-stone-500">Date of Birth</p>
                      <p className="font-semibold text-stone-800">
                        {new Date(memberData.birthdate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
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
                    <MapPin className="w-5 h-5 text-amber-700 mt-1" />
                    <div>
                      <p className="text-sm text-stone-500">Community</p>
                      <p className="font-semibold text-stone-800">{memberData.profile?.community || 'N/A'}</p>
                    </div>
                  </div>
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
                        <p className="font-semibold text-stone-800">{memberData.profile?.address || 'N/A'}</p>
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
                    <div className="bg-white rounded-xl border-2 border-amber-200 p-1">
                      <div className="relative w-full aspect-[4/3] bg-white rounded-lg overflow-hidden">
                        <Image
                          src={`/api/barcode/image?barcode=${memberData.barcode.barcode}`}
                          alt={`Barcode ${memberData.barcode.barcode}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
                      <p className="text-xs text-amber-800 mb-1">Barcode Number</p>
                      <p className="text-lg font-bold text-amber-900 tracking-wider">{memberData.barcode.barcode}</p>
                    </div>

                    <p className="text-xs text-stone-500 text-center">
                      Show this barcode at community events and services
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <p className="text-stone-600 text-sm">No barcode assigned</p>
                    <p className="text-xs text-stone-500 mt-2">Contact administration for barcode assignment</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
