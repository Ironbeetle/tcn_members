'use client'
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Home,
  ClipboardList,
  Briefcase,
  User,
  Menu,
  Users,
  FileText,
  ChevronRight,
  Building2,
  Phone,
  MapPin
} from 'lucide-react';

// Navigation items for bottom nav
const primaryNavItems = [
  { title: 'Home', icon: Home, link: '/TCN_Home' },
  { title: 'Bulletin', icon: ClipboardList, link: '/TCN_BulletinBoard' },
  { title: 'Directory', icon: Briefcase, link: '/TCN_BandOffice' },
  { title: 'Account', icon: User, link: '/Member_Account' },
];

// Extended navigation for "More" menu
const moreNavItems = [
  { 
    title: 'Local Governance', 
    description: 'Chief & Council, By-Laws', 
    icon: Users, 
    link: '/TCN_LocalGovernance' 
  },
  { 
    title: 'Community Forms', 
    description: 'Sign-up forms and applications', 
    icon: FileText, 
    link: '/TCN_Forms' 
  },
];

// Quick contact info
const quickContacts = [
  { label: 'Band Office', phone: '(204) 342-2045' },
  { label: 'Health Centre', phone: '(204) 342-2033' },
];

interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className = '' }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const isActive = (link: string) => pathname === link;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-lg lg:hidden safe-area-bottom ${className}`}>
      <div className="flex items-center justify-around h-16 px-2">
        {primaryNavItems.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors ${
              isActive(item.link) 
                ? 'text-amber-700' 
                : 'text-stone-500 hover:text-amber-600'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.link) ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-1 font-medium">{item.title}</span>
          </Link>
        ))}
        
        {/* More Menu Trigger */}
        <Sheet open={moreMenuOpen} onOpenChange={setMoreMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center flex-1 h-full py-2 text-stone-500 hover:text-amber-600 transition-colors">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
            <SheetHeader className="text-left pb-4 border-b border-stone-100">
              <SheetTitle className="text-lg font-bold text-stone-800">Menu</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-4 overflow-y-auto">
              {/* Extended Navigation Links */}
              <div className="space-y-1">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 mb-2">
                  More Services
                </h4>
                {moreNavItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.link}
                    onClick={() => setMoreMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-amber-700" />
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">{item.title}</div>
                        <div className="text-xs text-stone-500">{item.description}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-600" />
                  </Link>
                ))}
              </div>

              {/* Quick Contacts */}
              <div className="pt-4 border-t border-stone-100">
                <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 mb-3">
                  Quick Contacts
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {quickContacts.map((contact) => (
                    <a
                      key={contact.label}
                      href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                      className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl hover:bg-amber-50 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-amber-700" />
                      <div>
                        <div className="text-xs text-stone-500">{contact.label}</div>
                        <div className="text-sm font-medium text-stone-800">{contact.phone}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Emergency */}
              <div className="pt-4 border-t border-stone-100">
                <a
                  href="tel:911"
                  className="flex items-center justify-center gap-2 p-4 bg-red-50 rounded-xl text-red-700 font-medium"
                >
                  <Phone className="w-5 h-5" />
                  <span>Emergency: 911</span>
                </a>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
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
    <div className={`lg:hidden bg-gradient-to-r ${gradient} rounded-2xl p-4 text-white mb-4`}>
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
