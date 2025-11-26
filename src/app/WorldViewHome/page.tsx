"use client"
import { Backbtn } from "@/components/Backbtn"
import { motion } from "framer-motion"
import { Hamburger } from "@/components/Hamburger"
import '../App.css'


export default function WorldViewHome() {
    const menuItems = [
        { 
      label: "About Tataskweyak", 
      to: "/pages/AboutTCN", 
      color: "stone" as const 
    },
    { 
      label: "About Who We Are", 
      to: "/pages/WorldViewHome", 
      color: "stone" as const 
    },
    { 
      label: "Photo Gallery", 
      to: "/pages/PhotoGallery", 
      color: "stone" as const 
    },
    { 
      label: "Home", 
      to: "/", 
      color: "stone" as const 
    },
    ]
    // Desktop Navigation
    const DesktopNav = () => (
        <div className="hidden lg:block">
            <div className="bg-amber-900 backdrop-blur-sm border-b border-amber-600/50">
                <div className="grid grid-cols-4 gap-4 h-full items-center px-4">
                <Backbtn />
                <div/>
                <div/>
                <div/>
                </div>
            </div>
        </div>
    )
    return (
        <div className="w-screen min-h-screen genbkg">
             {/* Navigation */}
            <div className="sticky top-0 z-50">
                <Hamburger menuItems={menuItems} showBackButton={true} />
                <DesktopNav />
            </div>
            {/* hero section */}
            <div className="h-4 lg:h-16 w-full"/>
           <div className="ATKbkg w-full h-auto">
                <div className="flex flex-col lg:flex-row mb-16 p-4">
                    <div className="apptextBold p-4 flex flex-col justify-evenly w-full lg:w-1/2">
                        Forefathers Of The Split Lake Cree 
                    </div>
                    <div className="flex justify-center object-cover p-4">
                        <img src="/historyimg3.jpg"
                            loading="lazy"
                        />
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row mt-16 px-14 py-8">
                    <div className="flex justify-center">
                        <img src="/historyimg1.jpg"
                        className="object-cover"
                        loading="lazy"
                        />
                    </div>
                    <div className="apptextBold p-4 flex flex-col justify-evenly w-full lg:w-1/2">
                        Our ancestors were a water people.<br/>
                        Living along the shores of the lakes
                        and rivers, they hunted and fished,
                        gathering herbs and berries
                        along the shoreline.                       
                    </div>
                </div>
            </div>
            {/*  */}
            <div className="h-0 lg:h-[20vh] w-full"/>
            <div className="w-full">
                <div className="grid lg:grid-cols-2 flex justify-center">
                    <div className="flex justify-center">
                        <img src="/traditionalhunters.png" loading="lazy" className="object-cover"/>
                    </div>
                    <div className="flex flex-col justify-center p-4">
                        <div className="apptextlgB justify-self-center p-4">
                            Centuries of observation and experience has given our people, 
                            an invaluable intimate knowledge of our homeland ecosystem.
                        </div>  
                    </div>
                </div>
            </div>
            {/*  */}
            <div className="h-[5vh] lg:h-[20vh] w-full"/>
            <div className="w-full">
                <div className="grid lg:grid-cols-2 flex justify-center">
                    <div className="flex flex-col justify-center p-4">
                        <div className="apptextlgB p-4">
                        This intimate knowledge, enabled the
                        identification and selection of the
                        most useful and fruitful areas for
                        residence and harvesting.
                        </div>
                    </div>
                    <div className="flex justify-center object-cover">
                        <img src="/ATKcirca.png" loading="lazy"/>
                    </div>
                </div>
            </div>
            {/*  */}
            <div className="h-[5vh] lg:h-[20vh] w-full"/>
            <div className="grid lg:grid-cols-2 p-2">
                <div className="flex justify-center object-cover">
                    <img src="/owl.png " loading="lazy"/>
                </div>
                <div className="flex flex-col justify-center p-4">
                    <div className="apptextlgB justify-self-center p-8">
                    Our world view is based on the understanding that<br/><br/>
                    <span className="font-semibold">All Things Are Related And Dependent On One Another.</span><br/><br/> 
                    We are but one component of the living natural world.
                    </div>  
                </div>
            </div>
            {/*  */}
            <div className="h-[4vh] lg:h-[20vh] w-full"/>
            <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center p-4">
                    <div className="apptextlgB justify-self-center p-4">
                        It is this understanding of the <br/>
                        <span><b> Inter-Relatedness of Things</b> </span><br/> 
                        that is the very foundation of our culture and traditions.
                    </div>  
                </div>
                <div className="flex justify-center p-6 object-cover">
                    <img src="/ATKfront.jpg" loading="lazy"/>
                </div>
            </div>
            {/*  */}
            <div className="h-[4vh] lg:h-[20vh] w-full"/>
            <div className="grid lg:grid-cols-2">
                <div className="flex justify-center p-4 object-cover">
                    <img src="/ATKcircanew.png" loading="lazy"/>
                </div>
                <div className="flex flex-col justify-center p-4">
                    <div className="apptextlgB justify-self-center p-4">
                    We teach the values, beliefs and priorities that govern our relationship 
                    with Mother Earth and all her beings.
                    </div>  
                </div>
            </div>
            {/*  */}
            <div className="h-[4vh] lg:h-[20vh] w-full"/>
            <div className="tcnvision flex flex-col justify-evenly items-center h-screen">
                <div className="w-9/12 flex flex-col justify-evenly items-center h-full">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }} 
                        className="apptextlgBold">
                            Adapt & Prosper
                    </motion.span>
                    <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}    
                        className="apptextw bg-[rgba(25,25,25,0.4)] backdrop-blur-lg p-4">
                        As we modernize and evolve,
                        our traditional pursuits and respect for cultural practices and
                        customs are not forgotten.    
                    </motion.span>                  
                </div>
                <div className="flex justify-center">
                    <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1 ,staggerChildren: 1.5 }}
                    className="grid grid-cols-4"
                    >
                        <motion.img
                            initial={{ opacity: 0  }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 1.5 ,ease: "easeInOut" }}
                            className="object-cover staggeritem"
                            loading="lazy"
                            src="/ATKimagewinter.jpg"
                        />
                        <motion.img
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 1.7 ,ease: "easeInOut" }}
                            className="object-cover staggeritem"
                            loading="lazy"
                            src="/tradlife2.jpg"
                        />
                        <motion.img
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 1.9 ,ease: "easeInOut" }}
                            className="object-cover staggeritem"
                            loading="lazy"
                            src="/pilotTCN.jpg"
                        />
                        <motion.img
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5, delay: 2.1 ,ease: "easeInOut" }}
                            className="object-cover"
                            loading="lazy"
                            src="/watertest1A.png"
                        />
                    </motion.div>
                </div>
            </div>
       
       
       
        </div>
    )
}