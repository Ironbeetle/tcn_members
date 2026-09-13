"use client"
import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobilePageHeader } from '@/components/MobileNav';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Building2,
  Users,
  Heart,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Home,
  Shield,
  Dumbbell,
  Hotel,
  Baby,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Search,
  Filter,
  Bell
} from 'lucide-react';
import  CouncilBulletin  from '@/components/council_bulletin';
import Chief_Council from '@/components/chief_council';
import Services from '@/components/governance';
import Directory from '@/components/bo_directory';

export default function TCNBandOfficePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div className="w-full min-h-screen genbkg">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>

      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
         
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="contents"
          >
            {/* Mobile Top Selection Bar */}
            <div className="lg:hidden sticky top-16 z-40 -mx-3 sm:-mx-4 mb-4 bg-white/95 backdrop-blur border-b border-stone-200">
              <div className="grid grid-cols-2 items-stretch gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('tab1')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    activeTab === 'tab1'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tab2')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    activeTab === 'tab2'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  ISET
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tab3')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    activeTab === 'tab3'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  On Going Jobs
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tab4')}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                    activeTab === 'tab4'
                      ? 'bg-amber-700 text-white border-amber-700'
                      : 'border-stone-200 text-stone-600 hover:text-amber-700 hover:border-amber-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  T.E.A
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* Left Side Navigation (desktop only) */}
              <div className="hidden lg:block lg:col-span-1">
                {/* === Tab selectors here  === */}
                <TabsList className="p-6 sm:p-8 lg:p-2 h-auto w-full flex-col items-stretch justify-start gap-3 bg-transparent">
                  <TabsTrigger value="tab1" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Building2 className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">Jobs</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab2" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Bell className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">ISET</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab3" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Briefcase className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">On Going Jobs</span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab4" asChild>
                    <div className="group w-full rounded-2xl bg-amber-900/95 backdrop-blur-sm border border-amber-600/50 flex items-center gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-amber-800 data-[state=active]:!bg-amber-900/50 data-[state=active]:ring-2 data-[state=active]:ring-amber-400">
                      <Users className="w-6 h-6 text-amber-50 shrink-0 group-data-[state=active]:text-neutral-800" />
                      <span className="text-lg font-semibold text-amber-50 group-data-[state=active]:text-neutral-800">T.E.A</span>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </div>
              {/* main content */}
              <div className="lg:col-span-5">
                {/* === Selected Tab Content === */}
                <TabsContent value="tab1" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Employment Bulletins go here
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab2" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ISET content goes here
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab3" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    On Going Jobs content goes here
                  </motion.div>
                </TabsContent>
               
                <TabsContent value="tab4" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    T.E.A (Tataskweyak Education Authority) content goes here
                  </motion.div>
                </TabsContent>
              </div>

            </div>
          </Tabs>
        </div>

      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}