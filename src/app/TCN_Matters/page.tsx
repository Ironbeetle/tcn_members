"use client"

import { Backbtn } from "@/components/Backbtn"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { queryBulletins } from "@/lib/actions"
import meetingVideos from "@/data/tcn-matters-videos.json"
import { 
  ChevronDown,
  Calendar,
  Video,
  Megaphone,
  RefreshCw,
  ArrowRight,
  X,
  FileText,
  ImageIcon,
  Play,
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

type MeetingVideo = {
  id: string
  title: string
  description: string
  recordedAt?: string
}

const sections = [
  { id: "bulletins", title: "Meeting Bulletin", shortTitle: "Bulletins", icon: Megaphone },
  { id: "videos", title: "Meeting Videos", shortTitle: "Videos", icon: Video },
]

export default function TCN_Matters() {
  const { status } = useSession()
  const [activeSection, setActiveSection] = useState("bulletins")
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string>(meetingVideos[0]?.id || "")
  const ticking = useRef(false)

  const {
    data: bulletinsData,
    isLoading: loadingBulletins,
    error: bulletinError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["bulletins", "COMMUNITY_MEETINGS"],
    queryFn: async () => {
      const result = await queryBulletins({
        page: 1,
        limit: 50,
        category: "COMMUNITY_MEETINGS",
        sortBy: "created",
        sortOrder: "desc",
      })
      if (!result.success) throw new Error(result.error || "Failed to load council bulletins")
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
  const videos: MeetingVideo[] = meetingVideos
  const activeVideo = useMemo(
    () => videos.find((video) => video.id === activeVideoId) || videos[0] || null,
    [videos, activeVideoId]
  )

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

  // Section Header
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
        <p className="mt-3 text-lg md:text-xl text-stone-600 max-w-2xl">{subtitle}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen genbkg scroll-smooth">
      {/* Poster Modal */}
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
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/20 text-white" aria-label="Close bulletin">
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

      {/* Text Modal */}
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
                <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/20 text-white" aria-label="Close bulletin">
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
      <nav className="fixed top-0 z-100 w-full will-change-transform">
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

      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden pt-32 md:pt-20">
        <div className="absolute inset-0 bg-[url('/tcnarialview2.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-800/50 to-stone-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 to-red-900/30" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div>
            <div className="flex flex-col items-center justify-center text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 pb-6">
              Community
              <span className="text-yellow-600">
                Meetings
              </span>
            </div>
            
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10">
              Stay informed on upcoming Chief and Council meetings and catch recordings
              from previous sessions, all in one place for TCN members.
            </p>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-amber-500/50" />
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-20">
        <section id="bulletins" className="py-16 md:py-24">
          <SectionHeader
            number="01"
            title="Chief & Council Bulletin"
            subtitle="Upcoming notices and meeting updates for TCN members"
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
              <Megaphone className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-xs font-semibold uppercase tracking-wider">Chief Council</span>
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

          {status !== "authenticated" && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
              <Megaphone className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600">Please sign in to view Chief & Council bulletins.</p>
            </div>
          )}

          {status === "authenticated" && loadingBulletins && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mx-auto mb-4" />
              <p className="text-stone-500">Loading meeting bulletins...</p>
            </div>
          )}

          {status === "authenticated" && bulletinError && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6 text-center">
              <p className="text-red-600 text-sm">{bulletinError instanceof Error ? bulletinError.message : "Failed to load bulletins"}</p>
            </div>
          )}

          {status === "authenticated" && !loadingBulletins && !bulletinError && bulletins.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-16 text-center">
              <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500 font-medium">No Chief & Council bulletins available right now.</p>
              <p className="text-stone-400 text-sm mt-1">Please check back soon for new meeting updates.</p>
            </div>
          )}

          {status === "authenticated" && featuredPost && (
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
                {!featuredPost.poster_url && (
                  <div className="mb-4 rounded-xl border border-stone-200 bg-stone-50 p-5 flex items-center gap-3 text-stone-500">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Text bulletin</span>
                  </div>
                )}
                <h2 className="font-bold text-2xl text-stone-800 mb-3 group-hover:text-amber-800 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-stone-600 mb-4 line-clamp-3 text-base leading-relaxed">{featuredPost.subject}</p>
                <div className="flex items-center text-amber-700 font-semibold group-hover:text-amber-800 transition-colors">
                  <span>View Bulletin</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}

          {status === "authenticated" && remainingPosts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-500 px-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Previous Bulletins
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
                        <span className="text-xs font-semibold text-stone-400 uppercase">Chief Council</span>
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

        <section id="videos" className="py-16 md:py-24">
          <SectionHeader
            number="02"
            title="Previous Meeting Videos"
            subtitle="Watch recorded Chief and Council sessions from the official Vimeo playlist"
          />

          {videos.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-12 text-center">
              <Video className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600">No videos in the playlist yet.</p>
            </div>
          )}

          {activeVideo && (
            <div className="grid lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-200 bg-gradient-to-r from-stone-50 to-amber-50/40">
                  <h3 className="text-lg md:text-xl font-bold text-stone-800">{activeVideo.title}</h3>
                  <p className="text-sm text-stone-600 mt-1">{activeVideo.description}</p>
                  {activeVideo.recordedAt && (
                    <p className="text-xs text-stone-500 mt-2">
                      Recorded: {new Date(activeVideo.recordedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>

                <div className="relative w-full overflow-hidden bg-black" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={`https://player.vimeo.com/video/${activeVideo.id}?badge=0&autopause=0&player_id=0&app_id=58479`}
                    title={activeVideo.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
                  <h4 className="text-sm font-bold text-stone-700 uppercase tracking-wide">Playlist</h4>
                  <p className="text-xs text-stone-500 mt-1">Add new recordings in src/data/tcn-matters-videos.json</p>
                </div>
                <div className="p-2 max-h-[520px] overflow-y-auto">
                  {videos.map((video, index) => {
                    const isActive = video.id === activeVideo.id
                    return (
                      <button
                        key={video.id}
                        onClick={() => setActiveVideoId(video.id)}
                        className={`w-full text-left rounded-xl p-3 mb-2 border transition-all ${
                          isActive
                            ? "border-amber-300 bg-amber-50"
                            : "border-stone-200 bg-white hover:border-amber-200 hover:bg-amber-50/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1.5 rounded-lg ${isActive ? "bg-amber-200" : "bg-stone-100"}`}>
                            <Play className={`w-3.5 h-3.5 ${isActive ? "text-amber-700" : "text-stone-500"}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Video {index + 1}</p>
                            <p className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2">{video.title}</p>
                            {video.recordedAt && (
                              <p className="text-xs text-stone-500 mt-1">
                                {new Date(video.recordedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
