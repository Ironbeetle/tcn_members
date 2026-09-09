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
    title: 'My Profile',
    description: 'Account information and settings',
    image: '/tcnuser.jpg',
    alt: 'TCN Bulletin Board',
    link: '/Member_Account',
  },
  {
    title: 'Band Office',
    description: 'TCN admin office',
    image: '/bandofficeinside.jpg',
    alt: 'Community Building',
    link: '/TCN_BandOffice',
  },
  {
    title: 'TCN Bulletin Board',
    description: 'Latest news, announcements, and updates.',
    image: '/tcnbulltintile.jpg',
    alt: 'TCN Bulletin Board',
    link: '/TCN_BulletinBoard',
  },
  {
    title: 'Community Meetings',
    description: 'Announcements, and meeting updates.',
    image: '/tcncommbuildtile.jpg',
    alt: 'TCN Matters',
    link: '/TCN_Matters',
  },
  {
    title: 'TCN Health',
    description: 'local health services and resources.',
    image: '/tcnhealth.jpg',
    alt: 'TCN Health',
    link: '/TCN_Health',
  },
  {
    title: 'Local Services',
    description: 'Information about local services.',
    image: '/tcnservicestile.jpg',
    alt: 'Local Services',
    link: '/TCN_LocalServices',
  },
  {
    title: 'Employment & Training',
    description: 'Job opportunities, skills training programs.',
    image: '/tcnemptraintile.jpg',
    alt: 'Employment & Training',
    link: '/TCN_E_T',
  },
  {
    title: 'Land Stewardship',
    description: 'Land use management and conservation.',
    image: '/tcnlandstewardtile.jpg',
    alt: 'Land Stewardship',
    link: '/TCN_TRSC',
  },
  {
    title: 'TCN Links',
    description: 'Related FaceBook pages and other links',
    image: '/tcnlinks.jpg',
    alt: 'TCN Links',
    link: '/TCN_Links',
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
          <div className="mb-6">
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
                    <Link href="/TCN_Achimowin" className="w-full">
                      
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
          </div>
          {/* ===== BENTO GRID LAYOUT ===== */}
          
            {/* ----- MAIN CONTENT AREA ----- */}
            <div className="md:col-span-2 lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              {mainTiles.map((tile) => (
                <motion.div key={tile.title} variants={itemVariants}>
                  <Link href={tile.link}>
                    <div className="w-full bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                      <div className="relative h-full overflow-hidden">
                        <img src={tile.image} alt={tile.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                          <div className="apptextw">{tile.title}</div>
                          <div className="apptextmini">{tile.description}</div>
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


        </div>
      </div>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}