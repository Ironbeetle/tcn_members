"use client"
import { useState, useCallback, useMemo } from 'react';
import { UserSessionBar } from '@/components/UserSessionBar';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { queryBulletins, getChiefAndCouncil } from '@/lib/actions';
import { 
  Users,
  Crown,
  FileText,
  Download,
  Eye,
  ArrowLeft,
  X,
  ImageIcon,
  Megaphone,
  Mail,
  Phone,
  Briefcase,
  Scale,
  ChevronDown,
  ChevronUp,
  Calendar,
  ExternalLink,
  User
} from 'lucide-react';

// Chief and Council type matching database schema
interface CouncilMember {
  id: string;
  created: Date;
  position: 'CHIEF' | 'COUNCILLOR';
  first_name: string;
  last_name: string;
  portfolios: string[];  // Array of portfolios (up to 4)
  email: string;
  phone: string;
  bio?: string | null;
  image_url?: string | null;
  councilId?: string | null;
}

interface CurrentCouncil {
  id: string;
  council_start: Date;
  council_end: Date;
}

interface CouncilData {
  council: CurrentCouncil | null;
  members: CouncilMember[];
}

// Portfolio display mapping
const portfolioLabels: Record<string, string> = {
  'TREATY': 'Treaty Rights',
  'HEALTH': 'Health',
  'EDUCATION': 'Education',
  'HOUSING': 'Housing',
  'ECONOMIC_DEVELOPMENT': 'Economic Development',
  'ENVIRONMENT': 'Environment',
  'PUBLIC_SAFETY': 'Public Safety',
  'LEADERSHIP': 'Leadership',
};

// Community By-Laws
interface ByLaw {
  id: string;
  title: string;
  description: string;
  pdfUrl: string;
  effectiveDate: string;
  category: string;
}

const communityByLaws: ByLaw[] = [
  {
    id: 'bylaw-1',
    title: 'Community Protection By-Law',
    description: 'Regulations for maintaining peace, order and safety within the community.',
    pdfUrl: '/tcnpdfs/TCNCommunityProtectionBylaw201801.pdf',
    effectiveDate: '2018-01-01',
    category: 'Safety'
  },
  {
    id: 'bylaw-2',
    title: 'Intoxicant By-Law',
    description: 'Rules and regulations regarding intoxicants and controlled substances within the community.',
    pdfUrl: '/tcnpdfs/TCNIntoxicantBylaw201701.pdf',
    effectiveDate: '2017-01-01',
    category: 'Safety'
  },
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

// Council Member Card Component
function CouncilMemberCard({ member, isChief = false }: { member: CouncilMember; isChief?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullName = `${member.first_name} ${member.last_name}`;
  const positionLabel = member.position === 'CHIEF' ? 'Chief' : 'Councillor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
        isChief ? 'border-amber-300 ring-2 ring-amber-100' : 'border-stone-200'
      }`}
    >
      <div 
        className={`p-4 cursor-pointer ${isChief ? 'bg-gradient-to-r from-amber-700 to-amber-900' : 'bg-gradient-to-r from-stone-700 to-stone-900'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {/* Photo or placeholder */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
            isChief ? 'bg-amber-600' : 'bg-stone-600'
          }`}>
            {member.image_url ? (
              <img 
                src={member.image_url} 
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : isChief ? (
              <Crown className="w-8 h-8 text-white" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{fullName}</h3>
            <p className="text-sm text-white/80">{positionLabel}</p>
          </div>
          <div className="text-white">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Portfolios always visible */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-4 h-4 text-amber-700" />
          <span className="text-sm font-semibold text-stone-700">
            {member.portfolios.length > 1 ? 'Portfolios' : 'Portfolio'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {member.portfolios.length > 0 ? (
            member.portfolios.map((portfolio, index) => (
              <span 
                key={index}
                className={`px-3 py-1 text-xs rounded-full ${
                  isChief ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {portfolioLabels[portfolio] || portfolio}
              </span>
            ))
          ) : (
            <span className="text-sm text-stone-400">No portfolio assigned</span>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 space-y-3"
        >
          {member.bio && (
            <p className="text-sm text-stone-600">{member.bio}</p>
          )}
          <div className="flex flex-col gap-2 text-sm">
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-stone-600 hover:text-amber-700">
                <Mail className="w-4 h-4" />
                <span>{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-stone-600 hover:text-amber-700">
                <Phone className="w-4 h-4" />
                <span>{member.phone}</span>
              </a>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// By-Law Card Component
function ByLawCard({ bylaw }: { bylaw: ByLaw }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 hover:shadow-md hover:border-amber-300 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {bylaw.category}
            </span>
            <span className="text-xs text-stone-500">
              Effective: {new Date(bylaw.effectiveDate).toLocaleDateString()}
            </span>
          </div>
          <h4 className="font-bold text-stone-800 mb-1">{bylaw.title}</h4>
          <p className="text-sm text-stone-600 line-clamp-2">{bylaw.description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={bylaw.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            View
          </a>
          <a
            href={bylaw.pdfUrl}
            download
            className="flex items-center gap-1 px-3 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TCNLocalGovernancePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'council' | 'bylaws' | 'news'>('council');
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TanStack Query for fetching Chief & Council from database
  const {
    data: councilData,
    isLoading: loadingCouncil,
  } = useQuery({
    queryKey: ['chiefAndCouncil'],
    queryFn: async () => {
      const result = await getChiefAndCouncil();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load council data');
      }
      
      return result.data as CouncilData;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // TanStack Query for fetching Chief & Council bulletins
  const {
    data: bulletinsData,
    isLoading: loadingBulletins,
  } = useQuery({
    queryKey: ['bulletins', 'CHIEFNCOUNCIL'],
    queryFn: async () => {
      const result = await queryBulletins({
        category: 'CHIEFNCOUNCIL',
        page: 1,
        limit: 20,
        sortBy: 'created',
        sortOrder: 'desc'
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load bulletins');
      }
      
      return result.data;
    },
    enabled: status === 'authenticated',
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Extract bulletins from query data
  const bulletins: Bulletin[] = bulletinsData?.bulletins || [];

  // Extract council info and members from query data
  const currentCouncil = councilData?.council || null;
  const councilMembers = councilData?.members || [];
  const chief = councilMembers.find((m: CouncilMember) => m.position === 'CHIEF') || null;
  const councillors = councilMembers.filter((m: CouncilMember) => m.position === 'COUNCILLOR') || [];

  // Modal handlers
  const openBulletinModal = useCallback((bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
    setIsModalOpen(true);
  }, []);

  const closeBulletinModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedBulletin(null);
  }, []);

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
      {/* Bulletin Image Modal */}
      {isModalOpen && selectedBulletin && (
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
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-gradient-to-r from-blue-700 to-blue-900">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                  Chief & Council
                </div>
                <span className="text-white/80 text-sm">
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
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {selectedBulletin.poster_url && (
                <div className="relative w-full bg-stone-100 flex items-center justify-center">
                  <img
                    src={selectedBulletin.poster_url}
                    alt={selectedBulletin.title}
                    className="w-full h-auto object-contain max-h-[70vh]"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-stone-800 mb-2">{selectedBulletin.title}</h2>
                <p className="text-stone-600 whitespace-pre-wrap">{selectedBulletin.subject}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-100 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>

      <div className="pt-16 lg:pt-16">
        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>

        {/* 3-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT SIDEBAR - Navigation */}
            <aside className="lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-stone-800 mb-3 text-sm">Sections</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('council')}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      activeTab === 'council' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Crown className="w-5 h-5" />
                    <span className="font-medium">Chief & Council</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('bylaws')}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      activeTab === 'bylaws' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Scale className="w-5 h-5" />
                    <span className="font-medium">Community By-Laws</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('news')}
                    className={`w-full p-3 rounded-lg text-left transition-colors flex items-center gap-3 ${
                      activeTab === 'news' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Megaphone className="w-5 h-5" />
                    <span className="font-medium">News & Announcements</span>
                  </button>
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-4"
              >
                <h3 className="font-bold text-blue-900 mb-3">Governance</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-blue-700">{chief ? 1 : 0}</div>
                    <div className="text-xs text-blue-800">Chief</div>
                  </div>
                  <div className="border-t border-blue-200 pt-2">
                    <div className="text-2xl font-bold text-blue-700">{councillors.length}</div>
                    <div className="text-xs text-blue-800">Councillors</div>
                  </div>
                </div>
              </motion.div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-6 space-y-4">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Users className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Local Governance</h1>
                </div>
                <p className="text-blue-50">Leadership, by-laws, and official communications from Tataskweyak Cree Nation Chief and Council.</p>
              </motion.div>

              {/* Tab Content */}
              {activeTab === 'council' && (
                <div className="space-y-4">
                  {loadingCouncil ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                      <p className="text-stone-600">Loading council members...</p>
                    </div>
                  ) : councilMembers.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <Users className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-600">No council members found.</p>
                      <p className="text-xs text-stone-500 mt-2">Council profiles will be synced from the master database.</p>
                    </div>
                  ) : (
                    <>
                      {/* Council Term Info */}
                      {currentCouncil && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-2 text-amber-800">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Council Term: {new Date(currentCouncil.council_start).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - {new Date(currentCouncil.council_end).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Chief */}
                      {chief && (
                        <div>
                          <h3 className="text-sm font-bold text-stone-600 px-2 mb-3 flex items-center gap-2">
                            <Crown className="w-4 h-4 text-amber-700" />
                            Chief
                          </h3>
                          <CouncilMemberCard member={chief} isChief={true} />
                        </div>
                      )}

                      {/* Councillors */}
                      {councillors.length > 0 && (
                        <div>
                          <h3 className="text-sm font-bold text-stone-600 px-2 mb-3 mt-6 flex items-center gap-2">
                            <Users className="w-4 h-4 text-stone-500" />
                            Council Members
                          </h3>
                          <div className="space-y-3">
                            {councillors.map((councillor: CouncilMember, index: number) => (
                              <motion.div
                                key={councillor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                              >
                                <CouncilMemberCard member={councillor} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {activeTab === 'bylaws' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-stone-600 px-2 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-blue-700" />
                      Community By-Laws
                    </h3>
                    <span className="text-xs text-stone-500">{communityByLaws.length} documents</span>
                  </div>
                  <div className="space-y-3">
                    {communityByLaws.map((bylaw, index) => (
                      <motion.div
                        key={bylaw.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ByLawCard bylaw={bylaw} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'news' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-stone-600 px-2 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-blue-700" />
                      Chief & Council Announcements
                    </h3>
                  </div>

                  {loadingBulletins ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-stone-600">Loading announcements...</p>
                    </div>
                  ) : bulletins.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
                      <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                      <p className="text-stone-600">No announcements at this time.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bulletins.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => openBulletinModal(post)}
                          className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                              <span className="text-xs font-semibold text-blue-700 uppercase">
                                Chief & Council
                              </span>
                              <span className="text-xs text-stone-500">
                                • {new Date(post.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <h3 className="font-bold text-lg text-stone-800 mb-2">{post.title}</h3>
                            <p className="text-sm text-stone-600 mb-3 line-clamp-2">{post.subject}</p>
                            <div className="flex items-center justify-end">
                              <span className="text-blue-700 font-medium text-sm hover:text-blue-800">View Details →</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </main>

            {/* RIGHT SIDEBAR - Contact & Info */}
            <aside className="lg:col-span-3 space-y-4">
              {/* Next Council Meeting */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Next Council Meeting
                </h3>
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-amber-700">TBD</div>
                  <div className="text-sm text-amber-800 mt-1">Check bulletin board for updates</div>
                </div>
              </motion.div>

              {/* Contact Band Office */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4"
              >
                <h3 className="font-bold text-stone-800 mb-3">Contact Band Office</h3>
                <div className="space-y-3 text-sm text-stone-600">
                  <a href="tel:2043422045" className="flex items-center gap-2 hover:text-amber-700">
                    <Phone className="w-4 h-4 text-amber-700" />
                    <span>(204) 342-2045</span>
                  </a>
                  <a href="mailto:bandoffice@tcn.ca" className="flex items-center gap-2 hover:text-amber-700">
                    <Mail className="w-4 h-4 text-amber-700" />
                    <span>bandoffice@tcn.ca</span>
                  </a>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4"
              >
                <h3 className="font-bold text-stone-800 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a 
                    href="/TCN_BulletinBoard" 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                  >
                    <span className="text-stone-700">Community Bulletin</span>
                    <ExternalLink className="w-4 h-4 text-amber-700" />
                  </a>
                  <a 
                    href="/TCN_BandOffice" 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                  >
                    <span className="text-stone-700">Band Office Directory</span>
                    <ExternalLink className="w-4 h-4 text-amber-700" />
                  </a>
                  <a 
                    href="/TCN_Forms" 
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 transition-colors text-sm"
                  >
                    <span className="text-stone-700">Community Forms</span>
                    <ExternalLink className="w-4 h-4 text-amber-700" />
                  </a>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}