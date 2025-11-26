"use client"
import TCNMap from "@/components/TCNMap"
import { Backbtn } from "@/components/Backbtn"
import { Hamburger } from "@/components/Hamburger"
import '../App.css'

export default function page() {
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
                <div />
                <div />
                <div />
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
            {/* top cnc banner */}
            <div className="h-[4vh] lg:h-[4rem]"/>
            <div className="w-[100vw] h-full">
                <div className="grid grid-cols-1 h-full">
                    <div className="flex flex-col justify-center items-center">
                        <img src='/tcnlogosm.png' className='scale-imagemin'/>
                        <div className="apptext borderbot mb-14">
                        Tataskweyak Cree Nation is located on the shore of
                        Split Lake, Manitoba.
                        </div>
                    </div>
                    <div className="flex flex-col justify-center items-center">
                        <TCNMap/>
                    </div>
                </div>
            </div>
            <div className='h-[5vh] lg:h-[15vh]'/>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 histbkg">
                <div className="flex flex-col justify-center items-center p-4">
                    <img src='/TcnarialVintage.jpg' className='scale-image'/>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <div className="apptext p-4">
                    Tataskweyak Cree First Nation (TCN) has a rich history as one of the original 
                    Ininew peoples who have inhabited northern Manitoba for millenia.
                    </div>
                </div>
            </div>
            <div className='h-[5vh] lg:h-[15vh]'/>
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center items-center">
                    <div className="apptext p-4">
                    Today, we are a thriving first nation of over 4,000 members, and roughly half live in the community.<br/> 
                    We continue to blend traditional practices with modern development, maintaining our language, 
                    cultural values, and connection to the land while embracing education, technology, and economic opportunities.
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center p-4">
                    <img src='/tcnaboutbkg.jpg' className='scale-image'/>
                </div>
            </div>  
            <div className='h-[15vh]'/>
            <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="flex flex-col justify-center items-center p-4">
                    <img src='/Eldersctn.jpg' className='scale-image'/>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <div className="apptext p-4">
                    Our First Nation government includes traditional forms of governance like the Elders' Tribunal and a peacekeepers 
                    system alongside contemporary administrative structures.
                    </div>
                </div>
            </div> 
            <div className='h-[15vh]'/>
            <div className="h-full grid grid-cols-1 lg:grid-cols-1">
                <div className="flex flex-col justify-center items-center p-4">
                    <img src='/tcnlogosm.png' className='scale-imagemin mb-6'/>
                    <div className="apptext borderbot mb-8">
                        Tataskweyak Cree Nation Chief & Council 2025
                    </div>
                    <img src="/TCNCnC2025.jpg" className="scale-imagemax"/>
                </div>
                <div className="w-full flex flex-col justify-center items-center">
                    <div className="flex flex-col justify-center items-center p-4 w-9/10 lg:w-2/3"> 
                        {/* Chief Section - Highlighted */}
                        <div className="w-full mb-6 bg-amber-900/20 rounded-lg p-4 border border-amber-600/30">
                            <div className="text-center">
                                <div className="apptext text-amber-200 font-semibold mb-2 text-lg">
                                    Chief
                                </div>
                                <div className="apptext text-amber-100 text-xl font-bold">
                                    Doreen Spence
                                </div>
                            </div>
                        </div>

                        {/* Councillors Section */}
                        <div className="w-full space-y-3">
                            <div className="text-center mb-4">
                                <div className="apptext text-amber-200 font-semibold text-lg border-b border-amber-600/50 pb-2">
                                    Council Members
                                </div>
                            </div>
                            
                            {[
                                "Ivan Keeper",
                                "Abbie Garson Wavey", 
                                "Joan Ouskan",
                                "Cynthia Ouskan",
                                "Alwyn Keeper",
                                "Jonathon Kitchekeesik"
                            ].map((name, index) => (
                                <div key={index} className="bg-stone-800/30 rounded-md p-3 border border-stone-600/20 hover:bg-stone-700/40 transition-colors duration-200">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-2">
                                        <div className="apptext text-stone-300 text-sm lg:text-left text-center">
                                            Councillor
                                        </div>
                                        <div className="lg:col-span-2 apptext text-stone-100 font-medium lg:text-left text-center">
                                            {name}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}