'use client'
import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobilePageHeader } from '@/components/MobileNav';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getFnmemberWithAuth } from '@/lib/actions';
import { 
  User, 
  Mail, 
  MapPin,
  Save,
  ArrowLeft,
  Settings,
  Home
} from 'lucide-react';

// Schema for address update
const addressUpdateSchema = z.object({
  address: z.string().min(5, 'Address is required'),
  community: z.string().min(1, 'Community is required'),
  province: z.string().min(2, 'Province is required'),
  o_r_status: z.enum(['ON_RESERVE', 'OFF_RESERVE'], {
    message: 'Please select your residence status',
  }),
});

// Schema for account settings update
const accountUpdateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

type AddressUpdateData = z.infer<typeof addressUpdateSchema>;
type AccountUpdateData = z.infer<typeof accountUpdateSchema>;

type MemberData = {
  firstName: string;
  lastName: string;
  profile: {
    address: string;
    province: string;
    community: string;
    o_r_status: string;
  } | null;
  auth: {
    username: string;
    email: string;
  } | null;
};

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
];

const RESIDENCE_STATUS = [
  { value: 'ON_RESERVE', label: 'On Reserve' },
  { value: 'OFF_RESERVE', label: 'Off Reserve' },
];

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="w-full min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function EditProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <EditProfileContent />
    </Suspense>
  );
}

function EditProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  // Get section from URL query param
  const initialSection = searchParams.get('section') || 'address';
  const [activeSection, setActiveSection] = useState<'address' | 'account'>(
    initialSection === 'account' ? 'account' : 'address'
  );

  // Address form
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    reset: resetAddress,
    formState: { errors: addressErrors, isSubmitting: isSubmittingAddress }
  } = useForm<AddressUpdateData>({
    resolver: zodResolver(addressUpdateSchema)
  });

  // Account form
  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    reset: resetAccount,
    formState: { errors: accountErrors, isSubmitting: isSubmittingAccount }
  } = useForm<AccountUpdateData>({
    resolver: zodResolver(accountUpdateSchema)
  });

  // Fetch member data including auth
  const {
    data: memberData,
    isLoading: loading,
  } = useQuery<MemberData | null>({
    queryKey: ['memberDataWithAuth', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const result = await getFnmemberWithAuth(session.user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load account data');
      }
      
      const profileData = Array.isArray(result.data.profile) 
        ? result.data.profile[0] 
        : result.data.profile;
      
      return {
        firstName: result.data.first_name,
        lastName: result.data.last_name,
        profile: profileData || null,
        auth: result.data.auth || null,
      } as MemberData;
    },
    enabled: status === 'authenticated' && !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Reset forms when member data loads
  useEffect(() => {
    if (memberData?.profile) {
      resetAddress({
        address: memberData.profile.address,
        community: memberData.profile.community,
        province: memberData.profile.province,
        o_r_status: memberData.profile.o_r_status as 'ON_RESERVE' | 'OFF_RESERVE',
      });
    }
    if (memberData?.auth) {
      resetAccount({
        username: memberData.auth.username,
        email: memberData.auth.email,
      });
    }
  }, [memberData, resetAddress, resetAccount]);

  // Address update mutation
  const addressMutation = useMutation({
    mutationFn: async (data: AddressUpdateData) => {
      const response = await fetch('/api/member/update-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: session?.user?.id,
          ...data
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update address');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Address updated successfully');
      queryClient.invalidateQueries({ queryKey: ['memberData', session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['memberDataWithAuth', session?.user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An error occurred while updating');
    }
  });

  // Account update mutation
  const accountMutation = useMutation({
    mutationFn: async (data: AccountUpdateData) => {
      const response = await fetch('/api/member/update-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: session?.user?.id,
          ...data
        })
      });
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to update account settings');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Account settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['memberDataWithAuth', session?.user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'An error occurred while updating');
    }
  });

  const onSubmitAddress = (data: AddressUpdateData) => {
    addressMutation.mutate(data);
  };

  const onSubmitAccount = (data: AccountUpdateData) => {
    accountMutation.mutate(data);
  };

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
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-4">
            <MobilePageHeader 
              title="Edit Profile"
              subtitle="Update your information"
              icon={<Settings className="w-5 h-5" />}
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
              onClick={() => router.push('/Member_Account')}
              className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Account</span>
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
              <Settings className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Edit Profile</h1>
            </div>
            <p className="text-amber-50 mt-2">Update your address or account settings</p>
          </motion.div>

          {/* Section Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-stone-200 p-2 mb-6"
          >
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSection('address')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  activeSection === 'address'
                    ? 'bg-amber-700 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Address</span>
              </button>
              <button
                onClick={() => setActiveSection('account')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
                  activeSection === 'account'
                    ? 'bg-amber-700 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Account</span>
              </button>
            </div>
          </motion.div>

          {/* Address Section */}
          {activeSection === 'address' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Update Address</h2>
                  <p className="text-sm text-stone-500">Moving to a new place? Update your location details here.</p>
                </div>
              </div>

              <form onSubmit={handleSubmitAddress(onSubmitAddress)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Street Address</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-stone-400" />
                    <input
                      {...registerAddress('address')}
                      type="text"
                      placeholder="Enter your street address"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  {addressErrors.address && (
                    <p className="text-sm text-red-600 mt-1">{addressErrors.address.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Community/City</label>
                  <input
                    {...registerAddress('community')}
                    type="text"
                    placeholder="Enter your community or city"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  {addressErrors.community && (
                    <p className="text-sm text-red-600 mt-1">{addressErrors.community.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Province/Territory</label>
                  <select
                    {...registerAddress('province')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select province/territory</option>
                    {PROVINCES.map((prov) => (
                      <option key={prov.value} value={prov.value}>
                        {prov.label}
                      </option>
                    ))}
                  </select>
                  {addressErrors.province && (
                    <p className="text-sm text-red-600 mt-1">{addressErrors.province.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Residence Status</label>
                  <select
                    {...registerAddress('o_r_status')}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select residence status</option>
                    {RESIDENCE_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                  {addressErrors.o_r_status && (
                    <p className="text-sm text-red-600 mt-1">{addressErrors.o_r_status.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAddress || addressMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAddress || addressMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Address</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <User className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">Account Settings</h2>
                  <p className="text-sm text-stone-500">Update your login credentials</p>
                </div>
              </div>

              <form onSubmit={handleSubmitAccount(onSubmitAccount)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-stone-400" />
                    <input
                      {...registerAccount('username')}
                      type="text"
                      placeholder="Enter your username"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  {accountErrors.username && (
                    <p className="text-sm text-red-600 mt-1">{accountErrors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Login Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-stone-400" />
                    <input
                      {...registerAccount('email')}
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  {accountErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{accountErrors.email.message}</p>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> Changing your email will update your login credentials. You&apos;ll use the new email to sign in.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAccount || accountMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAccount || accountMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Account Settings</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Mobile Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:hidden mt-6"
          >
            <button
              onClick={() => router.push('/Member_Account')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Account</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
