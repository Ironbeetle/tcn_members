'use client'
import { useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { queryBulletins } from '@/lib/actions';
import { BULLETIN_CATEGORY_LABELS } from '@/lib/category-constants';
import {
  Users,
  Calendar,
  X,
  FileText,
  Megaphone,
  ArrowRight,
} from 'lucide-react';

const CATEGORY = 'CHIEF_COUNCIL';
const CATEGORY_LABEL = BULLETIN_CATEGORY_LABELS[CATEGORY];

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

const CouncilBulletin = () => {
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { status } = useSession();

  const {
    data: bulletinsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['bulletins', CATEGORY],
    queryFn: async () => {
      const result = await queryBulletins({
        page: 1,
        limit: 100,
        category: CATEGORY,
        sortBy: 'created',
        sortOrder: 'desc',
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to load bulletins');
      }

      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const bulletins: Bulletin[] = bulletinsData?.bulletins || [];

  const openBulletinModal = useCallback((bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  }, []);

  const closeBulletinModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBulletin(null);
  }, []);

  const featuredPost = useMemo(() => bulletins[0] || null, [bulletins]);
  const remainingPosts = useMemo(() => bulletins.slice(1), [bulletins]);

  return (
    <div className="w-full">
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
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                  {CATEGORY_LABEL}
                </div>
                <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">
                  {new Date(selectedBulletin.created).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
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

            <div className="overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[calc(90vh-80px)]">
              <div className="relative w-full bg-stone-100 flex items-center justify-center">
                <img
                  src={getPosterUrl(selectedBulletin.poster_url || '')}
                  alt={selectedBulletin.title}
                  className="w-full h-auto object-contain max-h-[60vh] sm:max-h-[70vh]"
                />
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
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900 rounded-t-2xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                    {CATEGORY_LABEL}
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">
                    {new Date(selectedBulletin.created).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
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

              <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-stone-50">
                {selectedBulletin.content ? (
                  <div
                    className="text-stone-700 leading-relaxed font-serif text-base"
                    dangerouslySetInnerHTML={{
                      __html: selectedBulletin.content
                        .replace(/style="[^"]*"/g, '')
                        .replace(/&nbsp;/g, ' '),
                    }}
                  />
                ) : (
                  <div className="text-center text-stone-400 py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <span>No content available</span>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-6 border-t border-stone-200">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">{selectedBulletin.title}</h2>
                <p className="text-sm sm:text-base text-stone-600">{selectedBulletin.subject}</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white mb-4 sm:mb-6"
      >
        <div className="flex items-center gap-4 mb-3">
          <Users className="w-8 h-8" />
          <h1 className="text-2xl font-bold">News From Council</h1>
        </div>
        <p className="text-amber-50">Announcements and updates from Chief and Council</p>
      </motion.div>

      <div className="space-y-4 sm:space-y-6">
        {/* Featured Latest Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onClick={() => openBulletinModal(featuredPost)}
            className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-3 border-b border-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-700 text-white">
                    Latest
                  </span>
                  <span className="text-xs font-semibold text-amber-800 uppercase">
                    {CATEGORY_LABEL}
                  </span>
                </div>
                <span className="text-xs text-amber-700 font-medium">
                  {new Date(featuredPost.created).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="font-bold text-2xl text-stone-800 mb-3 group-hover:text-amber-800 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-stone-600 mb-4 line-clamp-3 text-base leading-relaxed">
                {featuredPost.subject}
              </p>
              <div className="flex items-center text-amber-700 font-semibold group-hover:text-amber-800 transition-colors">
                <span>Read Full Post</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Remaining Posts Grid */}
        {remainingPosts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-600 px-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Posts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {remainingPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => openBulletinModal(post)}
                  className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-semibold text-stone-500 uppercase truncate">
                        {CATEGORY_LABEL}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-stone-800 mb-2 line-clamp-2 group-hover:text-amber-800 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-stone-600 mb-3 line-clamp-2">{post.subject}</p>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>{new Date(post.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-amber-700 font-medium group-hover:text-amber-800">View →</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && bulletins.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
            <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">No Chief & Council bulletins yet.</p>
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
      </div>
    </div>
  );
};

export default CouncilBulletin;
