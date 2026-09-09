"use client"

import { Backbtn } from "@/components/Backbtn"
import { Users, Globe, ExternalLink, Wifi } from "lucide-react"
import { motion } from "framer-motion"
import { UserSessionBar } from "@/components/UserSessionBar"

type LinkItem = {
  name: string
  url: string
  type: "facebook" | "website"
  description?: string
}

const facebookLinks: LinkItem[] = [
  { name: "Tataskweyak Cree Nation", url: "https://www.facebook.com/groups/Tataskweyak306", type: "facebook", description: "TCN FB Group" },
  { name: "Tataskweyak Health Message Board", url: "https://www.facebook.com/groups/tcnhealth", type: "facebook", description: "TCN FB Group" },
  { name: "Tataskweyak Community Development", url: "https://www.facebook.com/groups/tataskweyakccp", type: "facebook", description: "TCN FB Group" },
  { name: "TCN Employment & Training Opportunities", url: "https://www.facebook.com/groups/1527138060707095", type: "facebook", description: "TCN FB Group" },
  { name: "TCN Resource On-reserve On-line Activities", url: "https://www.facebook.com/groups/987884548774978", type: "facebook", description: "TCN FB Group" },
  
]

const websiteLinks: LinkItem[] = [
  { name: "Chief Sam Cook School", url: "https://www.cscmec.ca/", type: "website", description: "Chief Sam Cook Mahmuwee Education Centre" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

function LinkCard({ item }: { item: LinkItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-xl border border-stone-200 hover:bg-amber-50 hover:border-amber-300 transition-all group cursor-pointer"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
        {item.type === "facebook" ? (
          <Users className="w-5 h-5 text-blue-600" />
        ) : (
          <Globe className="w-5 h-5 text-amber-700" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-800 truncate group-hover:text-amber-700 transition-colors">{item.name}</p>
        {item.description && (
          <p className="text-sm text-stone-500 truncate">{item.description}</p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-stone-400 group-hover:text-amber-700 flex-shrink-0 transition-colors" />
    </a>
  )
}

export default function TCN_Links() {
  return (
    <div className="min-h-screen genbkg scroll-smooth">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 pb-20 pt-24">
        {/* ===== TITLE PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 shadow-xl">
            <div className="absolute inset-0 opacity-50">
              <img src="/panelBKG11.jpg" alt="Links Background" className="w-full h-full object-cover" />
            </div>
            <div className="relative p-6 sm:p-8 lg:p-10 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">TCN Links</h1>
                <p className="text-amber-200 text-sm sm:text-base mt-1">Community Facebook pages and related websites.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== BENTO GRID ===== */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* ----- Facebook Panel ----- */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-5 py-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-white" />
              <h2 className="font-bold text-white text-base">Facebook Pages</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {facebookLinks.length > 0 ? (
                facebookLinks.map((item) => <LinkCard key={item.url} item={item} />)
              ) : (
                <p className="text-stone-400 text-sm italic py-4 text-center">Links coming soon.</p>
              )}
            </div>
          </motion.div>

          {/* ----- Websites Panel ----- */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-700 to-amber-900 px-5 py-4 flex items-center gap-3">
              <Globe className="w-5 h-5 text-white" />
              <h2 className="font-bold text-white text-base">Websites</h2>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {websiteLinks.length > 0 ? (
                websiteLinks.map((item) => <LinkCard key={item.url} item={item} />)
              ) : (
                <p className="text-stone-400 text-sm italic py-4 text-center">Links coming soon.</p>
              )}
            </div>
          </motion.div>
        </motion.div>

      </main>
    </div>
  )
}
