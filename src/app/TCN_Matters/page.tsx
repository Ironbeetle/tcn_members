"use client"
import { useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { UserSessionBar } from "@/components/UserSessionBar"
import { MobileBottomNav, MobilePageHeader } from "@/components/MobileNav"
import { queryBulletins } from "@/lib/actions"
import {
  Calendar,
  Video,
  Megaphone,
  ArrowRight,
  X,
  FileText,
  Play,
  Headphones,
  Users,
  ListVideo,
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
  date: string
  vimeoId: string
  summary: string
  agenda: string[]
}

// Static placeholder library until meetings/recordings have a dedicated API
const meetingVideos: MeetingVideo[] = [
  {
    id: "1",
    title: "Community General Meeting",
    date: "2026-08-14",
    vimeoId: "76979871",
    summary: "Chief and Council update the community on ongoing projects, finances, and upcoming initiatives.",
    agenda: [
      "Opening prayer & welcome",
      "Chief's report",
      "Financial update",
      "Community Q&A",
      "Closing remarks",
    ],
  },
  {
    id: "2",
    title: "Annual General Assembly",
    date: "2026-05-02",
    vimeoId: "76979871",
    summary: "Yearly assembly covering band operations, audits, and elections updates.",
    agenda: [
      "Roll call & quorum",
      "Annual audit review",
      "Departmental reports",
      "New business",
      "Open floor discussion",
    ],
  },
  {
    id: "3",
    title: "Youth & Education Town Hall",
    date: "2026-02-20",
    vimeoId: "76979871",
    summary: "A focused discussion on youth programming, education funding, and student supports.",
    agenda: [
      "Welcome & introductions",
      "Education department update",
      "Youth program highlights",
      "Parent & student feedback",
    ],
  },
]

function getPosterUrl(url: string) {
  if (!url) return ""
  let filename = ""
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      filename = new URL(url).pathname.split("/").pop() || ""
    } catch {
      filename = url.match(/\/([^\/]+)$/)?.[1] || ""
    }
  } else {
    filename = url.split("/").pop() || ""
  }
  return filename ? `/api/poster/${filename}` : ""
}

export default function TCN_Matters() {
  const { status } = useSession()
  const router = useRouter()

  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetingVideos[0].id)
  const [audioMode, setAudioMode] = useState(false)

  const { data: bulletinsData, isLoading, error } = useQuery({
    queryKey: ["bulletins", "COMMUNITY_MEETINGS"],
    queryFn: async () => {
      const result = await queryBulletins({
        category: "COMMUNITY_MEETINGS",
        page: 1,
        limit: 20,
        sortBy: "created",
        sortOrder: "desc",
      })
      if (!result.success) {
        throw new Error(result.error || "Failed to load meeting announcements")
      }
      return result.data
    },
    enabled: status === "authenticated",
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

  const announcements: Bulletin[] = bulletinsData?.bulletins || []

  const selectedMeeting = useMemo(
    () => meetingVideos.find((m) => m.id === selectedMeetingId) || meetingVideos[0],
    [selectedMeetingId]
  )

  const openBulletinModal = useCallback((bulletin: Bulletin) => {
    setSelectedBulletin(bulletin)
    setIsModalOpen(true)
  }, [])

  const closeBulletinModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedBulletin(null)
  }, [])

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen genbkg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/TCN_Enter")
    return null
  }

  return (
    <div className="min-h-screen genbkg">

      {/* Announcement Modal */}
      {isModalOpen && selectedBulletin && (
        <div
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={closeBulletinModal}
        >
          <div className="min-h-full flex items-start justify-center py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-stone-200 bg-gradient-to-r from-amber-700 to-amber-900">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                    Community Meetings
                  </div>
                  <span className="text-white/80 text-xs sm:text-sm hidden sm:inline">
                    {new Date(selectedBulletin.created).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
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

              <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
                {selectedBulletin.poster_url ? (
                  <div className="relative w-full bg-stone-100 flex items-center justify-center">
                    <img
                      src={getPosterUrl(selectedBulletin.poster_url)}
                      alt={selectedBulletin.title}
                      className="w-full h-auto object-contain max-h-[60vh]"
                    />
                  </div>
                ) : selectedBulletin.content ? (
                  <div className="p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-stone-50">
                    <div
                      className="text-stone-700 leading-relaxed font-serif text-base"
                      dangerouslySetInnerHTML={{
                        __html: selectedBulletin.content.replace(/style="[^"]*"/g, "").replace(/&nbsp;/g, " "),
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center text-stone-400 py-12">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    <span>No content available</span>
                  </div>
                )}
                <div className="p-4 sm:p-6 border-t border-stone-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-stone-800 mb-2">{selectedBulletin.title}</h2>
                  <p className="text-sm sm:text-base text-stone-600 whitespace-pre-wrap">{selectedBulletin.subject}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>

      <div className="pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">

          {/* Mobile Header */}
          <div className="lg:hidden mb-4">
            <MobilePageHeader
              title="Community Matters"
              subtitle="Meetings, agendas & recordings"
              icon={<Video className="w-5 h-5" />}
            />
          </div>

          {/* Mobile Section Nav */}
          <div className="lg:hidden sticky top-16 z-40 -mx-3 sm:-mx-4 mb-4 bg-white/95 backdrop-blur border-b border-stone-200">
            <div className="flex items-center gap-2 px-3 py-3 overflow-x-auto">
              <a
                href="#announcements"
                className="shrink-0 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:text-amber-700 hover:border-amber-300 transition-colors"
              >
                Announcements
              </a>
              <a
                href="#current-meeting"
                className="shrink-0 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:text-amber-700 hover:border-amber-300 transition-colors"
              >
                Current Meeting
              </a>
              <a
                href="#video-library"
                className="shrink-0 px-4 py-2 rounded-full border border-stone-200 text-sm font-medium text-stone-600 hover:text-amber-700 hover:border-amber-300 transition-colors"
              >
                Video Library
              </a>
            </div>
          </div>

          {/* Desktop Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white mb-6"
          >
            <div className="flex items-center gap-4 mb-3">
              <Video className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Community Matters</h1>
            </div>
            <p className="text-amber-50">Meeting announcements, live recordings, and agendas from Tataskweyak Cree Nation.</p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

            {/* LEFT: Meeting Announcements */}
            <section id="announcements" className="col-span-1 space-y-3 scroll-mt-32">
              <h2 className="text-sm font-bold text-stone-600 px-1 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Meeting Announcements
              </h2>

              {isLoading && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                  <p className="text-red-600 text-sm">{error instanceof Error ? error.message : "An error occurred"}</p>
                </div>
              )}

              {!isLoading && announcements.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 text-center">
                  <Megaphone className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                  <p className="text-sm text-stone-600">No meeting announcements right now.</p>
                </div>
              )}

              {announcements.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => openBulletinModal(post)}
                  className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group p-4"
                >
                  <div className="flex items-center gap-2 mb-2 text-xs text-stone-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.created).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <h3 className="font-bold text-sm text-stone-800 mb-1 line-clamp-2 group-hover:text-amber-800 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2">{post.subject}</p>
                </motion.div>
              ))}
            </section>

            {/* CENTER: Current Meeting */}
            <section id="current-meeting" className="col-span-1 lg:col-span-2 space-y-4 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
              >
                {/* Video / Audio toggle */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-stone-50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAudioMode(false)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                        !audioMode ? "bg-amber-700 text-white" : "bg-white border border-stone-200 text-stone-600"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Video
                    </button>
                    <button
                      onClick={() => setAudioMode(true)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                        audioMode ? "bg-amber-700 text-white" : "bg-white border border-stone-200 text-stone-600"
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      Audio Only
                    </button>
                  </div>
                  <span className="text-xs text-stone-500 hidden sm:inline">
                    {new Date(selectedMeeting.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* Video screen */}
                {!audioMode ? (
                  <div className="relative w-full bg-black aspect-video">
                    <iframe
                      key={selectedMeeting.vimeoId}
                      src={`https://player.vimeo.com/video/${selectedMeeting.vimeoId}`}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={selectedMeeting.title}
                    />
                  </div>
                ) : (
                  <div className="p-8 bg-stone-50 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                      <Headphones className="w-8 h-8 text-amber-700" />
                    </div>
                    <p className="text-sm font-medium text-stone-700">Audio-only playback isn&apos;t available yet for this meeting.</p>
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-200 text-stone-400 text-sm font-semibold cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      Play Audio
                    </button>
                  </div>
                )}

                {/* Summary & Agenda */}
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-stone-800 mb-2">{selectedMeeting.title}</h2>
                  <p className="text-sm text-stone-600 mb-4">{selectedMeeting.summary}</p>
                  <h3 className="text-xs font-bold text-stone-500 uppercase mb-2">Agenda</h3>
                  <ul className="space-y-1.5">
                    {selectedMeeting.agenda.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </section>

            {/* RIGHT: Video Library + Council Link */}
            <aside id="video-library" className="col-span-1 space-y-4 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 lg:sticky lg:top-24"
              >
                <div className="flex items-center gap-2 mb-4">
                  <ListVideo className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold text-stone-800">Meeting Video Library</h3>
                </div>
                <div className="space-y-2">
                  {meetingVideos.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => setSelectedMeetingId(meeting.id)}
                      className={`w-full p-3 rounded-lg transition-all text-left flex items-start gap-3 ${
                        selectedMeetingId === meeting.id
                          ? "bg-amber-100 border border-amber-300"
                          : "hover:bg-stone-50 border border-transparent"
                      }`}
                    >
                      <div className={`mt-0.5 p-1.5 rounded-full ${selectedMeetingId === meeting.id ? "bg-amber-700" : "bg-stone-300"}`}>
                        <Play className="w-3 h-3 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${selectedMeetingId === meeting.id ? "text-amber-900" : "text-stone-700"}`}>
                          {meeting.title}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(meeting.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              <Link href="/TCN_BandOffice" className="block">
                <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl shadow-lg p-5 text-white hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-white/20">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg">Chief & Council</h3>
                  </div>
                  <p className="text-amber-100 text-sm mb-4">
                    View the current Chief and Council list along with their contact info.
                  </p>
                  <div className="flex items-center text-amber-100 font-medium text-sm group-hover:text-white transition-colors">
                    <span>View Council</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </aside>

          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
