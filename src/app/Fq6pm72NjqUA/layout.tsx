/**
 * TCN Staff App - Root Layout
 * 
 * This is the root layout for the staff web application.
 * It provides the auth context and global providers.
 */

import { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { StaffAuthProvider } from './contexts/StaffAuthContext'
import HelpDrawer from './components/HelpDrawer'
import './staff-globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TCN Communications',
  description: 'Staff communication management system for Tataskweyak Cree Nation',
}

export default function StaffAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className}`}>
      <StaffAuthProvider>
        <div className="min-h-screen bg-staff-dark text-staff-primary">
          {children}
        </div>
        <HelpDrawer />
        <Toaster richColors position="top-right" />
      </StaffAuthProvider>
    </div>
  )
}
