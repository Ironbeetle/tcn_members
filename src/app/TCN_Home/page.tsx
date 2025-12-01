'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { Hamburger } from '@/components/Hamburger';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getMembershipStats } from '@/lib/actions';
import { 
  Megaphone, 
  Building2, 
  Briefcase, 
  Users, 
  Heart, 
  GraduationCap, 
  Wrench, 
  TrendingUp,
  ArrowLeft
} from 'lucide-react';

const departments = [
  {
    title: 'Town Hall',
    description: 'Community meetings, events, and important announcements',
    icon: Building2,
    link: '/TCN_TownHall',
  },
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

const menuItems = [
  { label: "About Tataskweyak", to: "/pages/AboutTCN", color: "stone" as const },
  { label: "About Who We Are", to: "/pages/WorldViewHome", color: "stone" as const },
  { label: "Photo Gallery", to: "/pages/PhotoGallery", color: "stone" as const },
  { label: "Home", to: "/", color: "stone" as const },
];

// Pie chart colors
const CHART_COLORS = ['#059669', '#f59e0b', '#9ca3af']; // green for activated, amber for pending, gray for none

export default function TCNHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [memberStats, setMemberStats] = useState<{
    totalMembers: number;
    activatedMembers: number;
    pendingMembers: number;
    noneMembers: number;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch membership stats
  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await getMembershipStats();
        if (result.success && result.data) {
          setMemberStats(result.data);
        }
      } catch (error) {
        console.error('Error fetching membership stats:', error);
      } finally {
        setLoadingStats(false);
      }
    }

    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

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

  return (
    <div className="w-full min-h-screen genbkg">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-100 w-full shadow-md">
        <div className="lg:hidden">
          <Hamburger menuItems={menuItems} showBackButton={false} />
        </div>
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      <div className="pt-16 lg:pt-16">
        {/* 3-Column Social Media Style Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR - User Profile Card */}
            <aside className="lg:col-span-3 space-y-4">
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
                  {departments.map((dept, index) => (
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

            {/* MAIN CONTENT - Feed/Posts Area */}
            <main className="lg:col-span-6 space-y-4">
              {/* Welcome Banner Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Megaphone className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Tansi, {session?.user?.firstName}!</h2>
                </div>
                <p className="text-amber-50">Welcome to (Cree Name for this Service).</p>
              </motion.div>

              {/* Bulletin Board Quick Access */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Link href="/TCN_BulletinBoard">
                  <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                    <div className="relative h-48 bg-gradient-to-br from-amber-100 to-amber-200 overflow-hidden">
                      <img src="/TCNintro.jpg" alt="Bulletin Board" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white text-xl font-bold mb-1">Community Bulletin Board</h3>
                        <p className="text-amber-100 text-sm">5 new announcements today</p>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-stone-600 font-medium">View all posts</span>
                      <span className="text-amber-700 font-bold">→</span>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Community Healing Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Heart className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Community Healing</h2>
                </div>
                <p className="text-green-50 mb-4">Supporting wellness, mental health, and traditional healing practices in our community.</p>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-green-100">Coming soon: Resources, support services, and healing circle information</p>
                </div>
              </motion.div>

              {/* Traditional Learning Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <GraduationCap className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Traditional Learning</h2>
                </div>
                <p className="text-amber-50 mb-4">Preserving and sharing our language, culture, and traditional knowledge with future generations.</p>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-amber-100">Coming soon: Language lessons, cultural workshops, and elder teachings</p>
                </div>
              </motion.div>

              {/* Social Issues Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Users className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Social Issues & Support</h2>
                </div>
                <p className="text-blue-50 mb-4">Addressing community concerns and providing support services for members in need.</p>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-blue-100">Coming soon: Support programs, advocacy resources, and community initiatives</p>
                </div>
              </motion.div>

              {/* Youth Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <TrendingUp className="w-8 h-8" />
                  <h2 className="text-2xl font-bold">Youth Programs</h2>
                </div>
                <p className="text-purple-50 mb-4">Empowering our youth through education, activities, and mentorship opportunities.</p>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-purple-100">Coming soon: Youth events, sports programs, skill-building workshops, and leadership development</p>
                </div>
              </motion.div>
            </main>

            {/* RIGHT SIDEBAR - Quick Links & Stats */}
            <aside className="lg:col-span-3 space-y-4">
              {/* Stats Card with Pie Chart */}
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
                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </div>
      </div>
    </div>
  );
}