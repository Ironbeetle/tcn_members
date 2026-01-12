"use client"
import { BackbtnDark } from "@/components/BackbtnDark"
import { Hamburger } from "@/components/Hamburger"
import { motion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export default function page() {
  const menuItems = [
    { label: "About Tataskweyak", to: "/pages/AboutTCN", color: "stone" as const },
    { label: "About Who We Are", to: "/pages/WorldViewHome", color: "stone" as const },
    { label: "Photo Gallery", to: "/pages/PhotoGallery", color: "stone" as const },
    { label: "Home", to: "/", color: "stone" as const },
  ]

  // Desktop Navigation
  const DesktopNav = () => (
    <div className="hidden lg:block">
      <div className="bg-amber-900/1">
        <div className="flex justify-start items-center px-6 h-16 mt-2">
          <div className="w-[8vw] h-full">
            <BackbtnDark/>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className='w-full min-h-screen genbkg'>
      {/* Nav */}
      <div className="fixed top-0 z-50 w-full">
        <Hamburger menuItems={menuItems} showBackButton={true} />
        <DesktopNav />
      </div>
      {/* <div className="w-full h-full fixed inset-0 z-1 bg-black/55"/> */}
      
      {/* MAIN CONTENT */}
      <section className="relative w-full pt-[8%] flex flex-col items-center justify-center px-2 lg:px-6">
        <div className="w-full">
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
                  This project is more than just building a communications system. It’s about TCN taking the first steps in 
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
                alt="Tataskweyak Cree Nation Logo"
                className="w-full self-center"
                style={{ objectFit: 'cover', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full ">
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
                    alt="Tataskweyak Cree Nation Logo"
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
                  alt="Tataskweyak Cree Nation Logo"
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
                  alt="Tataskweyak Cree Nation Logo"
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
                alt="Tataskweyak Cree Nation Logo"
                className="w-full self-center"
                style={{ objectFit: 'cover', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full ">
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
              alt="Tataskweyak Cree Nation Logo"
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
              alt="Tataskweyak Cree Nation Logo"
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
        <div className="w-full ">
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
                  alt="Tataskweyak Cree Nation Logo"
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
                alt="Tataskweyak Cree Nation Logo"
                className="hidden lg:block w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        <div className="h-[5vh] lg:h-[15vh] w-full"/>
        <div className="w-full ">
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
                    alt="Tataskweyak Cree Nation Logo"
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
                alt="Tataskweyak Cree Nation Logo"
                className="w-full self-center object-cover lg:object-contain h-auto"
              />
            </div>
          </div>
        </div>
        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>

        <div className="w-full ">
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
                  alt="Tataskweyak Cree Nation Logo"
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
              alt="Tataskweyak Cree Nation Logo"
              className="max-w-full object-contain"
              />
            </div>
          </div>
        </div>
        <div className="hidden lg:block h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
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
              When the system launches:
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
                  className="techtxtmb list-disc list-inside mb-6 lg:mb-4"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeInOut" } },
                  }}
                  >
                <span className="techtxtmb">
                  TCN admin will register each member into the database.
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
                  Each member will be assigned a unique barcode ID.
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
                  To activate your account, you will log in with your treaty number and birth date.
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
              alt="Tataskweyak Cree Nation Logo"
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
              You can then update your contact info, 
              and download your barcode ID to your app.
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
              alt="Tataskweyak Cree Nation Logo"
              className="w-full self-center"
              style={{ objectFit: 'contain', height: 'auto' }}
            />
          </div>
        </div>


        <div className="h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
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
              alt="Tataskweyak Cree Nation Logo"
              className="w-full self-center"
              style={{ objectFit: 'contain', height: 'auto' }}
            />
          </div>
        </div>
        <div className="w-full">
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
                alt="Tataskweyak Cree Nation Logo"
                className="w-full self-center"
                style={{ objectFit: 'contain', height: 'auto' }}
              />
            </div>
          </div>
        </div>
        {/* skills viewer desktop */}
        <div className="hidden lg:block w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 w-full mt-6 mb-6">
            <div className="flex justify-center items-center p-6">
              <motion.img
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 , delay: 0.1 ,ease: "easeInOut"}}
                src="/tcndronepilot.png"
                alt="Tataskweyak Cree Nation Logo"
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
                  alt="Tataskweyak Cree Nation Logo"
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
                alt="Tataskweyak Cree Nation Logo"
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
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/3dprinting.png"
                        alt="Tataskweyak Cree Nation Logo"
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
                        alt="Tataskweyak Cree Nation Logo"
                        className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                        decoding="async"
                      />
                    </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/gamedesignteam.png"
                        alt="Tataskweyak Cree Nation Logo"
                        className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                        decoding="async"
                      />
                    </div>
                </CarouselItem>
                <CarouselItem className="md:basis-1/1">
                    <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                      <img
                        src="/serverworking.png"
                        alt="Tataskweyak Cree Nation Logo"
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
      <div className="w-full ">
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
                alt="Tataskweyak Cree Nation Logo"
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
              alt="Tataskweyak Cree Nation Logo"
              className="hidden lg:block w-full self-center object-contain"
            />
          </div>
        </div>
      </div>
      <div className='h-[2vh] lg:h-[25vh]'/>
      <div className="block lg:hidden h-[5px] w-full bg-amber-900 backdrop-blur-sm border-b border-amber-600/50 mt-12 mb-12"/>
        <div className="w-full h-[80vh] mt-6">
          <div className="flex flex-col justify-center items-center w-full mt-6 mb-6">
            <motion.img 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 , ease: "easeInOut"}}
              src='/tcnlogolg.png' 
              className='w-full max-w-[275px] md:max-w-[275px] lg:max-w-[600px]'
            />
          </div>
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
            className="techtxtbb text-center w-full mt-6 mb-6">
            It belongs to us, and it will grow with us.
          </motion.div>
        </div>
      </section>
      <div className='h-[2vh] lg:h-[5vh]'/>
    </div>
  )
}