import { Backbtn } from "@/components/Backbtn"
import { FullPageSlider } from "@/components/FullPageSlider"
import { Slide1 } from "@/components/presentation/section1"
import { Slide2 } from "@/components/presentation/section2"
import { Slide3 } from "@/components/presentation/section3"
import { Slide4 } from "@/components/presentation/section4"
import { Slide5 } from "@/components/presentation/section5"
import { Hamburger } from "@/components/Hamburger"
export default function TCN_Matters() {
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
      <div className="fixed top-0 z-100 w-full h-[5vh]">
        <Hamburger menuItems={menuItems} showBackButton={true} />
        <DesktopNav />
      </div>
      <div className="w-full h-[5vh] lg:h-[6vh]"/>
      {/* Hero Section */}
      <section className="relative">
        <div className="h-min-screen w-full flex flex-col justify-center items-center">

          <div className="full-page-slider w-full h-full lg:h-[94vh]">
            <FullPageSlider>
              {[
                <Slide1 key="1" />,
                <Slide2 key="2" />,
                <Slide3 key="3" />,
                <Slide4 key="4" />,
                <Slide5 key="5" />,
              ]}
            </FullPageSlider>
          </div>
          
        </div>
      </section>
    </div>
  )
}