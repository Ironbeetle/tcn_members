'use client'
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getMembershipStats } from '@/lib/actions';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Megaphone, 
  Briefcase, 
  Users, 
  Heart, 
  GraduationCap, 
  TrendingUp,
  ArrowLeft,
  Home,
  ClipboardList,
  User,
  BarChart3,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

// Navigation items for bottom nav and sidebar
const navItems = [
  { title: 'Home', icon: Home, link: '/TCN_Home', active: true },
  { title: 'Bulletin', icon: ClipboardList, link: '/TCN_BulletinBoard' },
  { title: 'Directory', icon: Briefcase, link: '/TCN_BandOffice' },
  { title: 'Account', icon: User, link: '/Member_Account' },
];

const departments = [
  {
    title: 'Community Directory',
    description: 'Administrative services and member support',
    icon: Briefcase,
    link: '/TCN_BandOffice',
  },
  {
    title: 'Local Governance',
    description: 'Leadership updates and governance information',
    icon: Users,
    link: '/TCN_LocalGovernance',
  }
];

// Pie chart colors
const CHART_COLORS = ['#059669', '#f59e0b', '#9ca3af'];

export default function TCNHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // TanStack Query for fetching membership stats
  const {
    data: memberStats,
    isLoading: loadingStats,
  } = useQuery({
    queryKey: ['membershipStats'],
    queryFn: async () => {
      const result = await getMembershipStats();
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch stats');
      }
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Prepare pie chart data
  const pieChartData = memberStats ? [
    { name: 'Activated', value: memberStats.activatedMembers, color: CHART_COLORS[0] },
    { name: 'Pending', value: memberStats.pendingMembers, color: CHART_COLORS[1] },
    { name: 'Not Activated', value: memberStats.noneMembers, color: CHART_COLORS[2] },
  ].filter(item => item.value > 0) : [];

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
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 ${
              item.active 
                ? 'text-amber-700' 
                : 'text-stone-500 hover:text-amber-600'
            }`}
          >
            <item.icon className={`w-5 h-5 ${item.active ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-1 font-medium">{item.title}</span>
          </Link>
        ))}
        {/* More Menu Trigger */}
        <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full py-2 text-stone-500 hover:text-amber-600">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
            <SheetHeader className="text-left pb-4 border-b border-stone-100">
              <SheetTitle className="text-lg font-bold text-stone-800">Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-2 overflow-y-auto">
              {/* Quick Stats Summary (Mobile) */}
              {memberStats && (
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-amber-700" />
                    <span className="font-semibold text-amber-900">Member Stats</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-emerald-600">{memberStats.activatedMembers}</div>
                      <div className="text-[10px] text-stone-500">Active</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-amber-600">{memberStats.pendingMembers}</div>
                      <div className="text-[10px] text-stone-500">Pending</div>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <div className="text-lg font-bold text-amber-800">{memberStats.totalMembers}</div>
                      <div className="text-[10px] text-stone-500">Total</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Department Links */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 mb-2">Community</h4>
                {departments.map((dept) => (
                  <Link
                    key={dept.title}
                    href={dept.link}
                    onClick={() => setMoreMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                        <dept.icon className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">{dept.title}</div>
                        <div className="text-xs text-stone-500">{dept.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );

  // ========== DESKTOP SIDEBAR ==========
  const DesktopSidebar = () => (
    <aside className="hidden lg:block lg:col-span-3 space-y-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden sticky top-24"
      >
        {/* Profile Header with gradient background */}
        <div className="h-20 bg-gradient-to-r from-amber-700 to-amber-900"></div>
        <Link href="/Member_Account" className="block">
          <div className="px-4 pb-4 -mt-10 hover:bg-stone-50 transition-colors rounded-b-2xl cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-3">
              <Users className="w-10 h-10 text-amber-700" />
            </div>
            <h3 className="font-bold text-lg text-stone-800">{session?.user?.firstName} {session?.user?.lastName}</h3>
            <div className="text-xs text-amber-700 font-medium">View Account →</div>
          </div>
        </Link>
      </motion.div>

      {/* Department Links */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
      >
        <h3 className="font-bold text-stone-800 mb-3 text-sm">Tataskweyak</h3>
        <div className="space-y-1">
          {departments.map((dept) => (
            <Link key={dept.title} href={dept.link}>
              <div className="p-2 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                    <dept.icon className="w-4 h-4 text-amber-700" />
                  </div>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-amber-700 transition-colors">{dept.title}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </aside>
  );

  // ========== DESKTOP RIGHT SIDEBAR (Stats) ==========
  // Only render when on desktop to prevent chart dimension errors
  const DesktopRightSidebar = () => {
    // Don't render chart components when not on desktop to avoid negative dimension errors
    if (!isDesktop) return null;
    
    return (
    <aside className="hidden lg:block lg:col-span-3 space-y-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-4 sticky top-24"
      >
        <h3 className="font-bold text-amber-900 mb-3">Member Activation Status</h3>
        
        {loadingStats ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : memberStats ? (
          <>
            {/* Pie Chart */}
            <div className="h-48 w-full min-h-[192px]">
              <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Members']}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats Legend */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                  <span className="text-xs text-stone-600">Activated</span>
                </div>
                <span className="text-sm font-bold text-emerald-700">
                  {memberStats.activatedMembers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-xs text-stone-600">Pending</span>
                </div>
                <span className="text-sm font-bold text-amber-600">
                  {memberStats.pendingMembers.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-stone-400"></div>
                  <span className="text-xs text-stone-600">Not Activated</span>
                </div>
                <span className="text-sm font-bold text-stone-500">
                  {memberStats.noneMembers.toLocaleString()}
                </span>
              </div>
              <div className="border-t border-amber-200 pt-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-800">Total Members</span>
                  <span className="text-lg font-bold text-amber-700">
                    {memberStats.totalMembers.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  {((memberStats.activatedMembers / memberStats.totalMembers) * 100).toFixed(1)}% activated
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 text-stone-500 text-sm">
            Unable to load stats
          </div>
        )}
      </motion.div>
    </aside>
  );
  };

  // ========== CONTENT CARDS (shared between mobile and desktop) ==========
  const contentCards = [
    {
      id: 'bulletin',
      type: 'link',
      link: '/TCN_BulletinBoard',
      content: (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
          <div className="relative h-36 sm:h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
            <img src="/bandofficetab.jpg" alt="Bulletin Board" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <h3 className="text-white text-lg sm:text-xl font-bold mb-1">Community Bulletin Board</h3>
              <span className="text-amber-200 text-sm sm:text-base font-medium">Latest news, events, and announcements</span>
            </div>
          </div>
          <div className="p-3 sm:p-4 flex items-center justify-between">
            <span className="text-stone-600 font-medium text-sm sm:text-base">View all posts</span>
            <span className="text-amber-700 font-bold">→</span>
          </div>
        </div>
      )
    },
    {
      id: 'Community Matters',
      type: 'link',
      link: '/TCN_Matters',
      gradient: 'from-orange-700 to-orange-900',
      icon: Users,
      title: 'Current Issues',
      description: 'Addressing the most urgent issues facing Tataskweyak today.',
      badge: 'Coming soon: Resources, support services, and healing circle information',
      badgeTextColor: 'text-green-100',
      content: (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
          <div className="relative h-36 sm:h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
            <img src="/tcnarialview2.jpg" alt="Bulletin Board" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
              <h3 className="text-white text-lg sm:text-xl font-bold mb-1">Community Matters</h3> 
            </div>
          </div>
          <div className="p-3 sm:p-4 flex items-center justify-between">
            <span className="text-stone-600 font-medium text-sm sm:text-base">View</span>
            <span className="text-amber-700 font-bold">→</span>
          </div>
        </div>
      )
    },
    {
      id: 'healing',
      gradient: 'from-green-700 to-green-900',
      icon: Heart,
      title: 'Community Healing',
      description: 'Supporting wellness, mental health, and traditional healing practices in our community.',
      badge: 'Coming soon: Resources, support services, and healing circle information',
      badgeTextColor: 'text-green-100'
    },
    {
      id: 'learning',
      gradient: 'from-amber-700 to-amber-900',
      icon: GraduationCap,
      title: 'Traditional Learning',
      description: 'Preserving and sharing our language, culture, and traditional knowledge with future generations.',
      badge: 'Coming soon: Language lessons, cultural workshops, and elder teachings',
      badgeTextColor: 'text-amber-100'
    },
    {
      id: 'youth',
      gradient: 'from-purple-700 to-purple-900',
      icon: TrendingUp,
      title: 'Youth Programs',
      description: 'Empowering our youth through education, activities, and mentorship opportunities.',
      badge: 'Coming soon: Youth events, sports programs, skill-building workshops',
      badgeTextColor: 'text-purple-100'
    }
  ];

  // ========== MAIN RENDER ==========
  return (
    <div className="w-full min-h-screen genbkg">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      {/* Main Content Area - with padding for fixed nav and bottom nav on mobile */}
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* Mobile Welcome Header (compact) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden mb-4"
          >
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Tansi, {session?.user?.firstName}!</h2>
                  <p className="text-amber-100 text-xs">Welcome to the Member Portal</p>
                </div>
              </div>
            </div>
          </motion.div>

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

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* Desktop Left Sidebar */}
            <DesktopSidebar />

            {/* MAIN CONTENT - Feed Area */}
            <main className="lg:col-span-6 space-y-4">
              {/* Desktop Welcome Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Megaphone className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Tansi, {session?.user?.firstName}!</h2>
                </div>
                <p className="text-amber-50">Welcome to the TCN Member Portal.</p>
              </motion.div>

              {/* Content Cards */}
              {contentCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {card.type === 'link' && card.link ? (
                    <Link href={card.link}>{card.content}</Link>
                  ) : (
                    <div className={`bg-gradient-to-r ${card.gradient} rounded-2xl shadow-lg p-4 sm:p-6 text-white`}>
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        {card.icon && <card.icon className="w-6 h-6 sm:w-8 sm:h-8" />}
                        <h2 className="text-lg sm:text-2xl font-bold">{card.title}</h2>
                      </div>
                      <p className="text-white/90 mb-3 sm:mb-4 text-sm sm:text-base">{card.description}</p>
                      <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm">
                        <p className={`text-xs sm:text-sm ${card.badgeTextColor}`}>{card.badge}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </main>

            {/* Desktop Right Sidebar */}
            <DesktopRightSidebar />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}