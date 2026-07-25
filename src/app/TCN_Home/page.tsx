'use client'
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobileLinkPanels } from '@/components/MobileNav';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useMediaQuery';
import { 
  Megaphone, 
  Briefcase, 
  Users, 
  GraduationCap, 
  ClipboardSignature,
  Handshake,
  Wifi,
} from 'lucide-react';

const departments = [
  {
    title: 'Contact Directory',
    description: 'Administrative services and member support',
    icon: Briefcase,
    link: '/TCN_BandOffice',
  },
  {
    title: 'Local Governance',
    description: 'Leadership updates and governance information',
    icon: Users,
    link: '/TCN_LocalGovernance',
  },
  {
    title: 'Sign-Up Forms',
    description: 'Access and submit various sign-up forms',
    icon: ClipboardSignature,
    link: '/TCN_Forms',
  },
  {
    title: 'TCN Links',
    description: 'Access to related FaceBook pages and other links',
    icon: Wifi,
    link: '/TCN_Links',
  }
];

const mainTiles = [
  {
    title: 'TCN Bulletin Board',
    description: 'Latest news, announcements, and updates.',
    image: '/tcnbulltintile.jpg',
    alt: 'TCN Bulletin Board',
    link: '/TCN_BulletinBoard',
  },
  {
    title: 'Community Building',
    description: 'Addressing urgent issues facing our community',
    image: '/tcncommbuildtile.jpg',
    alt: 'Community Building',
    link: '/TCN_Matters',
  },
  {
    title: 'Local Services',
    description: 'Addressing urgent issues facing our community',
    image: '/tcnservicestile.jpg',
    alt: 'Local Services',
    link: '/TCN_BandOffice',
  },
  {
    title: 'Employment & Training',
    description: 'Job opportunities, skills training programs, and career development resources for TCN members.',
    image: '/tcnemptraintile.jpg',
    alt: 'Employment & Training',
    link: '/TCN_E_T',
  },
  {
    title: 'Land Stewardship',
    description: 'Keeyask Dam Adverse Effects Programs',
    image: '/tcnlandstewardtile.jpg',
    alt: 'Land Stewardship',
    link: '/TCN_TRSC',
  },
  {
    title: 'TCN Youth',
    description: 'Empowering our youth through activities, mentorship, education, and community engagement programs.',
    image: '/tcnyouthtile.jpg',
    alt: 'TCN Youth',
    link: '/TCN_Youth_Comm',
  },
];


// Stagger animation for children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function TCNHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isDesktop = useIsDesktop();


  // ========== MAIN RENDER ==========
  return (
    <div className="w-full min-h-screen genbkg">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-150 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>

      {/* Main Content Area */}
      <div className="pt-16 pb-20 lg:pb-6">
        <div className="w-full lg:max-w-[85%] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

          {/* Mobile Link Panels */}
          <div className="lg:hidden mb-4">
            <MobileLinkPanels />
          </div>

          {/* ===== TCN ACHIMOWIN GREET PANEL ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative h-[40vh] bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 rounded-2xl overflow-hidden">
              {/* Background image placeholder */}
              <div className="absolute inset-0">
                <img src="/panelBKG11.jpg" 
                  alt="Welcome Background" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8 lg:p-10 h-full">
                {/* Left: Info */}
                <div className="flex flex-col justify-end">
                  <div className="mb-6">
                    <div className="h-full flex items-start justify-start text-white">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0">
                          <Megaphone size={52} className="text-black/50" />
                        </div>
                        <div>
                          <div className="apptext">Tansi, {session?.user?.username}!</div>
                          {/* <div className="apptext">Welcome to TCN Achimowin</div> */}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    
                  </div>
                </div>
                {/* Right: Quick stats / highlights */}
                <div className="flex flex-col justify-end itemes-center lg:items-end">
                  {/* Community Matters */}
                  <motion.div variants={itemVariants} className="w-full">
                    <Link href="/TCN_Matters" className="w-full">
                      
                      <div className="h-full flex flex-col justify-center items-center sm:h-52 w-full achimowinbtn">
                        <div className="w-full flex justify-evenly items-center">
                          <Handshake size={62} className="text-black/50" />
                          <div>
                            <div className="apptextlgB">TCN Achimowin</div>
                          </div>
                        </div>
                        <div className="apptextsmy">Building a stronger Tataskweyak Cree Nation together.</div>
                      </div>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
          {/* ====== quick links panel ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
             
             
               {/* account profile link */}
               <div className="flex flex-col justify-center itemes-center">
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="h-16 bg-gradient-to-r from-amber-700 to-amber-900"></div>
                  <Link href="/Member_Account" className="block">
                    <div className="px-4 pb-4 -mt-8 hover:bg-stone-50 transition-colors rounded-b-2xl cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-2">
                        <Users className="w-8 h-8 text-amber-700" />
                      </div>
                      <h3 className="font-bold text-base text-stone-800">Account Profile</h3>
                      <div className="text-xs text-amber-700 font-medium">View Account →</div>
                    </div>
                  </Link>
                </motion.div>
               </div>
              {/* bandoffice link */}
               <div className="flex flex-col justify-center itemes-center">
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="h-16 bg-gradient-to-r from-amber-700 to-amber-900"></div>
                  <Link href="/Member_Account" className="block">
                    <div className="px-4 pb-4 -mt-8 hover:bg-stone-50 transition-colors rounded-b-2xl cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-2">
                        <Users className="w-8 h-8 text-amber-700" />
                      </div>
                      <h3 className="font-bold text-base text-stone-800">Account Profile</h3>
                      <div className="text-xs text-amber-700 font-medium">View Account →</div>
                    </div>
                  </Link>
                </motion.div>
               </div>
              {/* tcn online links */}
               <div className="flex flex-col justify-center itemes-center">
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="h-16 bg-gradient-to-r from-amber-700 to-amber-900"></div>
                  <Link href="/Member_Account" className="block">
                    <div className="px-4 pb-4 -mt-8 hover:bg-stone-50 transition-colors rounded-b-2xl cursor-pointer">
                      <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-2">
                        <Users className="w-8 h-8 text-amber-700" />
                      </div>
                      <h3 className="font-bold text-base text-stone-800">Account Profile</h3>
                      <div className="text-xs text-amber-700 font-medium">View Account →</div>
                    </div>
                  </Link>
                </motion.div>
               </div>

            

            </div>
          </motion.div>

          {/* ===== BENTO GRID LAYOUT ===== */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5"
          >
            {/* ----- LEFT COLUMN (Desktop): Sidebar items ----- */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
              {/* Profile Card */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-amber-700 to-amber-900"></div>
                <Link href="/Member_Account" className="block">
                  <div className="px-4 pb-4 -mt-8 hover:bg-stone-50 transition-colors rounded-b-2xl cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center mb-2">
                      <Users className="w-8 h-8 text-amber-700" />
                    </div>
                    <h3 className="font-bold text-base text-stone-800">Account Profile</h3>
                    <div className="text-xs text-amber-700 font-medium">View Account →</div>
                  </div>
                </Link>
              </motion.div>

              {/* Quick Links */}
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-700 to-amber-900 px-4 py-3">
                  <h3 className="font-bold text-stone-200 text-sm">Quick Links</h3>
                </div>
                <div className="p-3 space-y-1">
                  {departments.map((dept) => (
                    <Link key={dept.title} href={dept.link}>
                      <div className="p-2 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center flex-shrink-0">
                            <dept.icon className="w-3.5 h-3.5 text-amber-700" />
                          </div>
                          <span className="text-sm font-medium text-stone-700 group-hover:text-amber-700 transition-colors">{dept.title}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

             
            </div>

            {/* ----- MAIN CONTENT AREA ----- */}
            <div className="md:col-span-2 lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {mainTiles.map((tile) => (
                <motion.div key={tile.title} variants={itemVariants}>
                  <Link href={tile.link}>
                    <div className="w-full bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                      <div className="relative h-full overflow-hidden">
                        <img src={tile.image} alt={tile.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                          <h3 className="text-white text-lg font-bold">{tile.title}</h3>
                          <p className="text-stone-300 text-xs mt-0.5">{tile.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              {/* Traditional Learning - Full width bottom */}
              <motion.div variants={itemVariants} className="md:col-span-2">
                <div className="bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-5 sm:p-6 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                        <GraduationCap className="w-6 h-6 text-amber-200" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold">Traditional Learning</h2>
                        <p className="text-amber-200 text-xs font-medium">Coming Soon</p>
                      </div>
                    </div>
                    <p className="text-white/80 text-sm sm:flex-1">
                      Preserving and sharing our language, culture, and traditional knowledge with future generations. Language lessons, cultural workshops, and elder teachings.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}