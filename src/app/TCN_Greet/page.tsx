import { Backbtn } from "@/components/Backbtn"
import { Hamburger } from "@/components/Hamburger"
import  Link  from "next/link"
import '../App.css'

export default function TCN_Greet() {
  const menuItems = [
    { label: "About Tataskweyak", to: "/pages/AboutTCN", color: "stone" as const },
    { label: "About Who We Are", to: "/pages/WorldViewHome", color: "stone" as const },
    { label: "Photo Gallery", to: "/pages/PhotoGallery", color: "stone" as const },
    { label: "Home", to: "/", color: "stone" as const },
  ]

  // Desktop Navigation
  const DesktopNav = () => (
    <div className="hidden lg:block">
      <div className="bg-amber-900 backdrop-blur-sm border-b border-amber-600/50">
        <div className="flex justify-between items-center px-6 h-16">
          <img
            src="/tcnlogolg.png"
            alt="Tataskweyak Cree Nation Logo"
            className="w-full self-center"
            style={{ maxWidth: '90px', height: 'auto' }}
          />
          <div className="w-[8vw] h-full">
            <Backbtn/>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full min-h-screen genbkg">
      {/* Navigation */}
      <div className="fixed top-0 z-100 w-full">
        <Hamburger menuItems={menuItems} showBackButton={true} />
        <DesktopNav />
      </div>
      <div className="w-full h-[10vh] lg:h-[10vh]"/>
      {/* Hero Section */}
      <section className="relative">
        <div className="h-min-screen w-full overflow-scroll flex flex-col justify-center items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full lg:h-[90vh]">
            <div className="flex flex-col justify-center items-center p-6 lg:p-12">
              <div className="techtxtmbb mb-4 lg:mb-12">
                Tansi Welcome TCN Members
              </div>
              <div className="techtxtmb mt-4 lg:mt-12">
                This section is dedicated to providing Tataskweyak Cree Nation members with easy access to important resources, 
                community updates, and services tailored specifically for us.<br/> 
                We just started this project, and this is the draft version.<br/>  
                Explore the links on the right for information on this system as well as a section for 
                as a demo login.
              </div>
            </div>
            {/* right side link menu */}
            <div className="flex flex-col justify-center items-center p-4">
              <div className='w-full lg:w-5/7 mb-12'>
                <Link href="/TCN_System_Info" className='panelalt'>
                  <img src='/systemintro.jpg' className='scale-image'/>
                  <div className="techtxtmb flex flex-col justify-center items-center p-2">
                    TCN Member Portal Intro
                  </div>
                </Link>
              </div>
             
              <div className='w-full lg:w-5/7'>
                <Link href="/TCN_Enter" className='panelalt'>
                  <img src='/TCNintro.jpg' className='scale-image'/>
                  <div className="techtxtmb flex flex-col justify-center items-center p-2">
                    Enter Portal Here
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}