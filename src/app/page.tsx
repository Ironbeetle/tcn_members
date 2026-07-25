'use client'
import './App.css'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

function page() {
  return (
    <div className='relative w-full min-h-screen genbkg'>
      {/* Hero Section */}
      <section className="relative w-full h-[100dvh] flex flex-col justify-center items-center px-4 lg:px-8">
        {/* Logo */}
          <motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src='/Achimowin_Logo.png'
            alt="Tataskweyak Cree Nation Logo"
            className='w-full max-w-[150px] md:max-w-[200px] lg:max-w-[250px] mb-6 lg:mb-10'
          />
          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center mb-8 lg:mb-12"
          >
            <div className="techtxttitle mb-4">
              TCN Achimowin
            </div>
            <div className="techtxtbb mb-4">
              100% TCN created and operated.<br/>
              It belongs to us, and it will grow with us.
            </div>
          </motion.div>
        <div className="w-full lg:max-w-[85%] grid grid-cols-1 md:grid-cols-2">
          <div className='flex flex-col justify-center items-center'>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="w-full max-w-md mx-auto mb-8"
              >
                <Link href="/Achimowin_Intro" className='block'>
                  <div className="relative overflow-hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-white font-bold text-lg lg:text-xl py-5 lg:py-6 px-8 lg:px-12 rounded-xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 border-2 border-amber-500/50">
                    <div className="flex items-center justify-center gap-3">
                      <span>How All This Works</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
          </div>
          <div className='flex flex-col justify-center items-center'>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="w-full max-w-md mx-auto mb-8"
              >
                <Link href="/TCN_Enter" className='block'>
                  <div className="relative overflow-hidden bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:via-amber-500 hover:to-amber-600 text-white font-bold text-lg lg:text-xl py-5 lg:py-6 px-8 lg:px-12 rounded-xl shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:scale-105 border-2 border-amber-500/50">
                    <div className="flex items-center justify-center gap-3">
                      <span>Enter Member Portal</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
          </div>
        </div>

      </section>
    </div>
  )
}
export default page