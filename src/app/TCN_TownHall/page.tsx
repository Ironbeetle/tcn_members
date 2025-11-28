import { Backbtn } from "@/components/Backbtn"
import { UserSessionBar } from '@/components/UserSessionBar';
import  Link  from "next/link"


export default function page() {
  
  return (
    <div className="w-full min-h-screen genbkg">
     {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-100 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>
     
      <div className="w-full h-[10vh] lg:h-[10vh]"/>
      {/* Hero Section */}
      <section className="relative">
        <div className="h-min-screen w-full overflow-hidden flex flex-col justify-center items-center">
          <div className="flex flex-col justify-center items-center w-full h-full lg:h-[90vh]">
            <div className="col-span-2 flex flex-col justify-center items-center p-6 lg:p-1">
              <div className="techtxttitle mb-4 lg:mb-12">
                Tataskweyak Cree Nation
              </div>
              <div className="techtxtmbb mb-4 lg:mb-12">
                Community Meeting November 12, 2025
              </div>
            </div>
            {/* right side link menu */}
            <div className="col-span-3 flex flex-col justify-center items-center p-4">
              <div className='w-full lg:w-3/7'>
                <Link href="/TCN_Matters" className='panelalt'>
                  <img src='/TCNintro.jpg' className='scale-image'/>
                  <div className="techtxtmb flex flex-col justify-center items-center p-2">
                    Meeting Presentation
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