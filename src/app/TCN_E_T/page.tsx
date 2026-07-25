"use client"

import { Backbtn } from "@/components/Backbtn"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { queryBulletins } from "@/lib/actions"
import {
  Briefcase,
  GraduationCap,
  Users,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  CheckCircle,
  Award,
  FileText,
  Calendar,
  X,
  RefreshCw,
  ArrowRight,
  Megaphone,
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
  { id: "jobs",      title: "Job Opportunities", shortTitle: "Jobs",      icon: TrendingUp },
  { id: "isets",     title: "ISETS / Funding",   shortTitle: "ISETS",     icon: Award },
  { id: "contact",   title: "Contact Us",        shortTitle: "Contact",   icon: Phone },
]

export default function TCN_E_T() {
  const { status } = useSession()
  const [activeSection, setActiveSection] = useState("overview")
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const ticking = useRef(false)

  // Fetch EMPLOYMENT bulletins
  const {
    data: bulletinsData,
    isLoading: loadingBulletins,
    error: bulletinError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["bulletins", "EMPLOYMENT"],
    queryFn: async () => {
      const result = await queryBulletins({
        page: 1,
        limit: 50,
        category: "EMPLOYMENT" as any,
        sortBy: "created",
        sortOrder: "desc",
      })
      if (!result.success) throw new Error(result.error || "Failed to load job postings")
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
          const sectionElements = sections.map((s) => document.getElementById(s.id))
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
      const top = element.offsetTop - 100
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const GlassCard = ({
    children,
    className = "",
    highlight = false,
  }: {
    children: React.ReactNode
    className?: string
    highlight?: boolean
  }) => (
    <div
      className={`
        relative overflow-hidden rounded-2xl md:rounded-3xl
        ${highlight
          ? "bg-gradient-to-br from-amber-900/90 via-amber-800/80 to-stone-900/90 border-amber-500/40"
          : "bg-gradient-to-br from-stone-800/80 via-stone-800/60 to-stone-900/80 border-stone-600/30"}
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



  const PanelTop =() => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center gap-4 mb-4">
        <Briefcase size={48} className="text-amber-500" />
        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
      </div>
     
    </div>
  )

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    amber:   { bg: "bg-amber-500/20",   text: "text-amber-400",   border: "border-amber-500/30" },
    indigo:  { bg: "bg-indigo-500/20",  text: "text-indigo-400",  border: "border-indigo-500/30" },
    rose:    { bg: "bg-rose-500/20",    text: "text-rose-400",    border: "border-rose-500/30" },
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/30" },
    yellow:  { bg: "bg-yellow-500/20",  text: "text-yellow-400",  border: "border-yellow-500/30" },
    blue:    { bg: "bg-blue-500/20",    text: "text-blue-400",    border: "border-blue-500/30" },
    stone:   { bg: "bg-stone-500/20",   text: "text-stone-300",   border: "border-stone-500/30" },
  }

  return (
    <div className="min-h-screen genbkg scroll-smooth">

      {/* ── POSTER MODAL ── */}
      {isModalOpen && selectedBulletin && selectedBulletin.poster_url && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/10 backdrop-blur-sm p-4"
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
      {/* Top Navigation */}
      <nav className="fixed top-0 z-50 w-full will-change-transform">
        <div className="bg-amber-900 border-b border-amber-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center gap-4">
                <div className="w-20">
                  <Backbtn />
                </div>
                <div className="hidden md:block h-8 w-px bg-amber-600/50" />
                <img src="/tcnlogolg.png" alt="TCN Logo" className="hidden md:block h-10 w-auto" />
              </div>

              {/* Desktop section pills */}
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

      {/* Mobile section nav strip */}
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
        <div className="absolute inset-0 bg-[url('/tcnarialview2.jpg')] bg-cover bg-center" />
        {/* <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-800/50 to-stone-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 to-indigo-900/20" /> */}

        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div>
            <div className="flex flex-col items-center justify-center text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 pb-6">
              Employment & 
              <span className="text-yellow-600">
                Training
              </span>
            </div>
            
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10">
              Building skills, creating opportunities, and empowering TCN members toward sustainable employment 
              and career growth.
            </p>

          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-amber-500/50" />
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-20">

        {/* ── 01  JOB OPPORTUNITIES (live bulletin board) ── */}
        <section id="jobs" className="py-16 md:py-24">
          <PanelTop />
          {/* Header bar */}
          <div className="flex items-center justify-between mb-6">
           
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
              <p className="text-stone-500">Loading job postings...</p>
            </div>
          )}

          {/* Error */}
          {bulletinError && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
              <p className="text-red-600 text-sm">{bulletinError instanceof Error ? bulletinError.message : "Failed to load postings"}</p>
            </div>
          )}

          {/* No posts */}
          {!loadingBulletins && !bulletinError && bulletins.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-16 text-center">
              <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No job postings at this time.</p>
              <p className="text-stone-400 text-sm mt-1">Check back soon or contact the Employment office directly.</p>
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
                  <span>View Posting</span>
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
                All Postings
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
                        <span className="text-xs font-semibold text-stone-400 uppercase">Employment</span>
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

        {/* ── 02  ISETS / FUNDING ── */}
        <section id="isets" className="py-16 md:py-24">
          <PanelTop />

          <div className="space-y-6">
            <GlassCard highlight className="p-6 md:p-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-xl bg-amber-500/20 flex-shrink-0">
                  <Award className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">What is ISETS?</h3>
                  <p className="text-stone-300 leading-relaxed">
                    The{" "}
                    <strong className="text-amber-300">
                      Indigenous Skills and Employment Training Strategy (ISETS)
                    </strong>{" "}
                    is a federal program that funds skills development and employment services for First
                    Nations, Métis, and Inuit people. TCN accesses ISETS funding to deliver training
                    that responds directly to the needs of our community and local employers.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: GraduationCap, label: "Training Costs",  body: "Tuition, course materials, and certification fees covered for eligible members." },
                  { icon: Users,         label: "Living Supports", body: "Potential allowances for transportation, childcare, and living expenses while in training." },
                  { icon: Briefcase,     label: "Work Experience", body: "Wage subsidies available to employers who hire and mentor TCN members." },
                ].map(({ icon: Icon, label, body }) => (
                  <div key={label} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-amber-500/20 w-fit mb-3">
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h5 className="text-white font-semibold mb-1">{label}</h5>
                    <p className="text-stone-400 text-sm">{body}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8">
              <h4 className="text-xl font-bold text-white mb-4">Eligibility</h4>
              <p className="text-stone-400 text-sm mb-6">
                To access ISETS-funded training, applicants generally must meet the following criteria.
                Contact the Employment office to confirm your eligibility.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Registered as a TCN Band member",
                  "16 years of age or older",
                  "Not currently a full-time student",
                  "Legally authorized to work in Canada",
                  "Demonstrating a need for employment support",
                  "Committed to completing the approved plan",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ── 03  CONTACT ── */}
        <section id="contact" className="py-16 md:py-24">
          <PanelTop />


          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard highlight className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Employment & Training Office</h3>
              <div className="space-y-4">
                {[
                  { icon: MapPin, label: "Address",      value: "Band Office, Split Lake, MB R0B 1P0" },
                  { icon: Phone,  label: "Phone",        value: "(204) 342-2045" },
                  { icon: Mail,   label: "Email",        value: "employment@tcn.ca" },
                  { icon: Clock,  label: "Office Hours", value: "Monday – Friday: 8:30 AM – 4:30 PM" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20 flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-stone-400 text-xs uppercase tracking-wider mb-0.5">{label}</div>
                      {label === "Phone" ? (
                        <a href={`tel:${value}`} className="text-white hover:text-amber-400 transition-colors">{value}</a>
                      ) : label === "Email" ? (
                        <a href={`mailto:${value}`} className="text-white hover:text-amber-400 transition-colors">{value}</a>
                      ) : (
                        <span className="text-white">{value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Staff Directory</h3>
              <div className="space-y-4">
                {[
                  { name: "Sara Cole",          position: "Ongoing Jobs Manager", phone: "(204) 342-2045" },
                  { name: "Yvonne Wastesicoot", position: "ISETS Worker",         phone: "(204) 342-2045" },
                ].map(({ name, position, phone }) => (
                  <div key={name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-semibold text-white">{name}</div>
                    <div className="text-amber-400 text-sm">{position}</div>
                    <a
                      href={`tel:${phone}`}
                      className="text-stone-400 text-sm hover:text-amber-400 transition-colors mt-1 block"
                    >
                      {phone}
                    </a>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-300 text-sm leading-relaxed">
                  <strong>Walk-ins welcome.</strong> If you are unsure where to start or what
                  programs you qualify for, simply come in and speak with a counsellor — no
                  appointment necessary.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>

      </main>
    </div>
  )
}
