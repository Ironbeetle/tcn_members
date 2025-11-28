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
          <img src='/TCNMap.jpg' className='w-full h-screen object-cover'/>
        </div>
        <div className='block lg:hidden'>
          <img src='/mobiletcnbkg22.jpg' className='w-full h-screen object-cover'/>
        </div>
      </div>
      <div className="w-full min-h-screen absolute top-0 z-1">
        <div className="h-screen flex flex-col justify-center items-center p-4">
          <div className='w-full lg:w-1/3'>
            <Link href="/TCN_Enter" className='panelalt p-6'>
              <div className="techtxtmb flex flex-col justify-center items-center p-2">
                <Image src='/tcnlogosm.png' 
                  className='object-contain'
                  width={300}
                  height={300}
                  alt='TCN Logo'  
                />
                 Enter
              </div>
            </Link>
          </div>  
        </div>
      </div>
    </div>
  )
}
export default page