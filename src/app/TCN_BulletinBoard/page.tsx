'use client'
import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobilePageHeader } from '@/components/MobileNav';
import { motion } from 'framer-motion';
import { queryBulletins } from '@/lib/actions';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  ArrowLeft,
  X,
  ImageIcon,
  FileText,
  RefreshCw,
  ChevronDown
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
  content: string | null;
  poster_url: string | null;
  category: string;
  created: Date;
  updated: Date;
};

export default function page() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // TanStack Query for fetching bulletins
  const { 
    data: bulletinsData, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['bulletins', selectedCategory],
    queryFn: async () => {
      const params = selectedCategory === 'ALL' 
        ? { page: 1, limit: 100, sortBy: 'created' as const, sortOrder: 'desc' as const }
        : { page: 1, category: selectedCategory as any, limit: 100, sortBy: 'created' as const, sortOrder: 'desc' as const };
      
      const result = await queryBulletins(params);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load bulletins');
      }
      
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 0, // No client-side cache - server action handles freshness
    refetchOnWindowFocus: true,
  });

  // Extract bulletins from query data
  const bulletins: Bulletin[] = bulletinsData?.bulletins || [];

  // Open modal with selected bulletin
  const openBulletinModal = useCallback((bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  }, []);

  // Close modal
  const closeBulletinModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBulletin(null);
  }, []);

  // Memoized posts - must be before any early returns to follow Rules of Hooks
  const pinnedPosts = useMemo(() => bulletins.slice(0, 2), [bulletins]);
  const regularPosts = useMemo(() => bulletins.slice(2), [bulletins]);

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
      {/* Poster Bulletin Modal */}
      {isModalOpen && selectedBulletin && selectedBulletin.poster_url && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closeBulletinModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                  {categories.find(c => c.value === selectedBulletin.category)?.label}
                </div>
                <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">
                  {new Date(selectedBulletin.created).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <button
                onClick={closeBulletinModal}
                className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Poster Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[calc(90vh-80px)]">
              <div className="relative w-full bg-stone-100 flex items-center justify-center">
                {(() => {
                  const u = selectedBulletin.poster_url || '';
                  const getPosterUrl = (url: string) => {
                    if (!url) return '';
                    let filename = '';
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      try {
                        const urlObj = new URL(url);
                        filename = urlObj.pathname.split('/').pop() || '';
                      } catch {
                        const match = url.match(/\/([^\/]+)$/);
                        filename = match ? match[1] : '';
                      }
                    } else {
                      filename = url.split('/').pop() || '';
                    }
                    return filename ? `/api/poster/${filename}` : '';
                  };
                  const posterSrc = getPosterUrl(u);
                  return (
                    <img
                      src={posterSrc}
                      alt={selectedBulletin.title}
                      className="w-full h-auto object-contain max-h-[60vh] sm:max-h-[70vh]"
                    />
                  );
                })()}
              </div>
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">{selectedBulletin.title}</h2>
                <p className="text-sm sm:text-base text-stone-600 whitespace-pre-wrap">{selectedBulletin.subject}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Text Bulletin Modal */}
      {isModalOpen && selectedBulletin && !selectedBulletin.poster_url && (
        <div 
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeBulletinModal}
        >
          <div className="min-h-full flex items-start justify-center py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900 rounded-t-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                    {categories.find(c => c.value === selectedBulletin.category)?.label}
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">
                    {new Date(selectedBulletin.created).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                <button
                  onClick={closeBulletinModal}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Text Content */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-stone-50">
                {selectedBulletin.content ? (
                  <div 
                    className="text-stone-700 leading-relaxed font-serif text-base"
                    dangerouslySetInnerHTML={{ 
                      __html: selectedBulletin.content
                        .replace(/style="[^"]*"/g, '')
                        .replace(/&nbsp;/g, ' ')
                    }}
                  />
                ) : (
                  <div className="text-center text-stone-400 py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <span>No content available</span>
                  </div>
                )}
              </div>

              {/* Bulletin Details */}
              <div className="p-4 sm:p-6 border-t border-stone-200">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">{selectedBulletin.title}</h2>
                <p className="text-sm sm:text-base text-stone-600">{selectedBulletin.subject}</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Fixed Top bar */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* Mobile Header with Filter */}
          <div className="lg:hidden mb-4">
            <MobilePageHeader 
              title="Bulletin Board"
              subtitle="Community announcements"
              icon={<Megaphone className="w-5 h-5" />}
            />
            
            {/* Mobile Category Filter Button */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-medium text-stone-700">
                      {categories.find(c => c.value === selectedCategory)?.label || 'All Posts'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
                <SheetHeader className="text-left pb-4 border-b border-stone-100">
                  <SheetTitle className="text-lg font-bold text-stone-800">Filter by Category</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-1 overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        setSelectedCategory(cat.value);
                        setFilterSheetOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 ${
                        selectedCategory === cat.value
                          ? 'bg-amber-100 border border-amber-300'
                          : 'hover:bg-stone-50'
                      }`}
                    >
                      <cat.icon className={`w-5 h-5 ${
                        selectedCategory === cat.value ? 'text-amber-700' : 'text-stone-500'
                      }`} />
                      <span className={`font-medium ${
                        selectedCategory === cat.value ? 'text-amber-900' : 'text-stone-700'
                      }`}>
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Back Button */}
          <div className="hidden lg:block mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* LEFT SIDEBAR - Category Filter (Desktop only) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4 overscroll-y-none">
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
            <main className="lg:col-span-6 space-y-3 sm:space-y-4 overscroll-y-auto">
              {/* Desktop Page Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
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
                      onClick={() => openBulletinModal(post)}
                      className="bg-white rounded-xl shadow-sm border-2 border-amber-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
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
                          <span>{new Date(post.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-amber-700 font-medium hover:text-amber-800">View Details →</span>
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
                      onClick={() => openBulletinModal(post)}
                      className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-amber-300 transition-all cursor-pointer"
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
                          <span>{new Date(post.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-amber-700 font-medium hover:text-amber-800">View Details →</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {!isLoading && bulletins.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                  <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-600">No posts in this category yet.</p>
                </div>
              )}

              {isLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-stone-600">Loading posts...</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                  <p className="text-red-600">{error instanceof Error ? error.message : 'An error occurred'}</p>
                </div>
              )}
            </main>

            {/* RIGHT SIDEBAR - User Info & Quick Actions (Desktop only) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4 overscroll-y-none">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-stone-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/TCN_Forms" className="block p-3 rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-amber-700" />
                      <span className="text-sm font-medium text-stone-700">Community Forms</span>
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}