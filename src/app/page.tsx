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
      <div className="w-full h-screen absolute top-0 z-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full gap-8 p-4 lg:p-8">
          <div className="flex flex-col justify-center items-center">
            <div className="techtxtmbb mb-4 lg:mb-6 text-center">
                TCN Member Portal
              </div>
            <div className="flex flex-col justify-start items-center p-1">
                <motion.img
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                  src="/tcngroup1.png"
                  alt="Tataskweyak Cree Nation Logo"
                  className="w-full self-center"
                  style={{ objectFit: 'cover', height: 'auto' }}
                />
            </div>
          </div>
          <div className="flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md h-auto">
              
              <Link href="/TCN_Enter" className='panelalt h-auto'>
              <div className="techtxtmb flex flex-col justify-center items-center p-2 h-full">
                <Image src='/tcnlogosm.png' 
                  className='object-contain'
                  width={150}
                  height={150}
                  alt='TCN Logo'  
                />
                Enter
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