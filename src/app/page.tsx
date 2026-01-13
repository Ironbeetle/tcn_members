'use client'
import './App.css'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

function page() {
  const logoreveal = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        delay: 0.2,
        duration: 2,
        easeIn: "easeInOut",
      }
    }
  }
  const container = {
    hidden: { opacity: 0, Y: 5 },
    show: {
      opacity: 1,
      Y: 0,
      transition: {
        duration: 2,
        delayChildren: 1,
        staggerChildren: 0.3
      }
    }
  }
  return (
    <div id='apptosee' className='relative w-full min-h-screen'>
      <div className="w-[100vw] h-[100vh] fixed top-0 z-0">
        <img src='/regbkg.jpg' className='w-full h-screen object-cover'/>
      </div>
     
      <div className="h-min-screen w-full overflow-scroll flex flex-col justify-center items-center relative z-10">
        {/* Mobile Layout - Stack vertically */}
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-screen">
          {/* Welcome text and image - smaller on mobile */}
          <div className="flex flex-col justify-center items-center p-4 lg:p-1 order-2 lg:order-1">
            <div className="techtxtmbb text-xl lg:text-base mb-2 lg:mb-12 text-center">
              Tansi TCN Members
            </div>
            <img
              src="/tcngroup1.png"
              alt="Tataskweyak Cree Nation"
              className="w-full max-w-xs lg:max-w-none self-center"
              style={{ objectFit: 'cover', height: 'auto' }}
            />
          </div>
          
          {/* Link menu - Full width and centered on mobile */}
          <div className="flex flex-col justify-center items-center p-4 lg:p-4 order-1 lg:order-2 min-h-[50vh] lg:min-h-0">
            <div className='w-full max-w-sm lg:max-w-none lg:w-4/7 mb-6 lg:mb-12'>
              <Link href="/TCN_Sys_Intro" className='panelalt block'>
                <div className="techtxtmb flex flex-col justify-center items-center p-3 lg:p-2 text-sm lg:text-base">
                  TCN Member Portal Intro
                </div>
              </Link>
            </div>
            
            <div className='w-full max-w-sm lg:max-w-none lg:w-4/7'>
              <Link href="/TCN_Enter" className='panelalt block'>
                <div className="techtxtmb flex flex-col justify-center items-center p-3 lg:p-2 text-sm lg:text-base">
                  Portal
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
export default page