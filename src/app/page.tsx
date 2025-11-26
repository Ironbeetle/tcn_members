'use client'
import './App.css'
import Link from 'next/link'
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
      <div className="w-full h-screen absolute top-0 z-1">
        <motion.div 
          variants={logoreveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col justify-center items-center min-h-[80vh] lg:min-h-[75vh]"
        >
          <div className="h-[50vh] lg:h-[100vh] w-full flex flex-col justify-start lg:justify-center items-center">
            <img src='/tcnlogolg.png' className='w-full max-w-[275px] md:max-w-[275px] lg:max-w-[600px]'/>
            <div className='h-[20vh] lg:h-0'/>
            <div className="apptextTitle">
              Tataskweyak Cree Nation
            </div>
          </div>
        </motion.div>
        <div className='h-[2vh] lg:h-[40vh]'/>
        
        {/* About Tataskweyak desktop version */}
        <div className="hidden lg:block">
          <div className='flex flex-col justify-center items-center'>
            <div className='panel h-[70vh] w-4/5 panelalt'>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className='flex flex-col justify-end items-center w-full h-full pb-12'
              >
                <div className="apptextBoldw bg-[rgba(25,25,25,0.4)] backdrop-blur-lg mb-6 p-4">
                  About Tataskweyak Cree Nation
                </div>
                <div className="w-full lg:w-1/5">
                  <Link href="/AboutTCN" className='panelalt'>
                    <div className="apptext">
                      Learn More
                    </div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        <div className='h-[0vh] lg:h-[35vh]'/>
        {/* About Tataskweyak mobile version */}
        <div className="block lg:hidden">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className='grid grid-cols-1'>
              <div className="flex flex-col justify-center items-center p-4">
                <div className="w-full">
                  <Link href="/AboutTCN" className="panelalt">
                    <img src='/tcnaboutbkg.jpg'/>
                    <div className="apptextBold flex flex-col justify-center items-center p-4">
                      About Tataskweyak Cree Nation
                    </div>
                  </Link>
                </div>
              </div>
          </motion.div>
        </div>
        <div className='h-[1vh] lg:h-[0vh]'/>
        {/* About Who We Are desktop version */}
        <div className="hidden lg:block">
          <div className='flex flex-col justify-center items-center'>
            <div className='about_tile h-[70vh] w-4/5 panelalt'>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className='flex flex-col justify-end items-center w-full h-full pb-12'
              >
                <div className="apptextBoldw bg-[rgba(25,25,25,0.4)] backdrop-blur-lg mb-6 p-4">
                  About Who We Are
                </div>
                <div className="w-full lg:w-1/5">
                  <Link href="/WorldViewHome" className='panelalt'>
                    <div className="apptext">
                      Learn More
                    </div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        {/* About Who We Are mobile version */}
        <div className="block lg:hidden">
          <div className='h-[1vh]'/>
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className='grid grid-cols-1'>
              <div className="flex flex-col justify-center items-center p-4">
                <div className="w-full">
                  <Link href="/WorldViewHome" className='panelalt'>
                  <img src='/Whoweare.jpg' className='scale-image'/>
                    <div className="apptextBold flex flex-col justify-center items-center p-4">
                      About Who We Are
                    </div>
                </Link>
                </div>
              </div>
          </motion.div>
        </div>
        {/* Manage Territory Desktop */}
        <div className='h-[1vh] lg:h-[35vh]'/>
        <div className="hidden lg:block">
          <div className='flex flex-col justify-center items-center'>
            <div className='territorybkg h-[70vh] w-4/5 panelalt'>
              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className='flex flex-col justify-end items-center w-full h-full pb-12'
              >
                <div className="apptextBoldw bg-[rgba(25,25,25,0.4)] backdrop-blur-lg mb-6 p-4">
                  Managing Our Territory
                </div>
                <div className="w-full lg:w-1/5">
                  <div className="panelalt flex flex-row justify-center backdrop-blur-lg p-8">
                    <a href="https://tcntrsc.ca" target='_blank'>
                      <div className="apptext">
                        Learn More
                      </div>
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Manage Territory Mobile */}
        <div className="block lg:hidden">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className='grid grid-cols-1 lg:grid-cols-2'>
              <div></div>
              <div className="flex flex-col justify-center items-center p-4">
                <div className="w-full lg:w-5/6">
                  <a href="https://tcntrsc.ca" className="panelalt" target='_blank'>
                    <img src='/ourhomebkg.jpg' className='scale-image'/>
                    <div className="apptextBold flex flex-col justify-center items-center p-4">
                      Managing Our Territory
                    </div>
                  </a>
                </div>
              </div>
          </motion.div>
        </div>
        <div className='h-[1vh] lg:h-[25vh]'/>
        {/* Economic Desktop */}
        {/* <div className='h-[1vh] lg:h-[35vh]'/>
        <div className="hidden lg:block">
          <div className='ecdevbkg h-[70vh] w-[100vw] paneshad'>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className='flex flex-col justify-end items-center w-full h-full pb-12'
            >
              <div className="apptextBoldw bg-[rgba(25,25,25,0.4)] backdrop-blur-lg mb-6 p-4">
                  Economic Development
                </div>
              <div className="panelalt flex flex-row justify-center backdrop-blur-lg p-8">
                  <Link to="/pages/TCNEcDev">
                  <div className="apptext">
                    Learn More
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div> */}
        {/* Economic Development Mobile */}
        {/* <div className="block lg:hidden">
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className='grid grid-cols-1 lg:grid-cols-2'>
              <div></div>
              <div className="flex flex-col justify-center items-center p-4">
                <div className="w-full lg:w-5/6">
                  <Link to="/pages/TCNEcDev">
                    <img src='/ourhomebkg.jpg' className='scale-image'/>
                    <div className="apptextBold flex flex-col justify-center items-center p-4">
                      Economic Development
                    </div>
                  </Link>
                </div>
              </div>
          </motion.div>
        </div> */}
        {/* Member portal & Photo Gallery */}
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="grid grid-cols-1 lg:grid-cols-2">
            <div className="flex flex-col justify-center items-center p-4">
              <div className='w-full lg:w-4/5'>
                <Link href="/PhotoGallery" className='panelalt'>
                  <img src='/historyimg4.jpg' className='scale-image'/>
                  <div className="apptextBold flex flex-col justify-center items-center p-4">
                    Photo Gallery
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex flex-col justify-center items-center p-4">
              <div className='w-full lg:w-4/5'>
                <Link href="/TCN_Greet" className='panelalt'>
                  <img src='/bandofficetab.jpg' className='scale-image'/>
                  <div className="apptextBold flex flex-col justify-center items-center p-4">
                    TCN Member Portal
                  </div>
                </Link>
              </div>
            </div>
          </motion.div> 
        </div>
        <div className='h-[1vh] lg:h-[25vh]'/>
        {/* Footer */}
        <div className='grid grid-cols-1 lg:grid-cols-2 bg-black h-[28vh] lg:h-[25vh] w-full'>
          <div className='flex flex-col justify-center items-center text-gray-100 '>
            Contact Info:<br/>
            Tataskweyak Cree Nation<br/>
            Split Lake, MB R0B 1P0<br/>
            Phone: (204) 342-2045<br/>
            Fax: (204) 342-2270<br/>
            Email: tcneception@tataskweyak.ca
          </div>
          <div className='flex flex-col justify-center items-center p-4'>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default page