'use client'

/**
 * Sidebar Navigation Component
 * 
 * Shared sidebar for both Staff and Admin dashboards.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  MessageSquare, 
  Mail, 
  Image, 
  FileText, 
  Clock, 
  Plane,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { cn, getInitials } from '../lib/utils'
import { useState } from 'react'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  adminOnly?: boolean
  staffAdminOnly?: boolean
}

const staffNavItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/communications/sms', icon: MessageSquare, label: 'SMS' },
  { href: '/dashboard/communications/email', icon: Mail, label: 'Email' },
  { href: '/dashboard/communications/bulletin', icon: Image, label: 'Bulletins' },
  { href: '/dashboard/memos', icon: FileText, label: 'Memos' },
  { href: '/dashboard/timesheets', icon: Clock, label: 'Timesheets' },
  { href: '/dashboard/travel', icon: Plane, label: 'Travel Forms' },
  { href: '/dashboard/forms', icon: ClipboardList, label: 'Sign-Up Forms' },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', icon: Home, label: 'Dashboard' },
  { href: '/admin/timesheets', icon: Clock, label: 'Timesheets', staffAdminOnly: true },
  { href: '/admin/travel', icon: Plane, label: 'Travel Forms', staffAdminOnly: true },
  { href: '/admin/memos', icon: FileText, label: 'Office Memos', staffAdminOnly: true },
  { href: '/admin/forms', icon: ClipboardList, label: 'Sign-Up Forms', staffAdminOnly: true },
  { href: '/admin/staff', icon: Users, label: 'Staff Manager', adminOnly: true },
  { href: '/admin/communications/sms', icon: MessageSquare, label: 'SMS' },
  { href: '/admin/communications/email', icon: Mail, label: 'Email' },
  { href: '/admin/communications/bulletin', icon: Image, label: 'Bulletins' },
]

interface SidebarProps {
  variant: 'staff' | 'admin'
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout, isAdmin, isStaffAdmin } = useStaffAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const basePath = `/Fq6pm72NjqUA${variant === 'admin' ? '/admin' : '/dashboard'}`
  const navItems = variant === 'admin' ? adminNavItems : staffNavItems

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.staffAdminOnly && !isStaffAdmin) return false
    return true
  })

  const isActive = (href: string) => {
    const fullPath = `/Fq6pm72NjqUA${href}`
    if (href === '/dashboard' || href === '/admin') {
      return pathname === fullPath
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <aside 
      className={cn(
        "staff-sidebar h-screen bg-staff-card flex flex-col border-r border-white/10",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-[rgba(100,116,139,0.25)] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64748B] to-[#2F5D9B] flex items-center justify-center">
              <span className="text-sm font-bold text-[#F4F7FB]">TCN</span>
            </div>
            <span className="font-semibold text-staff-primary">Communications</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-[rgba(100,116,139,0.15)] transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-staff-secondary" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-staff-secondary" />
          )}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-[rgba(100,116,139,0.25)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-staff-accent/20 flex items-center justify-center">
              <span className="text-sm font-medium text-staff-accent">
                {getInitials(user.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-staff-primary truncate">{user.name}</p>
              <p className="text-xs text-staff-muted truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto staff-scrollbar p-2">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => {
            const active = isActive(item.href)
            const href = `/Fq6pm72NjqUA${item.href}`
            
            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    active 
                      ? "nav-item-active bg-staff-accent/10 text-staff-accent" 
                      : "text-staff-secondary hover:bg-[rgba(100,116,139,0.12)] hover:text-staff-primary"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0", active && "text-staff-accent")} />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-2 border-t border-[rgba(100,116,139,0.25)] space-y-1">
        {/* Switch dashboard link */}
        {isStaffAdmin && variant === 'staff' && (
          <Link
            href="/Fq6pm72NjqUA/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-staff-secondary hover:bg-[rgba(100,116,139,0.12)] hover:text-staff-primary transition-all"
          >
            <Settings className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Admin Panel</span>}
          </Link>
        )}
        {variant === 'admin' && (
          <Link
            href="/Fq6pm72NjqUA/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-staff-secondary hover:bg-[rgba(100,116,139,0.12)] hover:text-staff-primary transition-all"
          >
            <Home className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm">Staff Dashboard</span>}
          </Link>
        )}
        
        {/* Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

// Mobile nav sheet for smaller screens
export function MobileNav({ variant }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout, isAdmin, isStaffAdmin } = useStaffAuth()
  const pathname = usePathname()

  const navItems = variant === 'admin' ? adminNavItems : staffNavItems

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.staffAdminOnly && !isStaffAdmin) return false
    return true
  })

  const isActive = (href: string) => {
    const fullPath = `/Fq6pm72NjqUA${href}`
    if (href === '/dashboard' || href === '/admin') {
      return pathname === fullPath
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-staff-card border-b border-[rgba(100,116,139,0.25)] flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64748B] to-[#2F5D9B] flex items-center justify-center">
            <span className="text-sm font-bold text-[#F4F7FB]">TCN</span>
          </div>
          <span className="font-semibold text-staff-primary">Communications</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-[rgba(100,116,139,0.15)]"
        >
          <Menu className="w-5 h-5 text-staff-secondary" />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-50 bg-[rgba(31,41,55,0.4)]"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute right-0 top-0 bottom-0 w-64 bg-staff-card"
            onClick={e => e.stopPropagation()}
          >
            {/* User info */}
            {user && (
              <div className="p-4 border-b border-[rgba(100,116,139,0.25)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-staff-accent/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-staff-accent">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-staff-primary">{user.name}</p>
                    <p className="text-xs text-staff-muted">{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Nav items */}
            <nav className="p-2">
              <ul className="space-y-1">
                {filteredNavItems.map((item) => {
                  const active = isActive(item.href)
                  const href = `/Fq6pm72NjqUA${item.href}`
                  
                  return (
                    <li key={item.href}>
                      <Link
                        href={href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                          active 
                            ? "nav-item-active bg-staff-accent/10 text-staff-accent" 
                            : "text-staff-secondary hover:bg-[rgba(100,116,139,0.12)] hover:text-staff-primary"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-[rgba(100,116,139,0.25)]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
