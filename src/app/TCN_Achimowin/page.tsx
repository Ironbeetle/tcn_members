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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Building2,
  Bell,
  Briefcase,
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
              title="Achimowin"
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
              <h1 className="text-2xl font-bold">Achimowin</h1>
            </div>
            <p className="text-amber-50">Building a strong and prosperous Tataskweyak Cree Nation.</p>
          </motion.div>

          {/* Main Content Grid */}
          <Tabs defaultValue="tab1" className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">

            {/* LEFT: Tab Menu and stats */}
            <section id="announcements" className="col-span-1 space-y-3 scroll-mt-32 p-6">
              <h2 className="text-sm font-bold text-stone-600 px-1 flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Member Statistics
              </h2>

              {/* Member Statistics circle graph */}
              <TabsList className="p-6 sm:p-8 lg:p-2 h-auto w-full flex-col items-stretch justify-start gap-3 bg-transparent">
                  <TabsTrigger value="tab1" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Building2 className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">Introduction</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab2" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Bell className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">Development</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab3" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Briefcase className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">Stewardship</span>
                    </div>
                  </TabsTrigger>
                 
                </TabsList>
            </section>

            {/* Right: Content section */}
            <section id="current-meeting" className="col-span-4 space-y-4 scroll-mt-32">
             {/* TABS */}
              {/* === Selected Tab Content === */}
                <TabsContent value="tab1" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Introduction
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab2" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Development
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab3" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Stewardship
                  </motion.div>
                </TabsContent>
            </section>

          </Tabs>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
