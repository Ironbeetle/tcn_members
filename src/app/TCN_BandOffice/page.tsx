"use client"
import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobilePageHeader } from '@/components/MobileNav';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
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
  Filter
} from 'lucide-react';

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
        <div className="max-w-8xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          {/* Desktop Back Button */}
          <div className="hidden lg:block mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="contents"
          >
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* Left Side Navigation */}
              <div className="lg:col-span-1">
                {/* === Tab selectors here  === */}
                <TabsList className="p-6 sm:p-8 lg:p-2 h-auto w-full flex-col items-stretch justify-start gap-0 bg-transparent">
                  <TabsTrigger value="tab1" asChild>
                    <div className="w-full mb-4 rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full data-[state=active]:ring-2 data-[state=active]:ring-amber-600">
                      <div className="relative h-full overflow-hidden">
                        <img src="/bandofficeinside.jpg" alt="User" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                          <div className="apptextwsm">Chief & Council</div>
                        </div>
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab2" asChild>
                    <div className="w-full mb-4 rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full data-[state=active]:ring-2 data-[state=active]:ring-amber-600">
                      <div className="relative h-full overflow-hidden">
                        <img src="/tcnuser.jpg" alt="User" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                          <div className="apptextwsm">Bulletins</div>
                        </div>
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab3" asChild>
                    <div className="w-full mb-4 rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full data-[state=active]:ring-2 data-[state=active]:ring-amber-600">
                      <div className="relative h-full overflow-hidden">
                        <img src="/tcnuser.jpg" alt="User" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                          <div className="apptextwsm">Services</div>
                        </div>
                      </div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="tab4" asChild>
                    <div className="w-full mb-4 rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full data-[state=active]:ring-2 data-[state=active]:ring-amber-600">
                      <div className="relative h-full overflow-hidden">
                        <img src="/tcnuser.jpg" alt="User" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4">
                          <div className="apptextwsm">Directory</div>
                        </div>
                      </div>
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
                    Tab 1 content
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab2" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Tab 2 content
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab3" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Tab 3 content
                  </motion.div>
                </TabsContent>
                <TabsContent value="tab4" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    Tab 4 content
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