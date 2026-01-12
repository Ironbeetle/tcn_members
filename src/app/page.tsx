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
        <div className='hidden lg:block'>
          <img src='/regbkg.jpg' className='w-full h-screen object-cover'/>
        </div>
        <div className='block lg:hidden'>
          <img src='/regbkg.jpg' className='w-full h-screen object-cover'/>
        </div>
      </div>
     
      <div className="h-min-screen w-full overflow-scroll flex flex-col justify-center items-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-screen">
          <div className="flex flex-col justify-center items-center p-1">
            <div className="techtxtmbb mb-4 lg:mb-12">
              Tansi TCN Members
            </div>
            <img
              src="/tcngroup1.png"
              alt="Tataskweyak Cree Nation"
              className="w-full self-center"
              style={{ objectFit: 'cover', height: 'auto' }}
            />
          </div>
          {/* right side link menu */}
          <div className="flex flex-col justify-center items-center p-4">
            <div className='w-full lg:w-4/7 mb-12'>
              <Link href="/TCN_Sys_Intro" className='panelalt'>
                <div className="techtxtmb flex flex-col justify-center items-center p-2">
                  TCN Member Portal Intro
                </div>
              </Link>
            </div>
            
            <div className='w-full lg:w-4/7'>
                <div className="techtxtmb flex flex-col justify-center items-center p-2">
                  <Link href="/TCN_Enter" className='panelalt'>
                    <div className="techtxtmb flex flex-col justify-center items-center p-2">
                      Portal
                    </div>
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
export default page