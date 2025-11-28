'use client'
import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserSessionBar } from '@/components/UserSessionBar';
import { 
  Megaphone, 
  Users, 
  Heart, 
  GraduationCap, 
  Briefcase, 
  Calendar, 
  Bell,
  Filter,
  Pin,
  ArrowLeft
} from 'lucide-react';
import router from 'next/router';


export default function page() {
 
  return (
    <div className="w-full min-h-screen bg-stone-100">
      <div className="fixed top-0 z-100 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
      
      <div className="pt-16 lg:pt-16">
        {/* Back Button */}
        <div className="max-w-[80vw] mx-auto px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
       
      </div>
    </div>
  );
}