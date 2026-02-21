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
    <div id='apptosee' className='relative w-full min-h-screen genbkg'>
      {/* Hero Section */}
      <section className="relative w-full min-h-screen flex flex-col justify-center items-center px-4 lg:px-8">
        {/* Background overlay for hero */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/30 z-0" />
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-6xl mx-auto py-12 lg:py-20">
          {/* Logo */}
          <motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            src='/tcnlogolg.png'
            alt="Tataskweyak Cree Nation Logo"
            className='w-full max-w-[200px] md:max-w-[280px] lg:max-w-[350px] mb-6 lg:mb-10'
          />
          
          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-center mb-8 lg:mb-12"
          >
            <h1 className="techtxttitle mb-4">
              Tansi, TCN Members
            </h1>
            <p className="techtxtmb max-w-2xl mx-auto">
              Welcome to the Tataskweyak Cree Nation Member Portal - Your gateway to community services, updates, and connection.
            </p>
          </motion.div>
          
          {/* Prominent Portal Button */}
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
          
          {/* Hero Image */}
          <motion.img
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            src="/tcngroup1.png"
            alt="Tataskweyak Cree Nation Community"
            className="w-full max-w-lg lg:max-w-2xl mt-4"
            style={{ objectFit: 'contain', height: 'auto' }}
          />
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          >
            <span className="techtxtsb mb-2">Learn More</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MAIN CONTENT - TCN Sys Intro */}
      <section className="relative w-full pt-8 lg:pt-[8%] flex flex-col items-center justify-center px-4 lg:px-6">
        <div className="w-full lg:p-6 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 , ease: "easeInOut"}} 
            className="techtxttitle mb-2">
            Community Connect: TCN's Digital Communication & Services System
          </motion.div>
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-4 mb-6">
            <div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}} 
                className="techtxtbbb w-auto mt-6 mb-6">
                Why We Are Doing This
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}} 
                className="techtxtmbb w-full mt-6 mb-6">
                This project has two main purposes:
              </motion.div>
              <ul className="flex flex-col justify-start items-start p-1 lg:p-6">
                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}} 
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-6">
                    <span className="techtxtmbb">Better Communication and Access</span><br/>
                    We want all TCN members to receive timely updates, important notices, 
                    and easy access to services in one central place.
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}} 
                  className="techtxtmb list-disc list-inside mt-6 mb-6">
                  <span className="techtxtmbb">Building Skills and Self-Reliance</span><br/>
                  This project is more than just building a communications system. It's about TCN taking the first steps in 
                  exploring new ways to problem solve and build tools to better the community and create business and
                  job opportunities for everyone.
                </motion.li>
              </ul>
            </div>
            <div className="flex justify-center items-center">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/tcnwebpanel1.png"
                alt="TCN Web Panel"
                className="w-full self-center"
                style={{ objectFit: 'cover', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 w-full mt-6 mb-6">
            <div className="col-span-3 flex flex-col justify-start items-start p-0 lg:p-2">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtbbb w-auto mt-6 mb-6">
                How the System Works
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb w-full">
                Think of this system like a set of useful apps that all connect together on a private network. 
                <br/>Each app has a specific purpose, but all share a common data source at the center.
              </motion.div>
              <div className="block lg:hidden mt-6 lg:mt-0 mb-6 lg:mb-0">
                <div className="bg-black/25 p-2 rounded-full overflow-hidden shadow-xl">
                  <motion.img
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                    src="/tcnsystemdiagram.png"
                    alt="TCN System Diagram"
                    className="w-full self-center"
                    style={{ objectFit: 'cover', height: 'auto' }}
                  />
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-3">
                Some useful apps include:
              </motion.div>
              <ul className="flex flex-col justify-center items-start p-1 lg:p-6">
                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                    <span className="techtxtmbb">Band Office</span><br/>
                    For access to band office services and information.
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Bulletin Board</span><br/>
                  For posting and viewing community announcements.
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Event Manager</span><br/>
                  For managing community events and traditional land use programs.
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Public Alerts</span><br/>
                  Quick access to public safety information and alerts.
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Buy & Sell Marketplace</span><br/>
                  A platform for community members to buy, sell, and trade goods and services.
                </motion.li>
              </ul>
            </div>

            <div className="col-span-2 flex justify-center items-center">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                className="hidden lg:block bg-black/25 p-2 rounded-full overflow-hidden shadow-xl">
                <img
                  src="/tcnsystemdiagram.png"
                  alt="TCN System Diagram"
                  className="w-full self-center"
                  style={{ objectFit: 'cover', height: 'auto' }}
                />
              </motion.div>
            </div>
          </div>
          <div className="block lg:hidden h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>

          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mb-6">
            <div className="flex flex-col justify-center items-start p-1 lg:p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , ease: "easeInOut"}}
                className="techtxtmbb mb-2 lg:mb-6">
                Data Ownership and Privacy
              </motion.div>
              <div className="block lg:hidden flex justify-center items-center">
                <motion.img
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                  src="/dataprivate.png"
                  alt="Data Privacy"
                  className="w-full self-center"
                  style={{ objectFit: 'cover', height: 'auto' }}
                />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb mt-0 lg:mt-4">
                Critical data is securely stored locally with a private and encrypted link to a cloud server. 
                <br/>TCN has full control of it's data and access.
              </motion.div>
            </div>
            <div className="hidden lg:block flex justify-center items-center">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/dataprivate.png"
                alt="Data Privacy"
                className="w-full self-center"
                style={{ objectFit: 'cover', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full lg:p-6 mx-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
          className="techtxtbbb w-max mt-6 mb-6 flex flex-col justify-center items-start">
          Communication Channels
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-6 mb-6">
          <div className="flex flex-col justify-start items-center h-full">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
              className="techtxtmb w-full mt-6 mb-6">
              To reach members quickly and reliably, the system will support:
            </motion.div>
            <ul className="flex flex-col justify-center items-start p-1 lg:p-6">
              <motion.li 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Text Messages (SMS)</span><br/>
                  For urgent alerts or direct contacts.
              </motion.li>

              <motion.li 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}}
                className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                <span className="techtxtmbb">Email Notifications</span><br/>
                For more detailed news and updates.
              </motion.li>

              <motion.li 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                <span className="techtxtmbb">Push Notifications</span><br/>
                Quick alerts to your phone or device if you have the app.
              </motion.li>
            </ul>
            <motion.img
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 , delay: 0.6 ,ease: "easeInOut"}}
              src="/sittingonatv.png"
              alt="Member on ATV"
              className="hidden lg:block w-full self-center"
                style={{ maxWidth: '550px', height: 'auto' }}
            />
          </div>
          <div className="flex flex-col justify-center items-center">
           <motion.img
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 , delay: 0.7 ,ease: "easeInOut"}}
              src="/tcnmaletruck.png"
              alt="TCN Member"
              className="w-full self-center"
              style={{ objectFit: 'contain', height: 'auto' }}
            />
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}}
          className="flex justify-center items-center techtxtbb w-full mt-6 mb-6">
          This means no matter how you prefer to stay connected, we have a way to reach you.
        </motion.div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="h-[2vh] lg:h-[5vh] w-full"/>
        <div className="w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mb-6">
            <div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtbbb w-auto mt-6 mb-6">
                The Heart of the System: TCN Member Database
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6">
                At the center is a secure database that holds basic information about every TCN member. 
              </motion.div>
              <div className="block lg:hidden flex justify-center items-center">
                <motion.img
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                  src="/centralmemberdb.png"
                  alt="Central Member Database"
                  className="w-full self-center"
                  style={{ objectFit: 'contain', height: 'auto' }}
                />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6">
                This is carefully managed by TCN staff and will allow us to:
              </motion.div>
              <ul className="flex flex-col justify-start items-start p-1 1g:p-6">
                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                    <span className="techtxtmbb">Keep contact information up to date</span>
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6 , delay: 0.5 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                    <span className="techtxtmbb">Better organize community programs</span>
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.7 , delay: 0.5 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Provide quick support in emergencies</span>
                </motion.li>

                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 , delay: 0.5 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmbb">Give members access to digital services</span>
                </motion.li>
              </ul>
            </div>
            <div className="flex justify-center items-center p-1 lg:p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.6 ,ease: "easeInOut"}}
                src="/centralmemberdb.png"
                alt="Central Member Database"
                className="hidden lg:block w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="h-[5vh] lg:h-[15vh] w-full"/>
        <div className="w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-6 mb-6">
            <div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtbbb w-auto mt-6 mb-6">
                Fast & Easy Identification
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6 lg:mb-12">
                Every registered TCN member will be given a Digital ID in the form of a barcode.<br/>
              </motion.div>
              <div className="flex justify-center items-center p-6 lg:p-0">
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                  className="border-2 border-amber-900 rounded-lg mb-4 mr-4 overflow-hidden shadow-xl" style={{ backgroundColor: 'white' }}>
                  <img
                    src="/TCNbar_code.jpg"
                    alt="TCN Barcode"
                    className="w-full self-center"
                    style={{ maxWidth: '378px', height: 'auto' }}
                  />
                </motion.div>
                
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6 lg:mb-12">
                It can be downloaded to a mobile app, or printed on a card.
              </motion.div>
            </div>
            <div className="flex justify-center items-center">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.7 ,ease: "easeInOut"}}
                src="/phoneappview.png"
                alt="Phone App View"
                className="w-full self-center object-cover lg:object-contain h-auto"
              />
            </div>
          </div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>

        <div className="w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-6 mb-6">
            <div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtmbb w-full  mt-2 lg:mt-12 mb-6">
                Here's why it's useful:
              </motion.div>
              <ul className="flex flex-col justify-start items-start p-1 lg:p-6">
                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                    <span className="techtxtmb">
                      In urgent situations (like forest fire evacuations), 
                      scanning a barcode can give quicker check-ins, 
                      fewer errors, and faster access to emergency support.
                    </span>
                </motion.li>
                <motion.li 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4">
                  <span className="techtxtmb">
                    It gives members a simple way to identify themselves
                    for community services, health programs, recreation events, and more.
                  </span>
                </motion.li>
              </ul>
              <div className="block lg:hidden flex justify-center items-center">
                <motion.img
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                  src="/barcodescanned.png"
                  alt="Barcode Scanned"
                  className="w-full self-center"
                  style={{ objectFit: 'cover', height: 'auto' }}
                />
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.6 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6">
                Once the system is set up, we can use it for many purposes, such as:
              </motion.div>
              <div className="w-full mt-6 mb-6">
                <motion.ul
                  className="flex flex-col justify-start items-start p-1 lg:p-6"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{
                  hidden: { opacity: 1 },
                  show: {
                    opacity: 1,
                    transition: { delay: 0.3, staggerChildren: 0.12, delayChildren: 0.1 },
                  },
                  }}
                >
                  <motion.li
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Community Services Management
                  </span>
                  </motion.li>
                  <motion.li
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Emergency Preparedness
                  </span>
                  </motion.li>
                  <motion.li
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Health Information and Outreach
                  </span>
                  </motion.li>
                  <motion.li
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Recreation and Event planning
                  </span>
                  </motion.li>
                  <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Public Utilities Coordination
                  </span>
                  </motion.li>
                  <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Traditional Land Use Programs
                  </span>
                  </motion.li>
                </motion.ul>
              </div>
            </div>
            <div className="hidden lg:flex h-full flex-col justify-center items-center">
              <motion.img
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeInOut" }}
              src="/barcodescanned.png"
              alt="Barcode Scanned"
              className="max-w-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="hidden lg:block h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-6 mb-6">
            <div className="flex flex-col justify-center items-start p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , ease: "easeInOut"}}
                className="techtxtbbb w-auto mt-6 mb-6">
                The Registration Process
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6">
                System is now live and can accept account activations. Here's how it works:
              </motion.div>
              <motion.ul
                    className="flex flex-col justify-start items-start p-1 lg:p-8"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{
                    hidden: { opacity: 1 },
                    show: {
                      opacity: 1,
                      transition: { delay: 0.3, staggerChildren: 0.12, delayChildren: 0.1 },
                    },
                    }}
                  >
                <motion.li
                    className="techtxtmb list-disc list-inside mb-6 lg:mb-4"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                    }}
                    >
                  <span className="techtxtmb">
                    TCN admin has entered each member into the Master database.
                  </span>
                </motion.li>
                <motion.li
                    className="techtxtmb list-disc list-inside mb-4"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                    }}
                    >
                  <span className="techtxtmb">
                    Each TCN member has been assigned a unique barcode ID.
                  </span>
                </motion.li>
                <motion.li
                    className="techtxtmb list-disc list-inside mb-4"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                    }}
                    >
                  <span className="techtxtmb">
                    You must be 18 years of age, or older to activate your account.
                  </span>
                </motion.li>
                <motion.li
                    className="techtxtmb list-disc list-inside mb-4"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                    }}
                    >
                  <span className="techtxtmb">
                    To activate your account, you enter your treaty number and birth date.<br/><br/> 
                    The 10 digit teaty number and date must match exactly or account activation process
                     will be terminated.
                  </span>
                </motion.li>
                <motion.li
                    className="techtxtmb list-disc list-inside mb-4"
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                    }}
                    >
                  <span className="techtxtmb">
                    When you have a match, just follow the setup instructions to activate your account.
                  </span>
                </motion.li>
              </motion.ul>
            </div>
            <div className="flex justify-center items-center p-0 lg:p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/tcngroup1.png"
                alt="TCN Group"
                className="w-full h-auto self-center object-cover lg:object-contain"
              />
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-2 lg:mt-6 mb-6">
            <div className="flex flex-col justify-center items-start p-4">
            
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}              
                className="techtxtmb mt-6"
              >
                Once claimed, your account is securely locked to you.
              </motion.div>
               <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb mt-12">
                When using this app on a mobile phone, you can use your phone's 
                fingerprint authentication feature to log into your account.
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                className="techtxtmb mt-12">
                Registered TCN members will then have access to the network and services.
              </motion.div>
             
            </div>
            <div className="flex justify-center items-center p-0 lg:p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/tcnfemalecouch.png"
                alt="TCN Member"
                className="w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
        </div>

        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-6 mb-6">
            <div className="flex flex-col justify-start items-start p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , ease: "easeInOut"}}
                className="techtxtbbb w-auto mt-2 lg:mt-6 mb-6">
                Community Involvement
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6">
                For this project to succeed , we need TCN members involved in building and maintaining this system.<br/>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb mb-4">
                By building this system ourselves, we are not just creating a tool, we are setting a path to being a self-reliant, 
                future-focused Cree Nation.
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                className="techtxtmb mb-4">
                By demonstrating that creating these things are possible, we are hoping to inspire TCN members to pursue their own projects, in technical fields.
              </motion.div>
            </div>
            <div className="flex justify-center items-center p-0 lg:p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/designteam.png"
                alt="Design Team"
                className="w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full mt-6 mb-6">
            <div className="flex flex-col justify-start items-start p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , ease: "easeInOut"}}
                className="techtxtbbb w-auto mt-6 mb-6">
                Looking Forward
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                className="techtxtmb w-full mt-6 mb-6">
              With some imaginative thinking and proper training we can use various existing technologies to create 
              career and business opportunities in TCN.
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                className="techtxtmb mb-4">
                Aside from app development, there are a variety of interesting and useful skills to learn, such as:
              </motion.div>
              <motion.ul
                  className="flex flex-col justify-start items-start p-1 lg:p-6"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{
                  hidden: { opacity: 1 },
                  show: {
                    opacity: 1,
                    transition: { delay: 0.3, staggerChildren: 0.12, delayChildren: 0.1 },
                  },
                  }}
                >
                <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmb">
                    Drone piloting.
                  </span>
                </motion.li>
                <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmb">
                    Game design & development.
                  </span>
                </motion.li>
                <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmb">
                    Data science & data center operations.
                  </span>
                </motion.li>
                <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmb">
                    3D printing & design.
                  </span>
                </motion.li>
              </motion.ul>
            </div>
            <div className="hidden lg:block flex justify-center items-center p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/3dprinting.png"
                alt="3D Printing"
                className="w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        {/* skills viewer desktop */}
        <div className="hidden lg:block w-full lg:p-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full mt-6 mb-6">
            <div className="flex justify-center items-center p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                src="/tcndronepilot.png"
                alt="TCN Drone Pilot"
                className="w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
            <div className="flex justify-center items-center p-6">
              <motion.img
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                  src="/gamedesignteam.png"
                  alt="Game Design Team"
                  className="w-full self-center"
                  style={{ objectFit: 'contain', height: 'auto' }}
                />
            </div>
            <div className="flex justify-center items-center p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.5 ,ease: "easeInOut"}}
                src="/serverworking.png"
                alt="Server Working"
                className="w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        {/* skills viewer carousel mobile */}
        <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="block lg:hidden w-full"
          >
            <Carousel className="w-full lg:p-6 mx-auto">
              <CarouselContent>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/3dprinting.png"
                        alt="3D Printing"
                        loading="lazy"
                        className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                        decoding="async"
                      />
                    </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/tcndronepilot.png"
                        alt="TCN Drone Pilot"
                        className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                        decoding="async"
                      />
                    </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/gamedesignteam.png"
                        alt="Game Design Team"
                        className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                        decoding="async"
                      />
                    </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/serverworking.png"
                        alt="Server Working"
                        className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                        decoding="async"
                      />
                    </div>
                </CarouselItem>
              </CarouselContent>
              <div className="relative flex justify-evenly gap-4 mt-6">
                <CarouselPrevious className="static bg-amber-100/90 border-amber-300 hover:bg-amber-200/90 text-amber-800" />
                <CarouselNext className="static bg-amber-100/90 border-amber-300 hover:bg-amber-200/90 text-amber-800" />
              </div>
            </Carousel>
          </motion.div>
      <div className="w-full lg:p-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 w-full mt-6 mb-6">
          <div className="col-span-3 flex flex-col justify-center items-start">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 , ease: "easeInOut"}}
              className="techtxtbbb mt-6 mb-6">
              The Bigger Goal
            </motion.div>
            <div className="block lg:hidden flex justify-center items-center">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
                src="/group-photo.png"
                alt="TCN Group Photo"
                className="w-full self-center"
                style={{ objectFit: 'cover', height: 'auto' }}
              />
            </div>
            <motion.ul
                  className="flex flex-col justify-start items-start p-1 lg:p-6"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={{
                  hidden: { opacity: 1 },
                  show: {
                    opacity: 1,
                    transition: { delay: 0.3, staggerChildren: 0.12, delayChildren: 0.1 },
                  },
                  }}
                >
              <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                  <span className="techtxtmbb">
                    Ownership — <br/>
                  </span>
                  TCN controlling our own digital tools.
              </motion.li>
              <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                <span className="techtxtmbb">
                  Learning — <br/>
                </span>
                Teaching skills that create new opportunities in TCN.
              </motion.li>

              <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                <span className="techtxtmbb">
                  Innovation — <br/>
                </span>
                Solving challenges in our own way.
              </motion.li>

              <motion.li
                  className="techtxtmb list-disc list-inside mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                <span className="techtxtmbb">
                  Community — <br/>
                </span>
                Making communication stronger and services easier to access for every member.
              </motion.li>
            </motion.ul>
          </div>
          <div className="col-span-2 flex justify-center items-center">
            <motion.img
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 , delay: 0.4 ,ease: "easeInOut"}}
              src="/group-photo.png"
              alt="TCN Group Photo"
              className="hidden lg:block w-full self-center object-contain"
            />
          </div>
        </div>
      </div>
      <div className='h-[2vh] lg:h-[25vh]'/>
      <div className="block lg:hidden h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
      
      {/* Final CTA Section */}
      <div className="w-full max-w-7xl mx-auto py-12 lg:py-20">
        <div className="flex flex-col justify-center items-center w-full">
          <motion.img 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 , ease: "easeInOut"}}
            src='/tcnlogolg.png' 
            alt="TCN Logo"
            className='w-full max-w-[275px] md:max-w-[275px] lg:max-w-[600px] mb-8'
          />
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
            className="techtxtbb text-center w-full mt-6 mb-6">
            100% TCN created and operated.
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 , delay: 0.2 ,ease: "easeInOut"}}
            className="techtxtbb text-center w-full mt-6 mb-12">
            It belongs to us, and it will grow with us.
          </motion.div>
          
          {/* Final Portal Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="w-full max-w-md mx-auto"
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
      <div className='h-[2vh] lg:h-[5vh]'/>
    </div>
  )
}
export default page