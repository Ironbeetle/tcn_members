'use client'
import { Backbtn } from "@/components/Backbtn"
import { motion } from "framer-motion"
import { useState, type FormEvent } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Login from "@/components/Login"
import Register from "@/components/Register"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function TCN_Enter() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("login")
  const [supportName, setSupportName] = useState("")
  const [supportEmail, setSupportEmail] = useState("")
  const [supportMessage, setSupportMessage] = useState("")
  const [supportStatus, setSupportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [supportError, setSupportError] = useState<string | null>(null)

  const handleSupportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSupportStatus("sending")
    setSupportError(null)

    try {
      const response = await fetch("/api/comm/activation-support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: supportName.trim(),
          email: supportEmail.trim(),
          message: supportMessage.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.error || "Unable to send support request")
      }

      setSupportStatus("sent")
      setSupportName("")
      setSupportEmail("")
      setSupportMessage("")
    } catch (error: any) {
      setSupportStatus("error")
      setSupportError(error?.message || "Unable to send support request")
    }
  }

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
        <div className="fixed top-0 z-[100] w-full">
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
          <Sheet>
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
                                <div className="mt-4 flex items-center justify-center">
                                  <SheetTrigger asChild>
                                    <Button type="button" variant="outline">
                                      Email tech support
                                    </Button>
                                  </SheetTrigger>
                                </div>
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
                    <div className="w-full h-full grid grid-cols-[1fr_auto] gap-4 items-start">
                      {/* Left column: text content */}
                      <div className="flex flex-col gap-3" style={{ fontSize: 'clamp(1rem, 0.464rem + 1.429vw, 1.75rem)', lineHeight: '1.6' }}>
                        <p>
                          Based on Indigenous registration in Canada, the 10-digit registration number found on a 
                          Secure Certificate of Indian Status is a unique identifier used to confirm a person's status under the 
                          Indian Act. You can find your 10-digit treaty number on the front of your status card.
                        </p>
                        <p>
                          Please enter your 10 digit Treaty number to activate your account.<br/>
                          The cloud database will be updated every 2 weeks, to include TCN members 
                          who just turned 18 years of age.
                        </p>
                        <p>
                          If you need assistance with registration, please send an email with your full name and birth date, and 
                          we will find out what is happening, and get back to you.
                        </p>
                        <div className="mt-1">
                          <SheetTrigger asChild>
                            <Button type="button" variant="outline">
                              Email tech support
                            </Button>
                          </SheetTrigger>
                        </div>
                      </div>
                      {/* Right column: image */}
                      <motion.img
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeInOut" }}
                        src="/phoneappview.png"
                        alt="Phone app view"
                        className="w-40 xl:w-48 h-auto object-contain"
                      />
                    </div>
                  )}

                </div>
            </div>
            <SheetContent side="right" className="w-full sm:max-w-md pt-16 lg:pt-0 z-[110]">
              <SheetHeader>
                <SheetTitle>Activation support</SheetTitle>
                <SheetDescription>
                  Send your full name and birth date with a message to tech support and we will follow up by email.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-6">
                <form className="space-y-3" onSubmit={handleSupportSubmit}>
                  <div className="space-y-1">
                    <Label htmlFor="support-name">Your Full First and Last Name</Label>
                    <Input
                      id="support-name"
                      name="support-name"
                      value={supportName}
                      onChange={(event) => setSupportName(event.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="support-email">Email address</Label>
                    <Input
                      id="support-email"
                      name="support-email"
                      type="email"
                      value={supportEmail}
                      onChange={(event) => setSupportEmail(event.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="support-message">How can we help?</Label>
                    <textarea
                      id="support-message"
                      name="support-message"
                      value={supportMessage}
                      onChange={(event) => setSupportMessage(event.target.value)}
                      placeholder="Tell us what is happening with your activation"
                      className="min-h-[140px] w-full rounded-md border border-amber-600/40 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button type="submit" disabled={supportStatus === "sending"}>
                      {supportStatus === "sending" ? "Sending..." : "Send support request"}
                    </Button>
                    {supportStatus === "sent" && (
                      <span className="text-sm text-emerald-700">Message sent. We will reply soon.</span>
                    )}
                    {supportStatus === "error" && (
                      <span className="text-sm text-red-600">{supportError || "Unable to send"}</span>
                    )}
                  </div>
                </form>
              </div>
            </SheetContent>
            </Sheet>
        </section>
    </div>
  )
}