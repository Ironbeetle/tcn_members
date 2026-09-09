"use client"
import { useState, useEffect, useRef } from "react"
import {UserSessionBar} from "@/components/UserSessionBar"
import { 
  Cpu, 
  Leaf, 
  MessageSquare, 
  Globe, 
  Code, 
  Camera, 
  Gamepad2, 
  Shield, 
  Factory, 
  Wrench,
  Smartphone,
  Mail,
  FileText,
  Users,
  Lightbulb,
  Sparkles,
  ChevronDown,
  Zap,
  BookOpen,
  Target,
  Monitor,
  Rocket
} from "lucide-react"


export default function TCN_Youth_Comm() {
 

  return (
    <div className="min-h-screen genbkg scroll-smooth">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      {/* Mobile Section Nav - removed backdrop-blur for performance */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-amber-900 border-b border-amber-700/50 overflow-x-auto will-change-transform">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">
         
        </div>
      </div>

     

      {/* Main Content */}
      <main>
        
      
      </main>
    </div>
  )
}
