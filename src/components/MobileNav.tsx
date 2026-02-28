'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  ClipboardList,
  Briefcase,
  User,
  Users,
  FileText,
  BarChart3,
  MessageSquare
} from 'lucide-react';

// Navigation items for bottom nav (matches desktop: Home, Bulletin, Sign-up, Account, Directory)
const primaryNavItems = [
  { title: 'Home', icon: Home, link: '/TCN_Home' },
  { title: 'Bulletin', icon: ClipboardList, link: '/TCN_BulletinBoard' },
  { title: 'Sign-up', icon: FileText, link: '/TCN_Forms' },
  { title: 'Account', icon: User, link: '/Member_Account' },
  { title: 'Directory', icon: Briefcase, link: '/TCN_BandOffice' },
];

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className = '' }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isActive = (link: string) => pathname === link;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg lg:hidden safe-area-bottom ${className}`}>
      <div className="flex items-center justify-evenly h-16 px-1">
        {primaryNavItems.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className={`flex flex-col items-center justify-center w-14 h-full py-2 transition-colors ${
              isActive(item.link) 
                ? 'text-amber-700' 
                : 'text-stone-500 hover:text-amber-600'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.link) ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-1 font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

// Mobile link panels for Stats, TownHall, LocalGovernance
const mobileLinkItems = [
  { 
    title: 'Statistics', 
    icon: BarChart3, 
    link: '/TCN_Stats',
    gradient: 'from-emerald-600 to-emerald-800'
  },
  { 
    title: 'Town Hall', 
    icon: MessageSquare, 
    link: '/TCN_TownHall',
    gradient: 'from-blue-600 to-blue-800'
  },
  { 
    title: 'Governance', 
    icon: Users, 
    link: '/TCN_LocalGovernance',
    gradient: 'from-amber-600 to-amber-800'
  },
];

interface MobileLinkPanelsProps {
  className?: string;
}

export function MobileLinkPanels({ className = '' }: MobileLinkPanelsProps) {
  return (
    <div className={`lg:hidden grid grid-cols-3 gap-2 mb-4 ${className}`}>
      {mobileLinkItems.map((item) => (
        <Link
          key={item.title}
          href={item.link}
          className={`bg-gradient-to-br ${item.gradient} rounded-xl p-3 text-white flex flex-col items-center justify-center hover:opacity-90 transition-opacity`}
        >
          <item.icon className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">{item.title}</span>
        </Link>
      ))}
    </div>
  );
}

// Compact mobile header for inner pages
interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
}

export function MobilePageHeader({ 
  title, 
  subtitle, 
  icon,
  gradient = 'from-amber-700 to-amber-900' 
}: MobilePageHeaderProps) {
  return (
    <div className={`lg:hidden mx-3 sm:mx-4 mt-2 bg-gradient-to-r ${gradient} rounded-2xl p-4 text-white mb-4`}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-lg font-bold">{title}</h1>
          {subtitle && <p className="text-white/80 text-xs">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
