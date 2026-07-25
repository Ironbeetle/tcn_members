"use client"

import { Backbtn } from "@/components/Backbtn"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { queryBulletins } from "@/lib/actions"
import { 
  Cpu, 
  Leaf, 
  MessageSquare, 
  Globe, 
  Code, 
  Camera, 
  Gamepad2, 
  Shield, 
  Factory, 
  Wrench,
  Smartphone,
  Mail,
  FileText,
  Users,
  Lightbulb,
  Sparkles,
  ChevronDown,
  Zap,
  BookOpen,
  Target,
  Monitor,
  Rocket,
  X,
  RefreshCw,
  ArrowRight,
  Megaphone,
  Calendar,
} from "lucide-react"

type Bulletin = {
  id: string
  title: string
  subject: string
  content: string | null
  poster_url: string | null
  category: string
  created: Date
  updated: Date
}

const sections = [
  { id: "vision", title: "Self-Sufficient Cree Nation", shortTitle: "Vision", icon: Lightbulb },
  { id: "history", title: "History of Problem Solving", shortTitle: "History", icon: BookOpen },
  { id: "platform", title: "Our Communications Platform", shortTitle: "Platform", icon: Monitor },
]

// Areas where technology can be applied
const techAreas = [
  { title: "Land Stewardship", icon: Leaf, description: "Protecting and managing our traditional territories with modern tools", color: "emerald" },
  { title: "Culture Preservation", icon: Users, description: "Documenting and sharing our Cree heritage for future generations", color: "amber" },
  { title: "Entertainment", icon: Gamepad2, description: "Creating games and media that tell our stories our way", color: "purple" },
  { title: "Public Safety", icon: Shield, description: "Using technology to keep our community safe and secure", color: "blue" },
  { title: "Manufacturing", icon: Factory, description: "Building products and solutions locally for local needs", color: "orange" },
  { title: "Software Development", icon: Code, description: "Building custom applications tailored to our needs", color: "cyan" },
  { title: "Technical Services", icon: Wrench, description: "IT support and infrastructure maintenance", color: "stone" },
]

// Skills needed for the platform
const skillsNeeded = [
  { title: "IT Technicians", icon: Cpu, description: "Hardware and network support" },
  { title: "Website Builders", icon: Globe, description: "Creating web presence and apps" },
  { title: "Application Developers", icon: Code, description: "Building custom software" },
  { title: "Graphic Designers", icon: Sparkles, description: "Visual design and branding" },
  { title: "Videographers", icon: Camera, description: "Media creation and documentation" },
  { title: "Game Developers", icon: Gamepad2, description: "Interactive entertainment" },
  { title: "Communicators", icon: MessageSquare, description: "Content creation and outreach" },
]

// Communication channels
const commChannels = [
  { title: "SMS Texting", icon: Smartphone, description: "Private individual messages for direct, personal communication with members", color: "blue" },
  { title: "Email", icon: Mail, description: "Detailed information for individuals and groups with attachments and links", color: "amber" },
  { title: "Bulletin Posts", icon: FileText, description: "Public announcements delivered directly to your device in real-time", color: "emerald" },
]

export default function TCN_TRSC() {
  const { status } = useSession()
  const [activeSection, setActiveSection] = useState("vision")
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const ticking = useRef(false)

  // Fetch TRSC bulletins
  const {
    data: bulletinsData,
    isLoading: loadingBulletins,
    error: bulletinError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["bulletins", "TRSC"],
    queryFn: async () => {
      const result = await queryBulletins({
        page: 1,
        limit: 50,
        category: "TRSC" as any,
        sortBy: "created",
        sortOrder: "desc",
      })
      if (!result.success) throw new Error(result.error || "Failed to load TRSC posts")
      return result.data
    },
    enabled: status === "authenticated",
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const bulletins: Bulletin[] = bulletinsData?.bulletins || []
  const featuredPost = useMemo(() => bulletins[0] || null, [bulletins])
  const remainingPosts = useMemo(() => bulletins.slice(1), [bulletins])

  const openModal = useCallback((b: Bulletin) => { setSelectedBulletin(b); setIsModalOpen(true) }, [])
  const closeModal = useCallback(() => { setIsModalOpen(false); setSelectedBulletin(null) }, [])

  const getPosterUrl = (url: string) => {
    if (!url) return ""
    let filename = ""
    if (url.startsWith("http")) {
      try { filename = new URL(url).pathname.split("/").pop() || "" } catch { filename = url.split("/").pop() || "" }
    } else {
      filename = url.split("/").pop() || ""
    }
    return filename ? `/api/poster/${filename}` : ""
  }

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const sectionElements = sections.map(s => document.getElementById(s.id))
          const scrollPosition = window.scrollY + 200

          for (let i = sectionElements.length - 1; i >= 0; i--) {
            const section = sectionElements[i]
            if (section && section.offsetTop <= scrollPosition) {
              setActiveSection(sections[i].id)
              break
            }
          }
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  // Simple Card (removed motion animations for performance)
  const GlassCard = ({ children, className = "", highlight = false }: { children: React.ReactNode, className?: string, highlight?: boolean }) => (
    <div
      className={`
        relative overflow-hidden rounded-2xl md:rounded-3xl
        ${highlight 
          ? 'bg-gradient-to-br from-amber-900/90 via-amber-900/80 to-amber-800/90 border-amber-500/40' 
          : 'bg-gradient-to-br from-stone-800/80 via-stone-800/60 to-stone-900/80 border-stone-600/30'
        }
        border shadow-2xl shadow-black/20
        ${className}
      `}
    >
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  )

  // Section Header (removed motion for performance)
  const SectionHeader = ({ number, title, subtitle }: { number: string, title: string, subtitle?: string }) => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl md:text-7xl font-black text-amber-500/20">{number}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
      </div>
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-body-lg text-stone-600 max-w-2xl">{subtitle}</p>
      )}
    </div>
  )

  // Tech Area Card
  const TechAreaCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => {
    const colorClasses: Record<string, { bg: string, border: string, iconBg: string, iconText: string }> = {
      emerald: { bg: 'from-emerald-900/40 to-emerald-950/40', border: 'border-emerald-500/30', iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400' },
      amber: { bg: 'from-amber-900/40 to-amber-950/40', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20', iconText: 'text-amber-400' },
      purple: { bg: 'from-purple-900/40 to-purple-950/40', border: 'border-purple-500/30', iconBg: 'bg-purple-500/20', iconText: 'text-purple-400' },
      blue: { bg: 'from-blue-900/40 to-blue-950/40', border: 'border-blue-500/30', iconBg: 'bg-blue-500/20', iconText: 'text-blue-400' },
      orange: { bg: 'from-orange-900/40 to-orange-950/40', border: 'border-orange-500/30', iconBg: 'bg-orange-500/20', iconText: 'text-orange-400' },
      cyan: { bg: 'from-cyan-900/40 to-cyan-950/40', border: 'border-cyan-500/30', iconBg: 'bg-cyan-500/20', iconText: 'text-cyan-400' },
      stone: { bg: 'from-stone-800/40 to-stone-900/40', border: 'border-stone-500/30', iconBg: 'bg-stone-500/20', iconText: 'text-stone-400' },
    }
    const colors = colorClasses[color] || colorClasses.amber

    return (
      <div
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} p-6`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
        <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${colors.iconText}`} />
        </div>
        <h3 className="text-heading-sm font-bold text-white mb-2">{title}</h3>
        <p className="text-stone-300 text-body-sm">{description}</p>
      </div>
    )
  }

  // Skill Badge
  const SkillBadge = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div
      className="group flex items-center gap-4 bg-stone-800/50 rounded-xl p-4 border border-stone-700/50"
    >
      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-amber-400" />
      </div>
      <div>
        <h4 className="font-semibold text-white text-body">{title}</h4>
        <p className="text-stone-400 text-body-sm">{description}</p>
      </div>
    </div>
  )

  // Channel Card
  const ChannelCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => {
    const colorClasses: Record<string, { gradient: string, iconBg: string, iconText: string, ring: string }> = {
      blue: { gradient: 'from-blue-600 to-blue-800', iconBg: 'bg-white/20', iconText: 'text-white', ring: 'ring-blue-400/30' },
      amber: { gradient: 'from-amber-600 to-amber-800', iconBg: 'bg-white/20', iconText: 'text-white', ring: 'ring-amber-400/30' },
      emerald: { gradient: 'from-emerald-600 to-emerald-800', iconBg: 'bg-white/20', iconText: 'text-white', ring: 'ring-emerald-400/30' },
    }
    const colors = colorClasses[color] || colorClasses.amber

    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} p-6 md:p-8 shadow-xl ring-1 ${colors.ring}`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className={`w-16 h-16 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-5`}>
          <Icon className={`w-8 h-8 ${colors.iconText}`} />
        </div>
        <h3 className="text-heading font-bold text-white mb-3">{title}</h3>
        <p className="text-white/80 text-body-lg">{description}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen genbkg scroll-smooth">

      {/* ── POSTER MODAL ── */}
      {isModalOpen && selectedBulletin && selectedBulletin.poster_url && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900">
              <span className="text-white/80 text-sm">
                {new Date(selectedBulletin.created).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/20 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className="relative w-full bg-stone-100 flex items-center justify-center">
                <img src={getPosterUrl(selectedBulletin.poster_url)} alt={selectedBulletin.title} className="w-full h-auto object-contain max-h-[65vh]" />
              </div>
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">{selectedBulletin.title}</h2>
                <p className="text-sm sm:text-base text-stone-600 whitespace-pre-wrap">{selectedBulletin.subject}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── TEXT MODAL ── */}
      {isModalOpen && selectedBulletin && !selectedBulletin.poster_url && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div className="min-h-full flex items-start justify-center py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900 rounded-t-2xl">
                <span className="text-white/80 text-sm">
                  {new Date(selectedBulletin.created).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/20 text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-stone-50">
                {selectedBulletin.content ? (
                  <div
                    className="text-stone-700 leading-relaxed font-serif text-base"
                    dangerouslySetInnerHTML={{
                      __html: selectedBulletin.content
                        .replace(/style="[^"]*"/g, "")
                        .replace(/&nbsp;/g, " "),
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

      {/* Navigation - removed backdrop-blur for performance */}
      <nav className="fixed top-0 z-50 w-full will-change-transform">
        <div className="bg-amber-900 border-b border-amber-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center gap-4">
                <div className="w-20">
                  <Backbtn />
                </div>
                <div className="hidden md:block h-8 w-px bg-amber-600/50" />
                <img
                  src="/tcnlogolg.png"
                  alt="TCN Logo"
                  className="hidden md:block h-10 w-auto"
                />
              </div>
              
              {/* Desktop Nav Pills */}
              <div className="hidden lg:flex items-center gap-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeSection === section.id
                          ? "bg-amber-500 text-stone-950"
                          : "text-amber-100 hover:text-white hover:bg-amber-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.shortTitle}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Section Nav - removed backdrop-blur for performance */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-amber-900 border-b border-amber-700/50 overflow-x-auto will-change-transform">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? "bg-amber-500 text-stone-950"
                    : "bg-amber-800/60 text-amber-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.shortTitle}
              </button>
            )
          })}
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-[70vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden pt-32 md:pt-20">
        <div className="absolute inset-0 bg-[url('/tcnarialview2.jpg')] bg-cover bg-center opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-800/50 to-stone-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 to-indigo-900/20" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div>
            <div className="flex flex-col items-center justify-center text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 pb-6">
              Traditional
              <span className="text-yellow-600">
                Resource Stewardship Center
              </span>
            </div>
            
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10">
              Keeyask Dam Adverse Effects Programs
            </p>

          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-amber-500/50" />
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20">
        
        {/* Section 1: Facilities & Link */}
        <section id="facilities" className="py-16 md:py-24">
          <SectionHeader 
            number="01" 
            title="Offsetting Keeyask Dam Effects"
            subtitle="Preserving our culture and traditions"
          />

          <div className="space-y-6 md:space-y-8">
            <GlassCard highlight className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-heading font-bold text-white mb-4">TRSC Facilities in TCN</h3>
                  <p className="text-stone-300 text-body-lg mb-6">
                   The Traditional Resource Stewardship Center serves as the operational headquarters for 
                   land stewardship initiatives and
                    Adverse Effects Agreement program management.
                  </p>
                  <p className="text-amber-200/80 text-body">
                   Adverse effects programs provide a substitute opportunity for TCN and members to maintain the 
                   historical connection to the land. 
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-800/30 to-stone-900/50 rounded-2xl p-8 border border-amber-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Lightbulb className="w-7 h-7 text-amber-400" />
                      </div>
                      <h4 className="text-heading-sm font-bold text-white">Key Insight</h4>
                    </div>
                    <p className="text-stone-300 text-body-lg">
                      The adverse effects programs were created to offset the impacts of the Keeyask dam construction 
                      on the traditional practices and customs of Tataskweyak Cree Nation members.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Section 2: TRSC Bulletin Posts */}
        <section id="land-programs" className="py-16 md:py-24">
          <SectionHeader 
            number="02" 
            title="TRSC Posts"
            subtitle="Latest announcements and updates from the Traditional Resource Stewardship Center"
          />

          {/* Header bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <Leaf className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">TRSC</span>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-stone-400 hover:text-amber-400 text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Loading */}
          {loadingBulletins && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto mb-4" />
              <p className="text-stone-500">Loading posts...</p>
            </div>
          )}

          {/* Error */}
          {bulletinError && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
              <p className="text-red-600 text-sm">{bulletinError instanceof Error ? bulletinError.message : "Failed to load posts"}</p>
            </div>
          )}

          {/* No posts */}
          {!loadingBulletins && !bulletinError && bulletins.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-16 text-center">
              <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No posts at this time.</p>
              <p className="text-stone-400 text-sm mt-1">Check back soon or contact the TRSC office directly.</p>
            </div>
          )}

          {/* Featured latest post */}
          {featuredPost && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => openModal(featuredPost)}
              className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group mb-6"
            >
              <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 px-5 py-3 border-b border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-700 text-white">Latest</span>
                  <span className="text-xs text-amber-700 font-medium">
                    {new Date(featuredPost.created).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {featuredPost.poster_url && (
                  <div className="mb-4 rounded-xl overflow-hidden bg-stone-100 max-h-48 flex items-center justify-center">
                    <img
                      src={getPosterUrl(featuredPost.poster_url)}
                      alt={featuredPost.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => { e.currentTarget.parentElement!.style.display = "none" }}
                    />
                  </div>
                )}
                <h2 className="font-bold text-2xl text-stone-800 mb-3 group-hover:text-amber-800 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-stone-600 mb-4 line-clamp-3 text-base leading-relaxed">{featuredPost.subject}</p>
                <div className="flex items-center text-amber-700 font-semibold group-hover:text-amber-800 transition-colors">
                  <span>View Post</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Remaining posts grid */}
          {remainingPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-500 px-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                All Posts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {remainingPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => openModal(post)}
                    className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
                  >
                    {post.poster_url && (
                      <div className="h-32 overflow-hidden bg-stone-100">
                        <img
                          src={getPosterUrl(post.poster_url)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.parentElement!.style.display = "none" }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-semibold text-stone-400 uppercase">TRSC</span>
                      </div>
                      <h3 className="font-bold text-base text-stone-800 mb-2 line-clamp-2 group-hover:text-amber-800 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-stone-600 mb-3 line-clamp-2">{post.subject}</p>
                      <div className="flex items-center justify-between text-xs text-stone-400">
                        <span>{new Date(post.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="text-amber-700 font-medium group-hover:text-amber-800">View →</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </section>

      </main>
    </div>
  )
}
