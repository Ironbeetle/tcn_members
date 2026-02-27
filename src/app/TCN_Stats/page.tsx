'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion } from 'framer-motion';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
} from 'recharts';
import { getDetailedMemberStats } from '@/lib/actions';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  ArrowLeft,
  Home,
  ClipboardList,
  User,
  Menu,
  ChevronRight,
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';

// Navigation items for bottom nav and sidebar
const navItems = [
  { title: 'Home', icon: Home, link: '/TCN_Home' },
  { title: 'Bulletin', icon: ClipboardList, link: '/TCN_BulletinBoard' },
  { title: 'Directory', icon: Briefcase, link: '/TCN_BandOffice' },
  { title: 'Account', icon: User, link: '/Member_Account' },
];

// Chart colors matching app theme (amber/stone)
const RESERVE_COLORS = ['#059669', '#3b82f6', '#9ca3af']; // emerald, blue, gray

export default function TCN_Stats() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Fetch detailed stats
  const {
    data: detailedStats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['detailedMemberStats'],
    queryFn: async () => {
      const result = await getDetailedMemberStats();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch stats');
      }
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen genbkg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/TCN_Enter");
    return null;
  }

  // ========== MOBILE BOTTOM NAVIGATION ==========
  const MobileBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className="flex flex-col items-center justify-center flex-1 h-full py-2 text-stone-500 hover:text-amber-600"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-medium">{item.title}</span>
          </Link>
        ))}
        <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full py-2 text-stone-500 hover:text-amber-600">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
            <SheetHeader className="text-left pb-4 border-b border-stone-100">
              <SheetTitle className="text-lg font-bold text-stone-800">Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-2 overflow-y-auto">
              <Link
                href="/TCN_Home"
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                    <Home className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="font-medium text-stone-800">Home</div>
                    <div className="text-xs text-stone-500">Return to main portal</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-stone-200 rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-stone-800">{label || payload[0]?.name}</p>
          <p className="text-sm text-amber-700">
            {payload[0]?.value} members ({payload[0]?.payload?.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // ========== CHART COMPONENTS ==========
  const ReserveStatusChart = () => {
    if (!detailedStats?.reserveStatus || detailedStats.reserveStatus.length === 0) {
      return (
        <div className="text-center py-8 text-stone-500">
          No reserve status data available
        </div>
      );
    }

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={detailedStats.reserveStatus}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              label={({ name, payload }: any) => `${name}: ${payload?.percentage}%`}
              labelLine={false}
            >
              {detailedStats.reserveStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={RESERVE_COLORS[index % RESERVE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const CommunityChart = () => {
    if (!detailedStats?.communities || detailedStats.communities.length === 0) {
      return (
        <div className="text-center py-8 text-stone-500">
          No community data available
        </div>
      );
    }

    return (
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={detailedStats.communities}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" opacity={0.5} />
            <XAxis type="number" stroke="#78716c" fontSize={12} />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#78716c" 
              fontSize={11}
              width={75}
              tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#d97706"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const AgeGroupsChart = () => {
    if (!detailedStats?.ageGroups || detailedStats.ageGroups.length === 0) {
      return (
        <div className="text-center py-8 text-stone-500">
          No age data available
        </div>
      );
    }

    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={detailedStats.ageGroups} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" opacity={0.5} />
            <XAxis dataKey="ageRange" stroke="#78716c" fontSize={12} />
            <YAxis stroke="#78716c" fontSize={12} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white border border-stone-200 rounded-lg shadow-lg p-3">
                      <p className="text-sm font-medium text-stone-800">Age {payload[0]?.payload?.ageRange}</p>
                      <p className="text-sm text-amber-700">
                        {payload[0]?.value} members ({payload[0]?.payload?.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <defs>
              <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#b45309" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <Bar 
              dataKey="count" 
              fill="url(#ageGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // ========== LOADING SKELETON ==========
  const ChartSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-64 bg-stone-200 rounded-xl"></div>
    </div>
  );

  // ========== MAIN RENDER ==========
  return (
    <div className="w-full min-h-screen genbkg">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      {/* Main Content Area */}
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* Back Button & Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Member Statistics</h1>
                  <p className="text-amber-100 text-sm mt-1">
                    Demographics for activated TCN members
                  </p>
                </div>
              </div>
              {detailedStats && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-200" />
                    <span className="text-amber-100 text-sm">
                      {detailedStats.totalActivated.toLocaleString()} activated members
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="space-y-6">
            
            {/* Reserve Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
            >
              <div className="p-4 border-b border-stone-100 bg-gradient-to-r from-emerald-50 to-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Reserve Status</h2>
                    <p className="text-xs text-stone-500">On-reserve vs Off-reserve members</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {isLoading ? <ChartSkeleton /> : isError ? (
                  <div className="text-center py-8 text-stone-500">Error loading data</div>
                ) : (
                  <>
                    <ReserveStatusChart />
                    {/* Legend */}
                    <div className="mt-4 flex flex-wrap justify-center gap-4">
                      {detailedStats?.reserveStatus.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: RESERVE_COLORS[index % RESERVE_COLORS.length] }}
                          />
                          <span className="text-sm text-stone-600">
                            {item.name}: {item.value.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Communities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
            >
              <div className="p-4 border-b border-stone-100 bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Communities</h2>
                    <p className="text-xs text-stone-500">Member distribution by community</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {isLoading ? <ChartSkeleton /> : isError ? (
                  <div className="text-center py-8 text-stone-500">Error loading data</div>
                ) : (
                  <CommunityChart />
                )}
              </div>
            </motion.div>

            {/* Age Groups */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
            >
              <div className="p-4 border-b border-stone-100 bg-gradient-to-r from-orange-50 to-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800">Age Groups</h2>
                    <p className="text-xs text-stone-500">Member distribution by age range</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                {isLoading ? <ChartSkeleton /> : isError ? (
                  <div className="text-center py-8 text-stone-500">Error loading data</div>
                ) : (
                  <>
                    <AgeGroupsChart />
                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {detailedStats?.ageGroups.slice(0, 4).map((group) => (
                        <div key={group.ageRange} className="bg-amber-50 rounded-lg p-2 text-center">
                          <div className="text-lg font-bold text-amber-700">{group.count}</div>
                          <div className="text-xs text-stone-500">{group.ageRange}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
