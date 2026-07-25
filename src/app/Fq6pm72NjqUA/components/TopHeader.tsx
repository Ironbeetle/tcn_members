'use client'

/**
 * Top Header Navigation Component
 * 
 * Matches the desktop TCN Communications app layout with horizontal navigation.
 */

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { cn, getInitials } from '../lib/utils'

interface NavItem {
  id: string
  label: string
  href?: string
  badge?: number
  adminOnly?: boolean
  staffAdminOnly?: boolean
  bandOfficeAdminOnly?: boolean
}

// Staff navigation items
const staffNavItems: NavItem[] = [
  { id: 'home', label: 'Home', href: '/Fq6pm72NjqUA/dashboard' },
]

// Admin navigation items (staff management, personal timesheet/travel, view communications data)
const adminNavItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', href: '/Fq6pm72NjqUA/admin' },
  { id: 'staff', label: 'Staff Manager', href: '/Fq6pm72NjqUA/admin/staff' },
  { id: 'communications', label: 'Communications Data', href: '/Fq6pm72NjqUA/admin/communications' },
  { id: 'bulletin-db', label: 'Bulletin DB', href: '/Fq6pm72NjqUA/admin/bulletin-manager', bandOfficeAdminOnly: true },
]

// Staff Admin navigation items (staff mgmt, view timesheets all depts, memos all depts, staff activity stats)
const staffAdminNavItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', href: '/Fq6pm72NjqUA/staff-admin' },
  { id: 'staff', label: 'Staff Manager', href: '/Fq6pm72NjqUA/admin/staff' },
  { id: 'timesheets', label: 'Timesheets', href: '/Fq6pm72NjqUA/admin/timesheets' },
  { id: 'memos', label: 'Office Memos', href: '/Fq6pm72NjqUA/admin/memos' },
]

// Finance navigation items (view approved travel forms, export CSV, view memos)
const financeNavItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', href: '/Fq6pm72NjqUA/finance' },
  { id: 'travel', label: 'Travel Forms', href: '/Fq6pm72NjqUA/admin/travel' },
  { id: 'memos', label: 'Office Memos', href: '/Fq6pm72NjqUA/admin/memos' },
]

// Department Admin navigation items (dept approvals, dept memos, communications, view forms)
const deptAdminNavItems: NavItem[] = [
  { id: 'home', label: 'Dashboard', href: '/Fq6pm72NjqUA/dept-admin' },
  { id: 'timesheets', label: 'Timesheets', href: '/Fq6pm72NjqUA/admin/timesheets' },
  { id: 'travel', label: 'Travel Forms', href: '/Fq6pm72NjqUA/admin/travel' },
  { id: 'memos', label: 'Dept Memos', href: '/Fq6pm72NjqUA/admin/memos' },
  { id: 'communications', label: 'Communications', href: '/Fq6pm72NjqUA/admin/communications' },
  { id: 'forms', label: 'Posted Forms', href: '/Fq6pm72NjqUA/admin/forms' },
]

type HeaderVariant = 'staff' | 'admin' | 'staff-admin' | 'finance' | 'dept-admin'

function getNavItemsForVariant(variant: HeaderVariant): NavItem[] {
  switch (variant) {
    case 'admin': return adminNavItems
    case 'staff-admin': return staffAdminNavItems
    case 'finance': return financeNavItems
    case 'dept-admin': return deptAdminNavItems
    case 'staff':
    default: return staffNavItems
  }
}

function getTitleForVariant(variant: HeaderVariant): string {
  switch (variant) {
    case 'admin': return 'TCN Admin'
    case 'staff-admin': return 'TCN Staff Admin'
    case 'finance': return 'TCN Finance'
    case 'dept-admin': return 'TCN Department Admin'
    case 'staff':
    default: return 'TCN Communications'
  }
}

interface TopHeaderProps {
  variant: HeaderVariant
  badges?: { [key: string]: number }
}

export function TopHeader({ variant, badges = {} }: TopHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAdmin, isStaffAdmin, dashboardPath } = useStaffAuth()

  const navItems = getNavItemsForVariant(variant)

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.staffAdminOnly && !isStaffAdmin) return false
    if (item.bandOfficeAdminOnly && !(user?.role === 'ADMIN' && user?.department === 'BAND_OFFICE')) return false
    return true
  })

  const isActive = (item: NavItem) => {
    if (!item.href) return false
    if (item.id === 'bulletin-db') {
      return pathname.startsWith('/Fq6pm72NjqUA/admin/bulletin-manager')
    }
    // Handle home/dashboard exact match
    if (item.id === 'home') {
      return pathname === item.href
    }
    // Handle communications submenu
    if (item.id === 'communications') {
      if (pathname.startsWith('/Fq6pm72NjqUA/admin/bulletin-manager')) return false
      return pathname.includes('/communications') || 
             pathname.includes('/sms') || 
             pathname.includes('/email') || 
             pathname.includes('/bulletin')
    }
    // Handle staff tools submenu
    if (item.id === 'staff' && variant === 'staff') {
      return pathname.includes('/memos') || 
             pathname.includes('/timesheets') || 
             pathname.includes('/travel')
    }
    return pathname.startsWith(item.href)
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/Fq6pm72NjqUA/login')
  }

  const isAdminVariant = variant !== 'staff'
  const title = getTitleForVariant(variant)

  return (
    <header className={cn(
      "dashboard-header flex justify-between items-center px-6 py-3 border-b border-[rgba(31,41,55,0.25)]",
      isAdminVariant ? "admin-header bg-gradient-to-r from-[#475569] to-[#64748B]" : ""
    )}>
      {/* Brand + Navigation */}
      <div className="header-brand flex items-center gap-8">
        <h1 className="text-xl font-bold bg-gradient-to-r from-[#F4F7FB] to-[#FFFFFF] bg-clip-text text-transparent">
          {title}
        </h1>
        
        {/* Navigation Tabs */}
        <nav className="header-nav hidden md:flex items-center gap-1">
          {filteredNavItems.map((item) => {
            const active = isActive(item)
            const badgeCount = badges[item.id] || 0
            
            return (
              <Link
                key={item.id}
                href={item.href || '#'}
                className={cn(
                  "nav-button relative px-4 py-2 rounded-md text-sm font-medium transition-all",
                  active 
                    ? "text-[#F4F7FB] bg-[rgba(31,41,55,0.3)]" 
                    : "text-[rgba(244,247,251,0.8)] hover:text-[#F4F7FB] hover:bg-[rgba(31,41,55,0.2)]"
                )}
              >
                {item.label}
                {badgeCount > 0 && (
                  <span className="nav-badge absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-bold rounded-full bg-staff-accent text-staff-dark">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* User Info + Actions */}
      <div className="header-user flex items-center gap-4">
        {/* Dashboard Switch */}
        {isStaffAdmin && variant === 'staff' && (
          <Link
            href={dashboardPath}
            className="text-sm text-[rgba(244,247,251,0.75)] hover:text-[#F4F7FB] transition-colors"
          >
            Admin Panel →
          </Link>
        )}
        {variant !== 'staff' && (
          <Link
            href="/Fq6pm72NjqUA/dashboard"
            className="text-sm text-[rgba(244,247,251,0.75)] hover:text-[#F4F7FB] transition-colors"
          >
            Staff Dashboard →
          </Link>
        )}

        {/* User Info */}
        {user && (
          <span className="user-info flex flex-col items-end">
            <span className="user-name text-sm font-medium text-[#F4F7FB]">
              {user.name}
            </span>
            <span className={cn(
              "user-role text-xs",
              isAdminVariant ? "text-[rgba(244,247,251,0.65)]" : "text-[rgba(244,247,251,0.65)]"
            )}>
              {user.role}{user.department ? ` • ${user.department.replace(/_/g, ' ')}` : ''}
            </span>
          </span>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="logout-button px-4 py-2 text-sm font-medium text-[rgba(244,247,251,0.8)] hover:text-[#F4F7FB] rounded-md hover:bg-[rgba(31,41,55,0.2)] transition-all"
        >
          Sign Out
        </button>
      </div>
    </header>
  )
}

// Mobile navigation for smaller screens
export function MobileTopNav({ variant, badges = {} }: TopHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isAdmin, isStaffAdmin } = useStaffAuth()

  const navItems = getNavItemsForVariant(variant)

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false
    if (item.staffAdminOnly && !isStaffAdmin) return false
    if (item.bandOfficeAdminOnly && !(user?.role === 'ADMIN' && user?.department === 'BAND_OFFICE')) return false
    return true
  })

  const isActive = (item: NavItem) => {
    if (!item.href) return false
    if (item.id === 'bulletin-db') {
      return pathname.startsWith('/Fq6pm72NjqUA/admin/bulletin-manager')
    }
    if (item.id === 'home') return pathname === item.href
    if (item.id === 'communications') {
      if (pathname.startsWith('/Fq6pm72NjqUA/admin/bulletin-manager')) return false
      return pathname.includes('/communications') || 
             pathname.includes('/sms') || 
             pathname.includes('/email') || 
             pathname.includes('/bulletin')
    }
    if (item.id === 'staff' && variant === 'staff') {
      return pathname.includes('/memos') || 
             pathname.includes('/timesheets') || 
             pathname.includes('/travel')
    }
    return pathname.startsWith(item.href)
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/Fq6pm72NjqUA/login')
  }

  const isAdminVariant = variant !== 'staff'
  const title = isAdminVariant ? getTitleForVariant(variant) : 'TCN Comms'

  return (
    <>
      {/* Mobile Header */}
      <header className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 border-b border-[rgba(31,41,55,0.25)]",
        isAdminVariant ? "bg-gradient-to-r from-[#475569] to-[#64748B]" : "bg-[#64748B]"
      )}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[#F4F7FB] to-[#FFFFFF] bg-clip-text text-transparent">
            {title}
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-[rgba(244,247,251,0.75)] hover:text-[#F4F7FB]"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-staff-card border-t border-[rgba(100,116,139,0.25)] px-2 py-2">
        <div className="flex items-center justify-around">
          {filteredNavItems.slice(0, 5).map((item) => {
            const active = isActive(item)
            const badgeCount = badges[item.id] || 0
            
            return (
              <Link
                key={item.id}
                href={item.href || '#'}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-all",
                  active 
                    ? "text-staff-accent" 
                    : "text-[rgba(31,41,55,0.6)]"
                )}
              >
                <span className="text-lg">
                  {item.id === 'home' && '🏠'}
                  {item.id === 'communications' && '📨'}
                  {item.id === 'bulletin-db' && '🗄️'}
                  {item.id === 'staff' && '🏢'}
                  {item.id === 'forms' && '📝'}
                  {item.id === 'timesheets' && '⏰'}
                  {item.id === 'travel' && '✈️'}
                  {item.id === 'memos' && '📬'}
                </span>
                <span>{item.label.split(' ')[0]}</span>
                {badgeCount > 0 && (
                  <span className="absolute top-0 right-1 min-w-4 h-4 flex items-center justify-center text-[10px] font-bold rounded-full bg-staff-accent text-staff-dark">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
