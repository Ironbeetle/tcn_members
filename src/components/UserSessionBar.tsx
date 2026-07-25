"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface UserSessionBarProps {
  showLogo?: boolean
  logoSrc?: string
  className?: string
}

export function UserSessionBar({ 
  showLogo = true, 
  logoSrc = "/tcnlogosm.png",
  className = ""
}: UserSessionBarProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleLogout = async () => {
    const { signOut } = await import("next-auth/react")
    await signOut({ callbackUrl: "/" })
  }

  if (status === "loading") {
    return (
      <div className={`bg-amber-900/95 backdrop-blur-sm border-b border-amber-600/50 ${className}`}>
        <div className="flex justify-between items-center px-4 lg:px-8 h-16">
          {showLogo && <img src={logoSrc} alt="Logo" className="h-10" />}
          <div className="animate-pulse bg-amber-700 h-8 w-32 rounded"></div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return null
  }

  return (
    <div className={`bg-amber-900/95 backdrop-blur-sm border-b border-amber-600/50 ${className}`}>
      <div className="flex justify-between items-center px-4 lg:px-8 h-16">
        {showLogo && (
          <div className="flex items-center gap-4">
            <img src={logoSrc} alt="Logo" className="h-10" />
          </div>
        )}
        <div className="flex items-center gap-4 ml-auto">
          <div className="hidden md:flex items-center gap-2 text-amber-50">
            <span className="text-sm">Welcome,</span>
            <span className="text-sm font-semibold">
              {session?.user?.username}
            </span>
          </div>
          <div className="md:hidden text-amber-50 text-sm font-semibold">
            {session?.user?.username}
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="bg-amber-700 hover:bg-amber-800 text-white border-amber-600"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
