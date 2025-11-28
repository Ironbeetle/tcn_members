'use client'
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { motion } from 'framer-motion';
import { queryBulletins } from '@/lib/actions';
import { 
  Megaphone, 
  Users, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Bell,
  Filter,
  Pin,
  ArrowLeft
} from 'lucide-react';

// Categories from schema enum
const categories = [
  {
    value: 'ALL',
    label: 'All Posts',
    icon: Megaphone,
    color: 'amber'
  },
  {
    value: 'CHIEFNCOUNCIL',
    label: 'Chief & Council',
    icon: Users,
    color: 'blue'
  },
  {
    value: 'HEALTH',
    label: 'Health',
    icon: Heart,
    color: 'green'
  },
  {
    value: 'EDUCATION',
    label: 'Education',
    icon: GraduationCap,
    color: 'purple'
  },
  {
    value: 'RECREATION',
    label: 'Recreation',
    icon: Calendar,
    color: 'orange'
  },
  {
    value: 'EMPLOYMENT',
    label: 'Employment',
    icon: Briefcase,
    color: 'teal'
  },
  {
    value: 'PROGRAM_EVENTS',
    label: 'Program & Events',
    icon: Calendar,
    color: 'pink'
  },
  {
    value: 'ANNOUNCEMENTS',
    label: 'Announcements',
    icon: Bell,
    color: 'red'
  }
];

type Bulletin = {
  id: string;
  title: string;
  subject: string;
  poster_url: string;
  category: string;
  created: Date;
  updated: Date;
};

export default function page() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [bulletins, setBulletins] = useState<Bulletin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Fetch bulletins from database
  useEffect(() => {
    let isMounted = true;

    async function fetchBulletins() {
      try {
        setLoading(true);
        const params = selectedCategory === 'ALL' 
          ? { page: 1, limit: 100, sortBy: 'created' as const, sortOrder: 'desc' as const }
          : { page: 1, category: selectedCategory as any, limit: 100, sortBy: 'created' as const, sortOrder: 'desc' as const };
        
        const result = await queryBulletins(params);
        
        if (isMounted) {
          if (result.success && result.data) {
            setBulletins(result.data.bulletins);
            setError(null);
          } else {
            setError(result.error || 'Failed to load bulletins');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('An error occurred while loading bulletins');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (status === 'authenticated') {
      fetchBulletins();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, status]);

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

  // Since we're fetching from DB, bulletins are already filtered by category
  // For now, we'll treat the first 2 as pinned (you can add a pinned field to schema later)
  const pinnedPosts = useMemo(() => bulletins.slice(0, 2), [bulletins]);
  const regularPosts = useMemo(() => bulletins.slice(2), [bulletins]);

  return (
    <div className="w-full min-h-screen bg-stone-100">
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
            <aside className="lg:col-span-3 space-y-4 overscroll-y-none">
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
                      <div className="flex items-center gap-3">
                        <cat.icon className={`w-5 h-5 ${
                          selectedCategory === cat.value ? 'text-amber-700' : 'text-stone-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          selectedCategory === cat.value ? 'text-amber-900' : 'text-stone-700'
                        }`}>
                          {cat.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </aside>

            {/* MAIN CONTENT - Bulletin Posts Feed */}
            <main className="lg:col-span-6 space-y-4 overscroll-y-auto">
              {/* Page Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <Megaphone className="w-8 h-8" />
                    <h1 className="text-2xl font-bold">Community Bulletin Board</h1>
                  </div>
                </div>
                <p className="text-amber-50">Stay informed with the latest announcements, events, and updates from Tataskweyak Cree Nation</p>
              </motion.div>

              {/* Pinned Posts */}
              {pinnedPosts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-stone-600 px-2 flex items-center gap-2">
                    <Pin className="w-4 h-4" />
                    Pinned Posts
                  </h3>
                  {pinnedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border-2 border-amber-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${categories.find(c => c.value === post.category)?.color || 'amber'}-500`}></div>
                            <span className="text-xs font-semibold text-stone-500 uppercase">
                              {categories.find(c => c.value === post.category)?.label}
                            </span>
                          </div>
                          <Pin className="w-4 h-4 text-amber-700" />
                        </div>
                        <h3 className="font-bold text-lg text-stone-800 mb-2">{post.title}</h3>
                        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{post.subject}</p>
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>{post.created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <button className="text-amber-700 font-medium hover:text-amber-800">Read More →</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Regular Posts */}
              {regularPosts.length > 0 && (
                <div className="space-y-3">
                  {pinnedPosts.length > 0 && (
                    <h3 className="text-sm font-bold text-stone-600 px-2 mt-6">Recent Posts</h3>
                  )}
                  {regularPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-amber-300 transition-all"
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-2 h-2 rounded-full bg-${categories.find(c => c.value === post.category)?.color || 'amber'}-500`}></div>
                          <span className="text-xs font-semibold text-stone-500 uppercase">
                            {categories.find(c => c.value === post.category)?.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-stone-800 mb-2">{post.title}</h3>
                        <p className="text-sm text-stone-600 mb-3 line-clamp-2">{post.subject}</p>
                        <div className="flex items-center justify-between text-xs text-stone-500">
                          <span>{post.created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <button className="text-amber-700 font-medium hover:text-amber-800">Read More →</button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!loading && bulletins.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                  <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600">No posts in this category yet.</p>
                </div>
              )}

              {loading && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-stone-600">Loading posts...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </main>

            {/* RIGHT SIDEBAR - User Info & Quick Actions */}
            <aside className="lg:col-span-3 space-y-4 overscroll-y-none">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-stone-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/TCN_Home" className="block p-3 rounded-lg hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-amber-700" />
                      <span className="text-sm font-medium text-stone-700">Back to Home</span>
                    </div>
                  </Link>
                  <button className="w-full p-3 rounded-lg hover:bg-amber-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-amber-700" />
                      <span className="text-sm font-medium text-stone-700">Notifications</span>
                    </div>
                  </button>
                </div>
              </motion.div>              
            </aside>

          </div>
        </div>
      </div>
    </div>
  );
}