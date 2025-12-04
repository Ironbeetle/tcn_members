'use client'
import { Backbtn } from "@/components/Backbtn"
import { Hamburger } from "@/components/Hamburger"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Login from "@/components/Login"
import Register from "@/components/Register"

export default function TCN_Enter() {
  const menuItems = [
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
        <section className="w-full relative min-h-screen overflow-scroll">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-8 p-4 lg:p-8">
                {/* <div className="flex flex-col justify-center items-center">
                    <div className="techtxtmbb mb-4 lg:mb-1">
                        TCN Member Account Login & Activation
                    </div>
                    <div className="flex flex-col justify-start items-center p-1">
                        <motion.img
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                          src="/tcnfemalecouch.png"
                          alt="Tataskweyak Cree Nation Logo"
                          className="w-full self-center"
                          style={{ objectFit: 'cover', height: 'auto' }}
                        />
                    </div>
                </div> */}
                <div className="flex flex-col justify-center items-center p-4">
                    <div className="w-full max-w-md">
                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="register">Activate Account</TabsTrigger>
                            </TabsList>
                            <TabsContent value="login">
                                <Login />
                            </TabsContent>
                            <TabsContent value="register">
                                <Register />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
                <div className="flex flex-col justify-center items-center">
                    <div className="techtxtmbb mb-4 lg:mb-1">
                        TCN Member Account Login & Activation
                    </div>
                    <div className="flex flex-col justify-start items-center p-1">
                        <motion.img
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                          src="/tcnfemalecouch.png"
                          alt="Tataskweyak Cree Nation Logo"
                          className="w-full self-center"
                          style={{ objectFit: 'cover', height: 'auto' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    </div>
  )
}