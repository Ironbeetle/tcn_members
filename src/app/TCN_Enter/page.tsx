'use client'
import { Backbtn } from "@/components/Backbtn"
import { motion } from "framer-motion"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Login from "@/components/Login"
import Register from "@/components/Register"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TCN_Enter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("login")

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
        <div className="lg:hidden bg-amber-900 backdrop-blur-sm border-b border-amber-600/50">
          <div className="flex items-center px-4 h-14">
            <div className="w-[20vw]">
              <Backbtn />
            </div>
            <div className="flex-1" />
          </div>
        </div>
            <DesktopNav />
        </div>
        <div className="w-full h-[10vh] lg:h-[10vh]"/>
        <section className="w-full relative min-h-screen overflow-scroll px-4 lg:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-4 lg:gap-8 p-2 lg:p-8">
                {/* Form section - full width on mobile, order first on mobile */}
                <div className="flex flex-col justify-center items-center p-2 lg:p-4 order-1 lg:order-1">
                    <div className="w-full max-w-md">
                        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} defaultValue="login" className="w-full">
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
                {/* Right side Image section - hidden on mobile, shown on desktop */}
                <div className="hidden lg:flex flex-col justify-center items-center order-2">
                  {/* default panel - shown when login tab is active */}
                  {activeTab === "login" && (
                    <div className="w-full h-full">
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
                  )}

                  {/* Treaty number explanation panel - shown when register tab is active */}
                  {activeTab === "register" && (
                    <div className="w-full h-full">
                      <div id="tnumberinfo" className="prose max-w-none text-sm h-[45%] text-justify space-y-3" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', lineHeight: '1.6' }}>
                        <p>
                          Based on Indigenous registration in Canada, the 10-digit registration number found on a Secure Certificate of Indian Status is a unique identifier used to confirm a person's status under the Indian Act.
                        </p>
                        <p>The 10 digits are broken down into three parts:</p>
                        <ul className="list-disc pl-5">
                          <li>
                            <strong>First 3 digits (Band/Nation Code):</strong> Identifies the specific First Nation or Band with which the individual is affiliated.
                          </li>
                          <li>
                            <strong>Next 5 digits (Family Number):</strong> Represents the specific family group within that Nation.
                          </li>
                          <li>
                            <strong>Last 2 digits (Position Number):</strong> Identifies the individual within that family, historically used to denote gender (<em>.01 for male, .02 for female</em>) or birth order for children (<em>.03 and up</em>).
                          </li>
                        </ul>
                        <p>You can find your 10-digit treaty number on the front of your status card.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-center items-center p-1 h-[45%]">
                        <div style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)', lineHeight: '1.6' }}>
                          
                            Please enter your Treaty number to activate your account. Once entered, your Treaty number will be locked and your Barcode number will then serve as your identifier in the system.
                         
                        </div>
                        <motion.img
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ duration: 0.5 , delay: 0.3 ,ease: "easeInOut"}}
                          src="/phoneappview.png"
                          alt="Tataskweyak Cree Nation Logo"
                          className="w-full self-center"
                          style={{ objectFit: 'cover', height: 'auto' }}
                        />
                      </div>
                      
                    </div>
                  )}

                </div>
            </div>
        </section>
    </div>
  )
}