"use client"
import { UserSessionBar } from '@/components/UserSessionBar';
import { useRouter } from "next/navigation";
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
import  Link  from "next/link"


export default function page() {
  const router = useRouter();
  
  return (
    <div className="w-full min-h-screen genbkg">
     {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-100 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
     {/* Back Button */}
     <div className="h-[10vh]"/>
        <div className="max-w-[80vw] mx-auto px-4 pt-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      {/* Hero Section */}
      <section className="relative">
        <div className="h-min-screen w-full overflow-hidden flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center w-full h-full lg:h-[90vh]">
            <div className="flex flex-col justify-center items-center p-6 lg:p-1">
              <div className="techtxttitle mb-4 lg:mb-12">
                Local Governance
              </div>
              <div className="techtxtmbb mb-4 lg:mb-12">
                Tataskweyak Cree Nation 2025
              </div>
            </div>
           
          </div>
        </div>
      </section>
    </div>
  )
}