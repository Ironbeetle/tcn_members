"use client"

import { Backbtn } from "@/components/Backbtn"
import { Hamburger } from "@/components/Hamburger"
import { useState, useEffect } from "react"

const sections = [
  { id: "current-state", title: "Current State", shortTitle: "State" },
  { id: "impact", title: "Impact on Community", shortTitle: "Impact" },
  { id: "prevention", title: "Prevention & Enforcement", shortTitle: "Prevention" },
  { id: "healing", title: "Healing & Recovery", shortTitle: "Healing" },
  { id: "call-to-action", title: "Call to Action", shortTitle: "Action" },
]

export default function TCN_Matters() {
  const [activeSection, setActiveSection] = useState("current-state")

  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => document.getElementById(s.id))
      const scrollPosition = window.scrollY + 150

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i]
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  const menuItems = [
    { label: "About Tataskweyak", to: "/pages/AboutTCN", color: "stone" as const },
    { label: "About Who We Are", to: "/pages/WorldViewHome", color: "stone" as const },
    { label: "Photo Gallery", to: "/pages/PhotoGallery", color: "stone" as const },
    { label: "Home", to: "/", color: "stone" as const },
  ]

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

  // Content Card Component
  const ContentCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-stone-700/50 rounded-lg p-4 md:p-6 border border-amber-600/30 ${className}`}>
      {children}
    </div>
  )

  return (
    <div className="w-full min-h-screen genbkg">
      {/* Navigation */}
      <div className="fixed top-0 z-50 w-full">
        <Hamburger menuItems={menuItems} showBackButton={true} />
        <DesktopNav />
      </div>

      {/* Section Navigation - Desktop Sidebar */}
      <nav className="hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <div className="bg-stone-800/90 backdrop-blur-sm rounded-lg p-3 border border-amber-600/30">
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-amber-700 text-white font-semibold"
                      : "text-amber-100/80 hover:bg-amber-800/50 hover:text-white"
                  }`}
                >
                  {section.shortTitle}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Section Navigation - Horizontal scroll */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-40 bg-stone-800/95 backdrop-blur-sm border-b border-amber-600/30 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 p-2 min-w-max">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                activeSection === section.id
                  ? "bg-amber-700 text-white font-semibold"
                  : "text-amber-100/80 bg-stone-700/50"
              }`}
            >
              {section.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-16" />
      <div className="h-12 lg:hidden" />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 lg:ml-36 xl:mx-auto pb-16">
        
        {/* Section 1: Current State */}
        <section id="current-state" className="pt-8 md:pt-12">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Current State of Substance Abuse in Our Community
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mt-3 rounded-full" />
          </div>

          <div className="space-y-6">
            <ContentCard>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                <div className="col-span-1 lg:col-span-3 techtxtmb">
                  <span className="techtxttitley block mb-4">The Reality We Face</span>
                  Our First Nation community is experiencing an unprecedented influx of illegal drugs and alcohol, 
                  threatening the safety and health of our people.<br/><br/> 
                  This crisis requires immediate and sustained action from leadership, 
                  community members, and external partners.
                </div>
                <div className="col-span-1 lg:col-span-2 flex justify-center items-center">
                  <img src="/slide1panel1.jpg" alt="Substance Abuse Statistics" className="w-full max-w-sm object-contain rounded-lg" />
                </div>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                <div className="col-span-1 lg:col-span-3 techtxtmbb">
                  <span className="techtxttitley block mb-4">How Substances Enter Our Community:</span>
                  <strong>External Sources:</strong>
                  <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                    <li>Non-community members exploiting relationships with local residents.</li>
                    <li>Unauthorized entry through remote access points.</li>
                    <li>Vehicles entering without proper screening.</li>
                  </ul>
                  <strong>Internal Factors:</strong>
                  <ul className="list-disc list-inside mt-2 techtxtmb">
                    <li>Community members involved in trafficking networks.</li>
                  </ul>
                </div>
                <div className="col-span-1 lg:col-span-2 flex justify-center items-center">
                  <img src="/slide1panel2.jpg" alt="Entry Points" className="w-full max-w-sm object-contain rounded-lg" />
                </div>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                <div className="col-span-1 lg:col-span-3 techtxtmbb">
                  <span className="techtxttitley block mb-4">Who Is Doing This?</span>
                  <strong>Outside Influences:</strong>
                  <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                    <li>Drug dealers targeting vulnerable community members.</li>
                    <li>Criminal organizations exploiting remote locations.</li>
                  </ul>
                  <strong>Community Member Involvement:</strong>
                  <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                    <li>Some residents unknowingly facilitating entry.</li>
                    <li>Others actively participating in distribution networks.</li>
                    <li>Peer pressure and addiction driving participation.</li>
                  </ul>
                </div>
                <div className="col-span-1 lg:col-span-2 flex justify-center items-center">
                  <img src="/slide1panel3.jpg" alt="Community Impact" className="w-full max-w-sm object-contain rounded-lg" />
                </div>
              </div>
            </ContentCard>
          </div>
        </section>

        {/* Section 2: Impact */}
        <section id="impact" className="pt-12 md:pt-16">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Impact On Our Community Well Being
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mt-3 rounded-full" />
          </div>

          <div className="space-y-6">
            <ContentCard>
              <div className="techtxtmb">
                <span className="techtxttitley block mb-4">Physical Health Consequences:</span>
                <strong>Individual Health:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 space-y-1">
                  <li>Increased addiction rates across all age groups.</li>
                  <li>Rising overdose incidents and medical emergencies.</li>
                  <li>Deteriorating mental health and cognitive function.</li>
                  <li>Increased risk of infectious diseases.</li>
                </ul>
                <strong>Community Health System:</strong>
                <ul className="list-disc list-inside mt-2">
                  <li>Strain on local healthcare resources and services.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Impact on Children&apos;s Development:</span>
                <strong>Mental and Emotional Effects:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Trauma from exposure to substance abuse.</li>
                  <li>Increased anxiety and behavioral problems.</li>
                  <li>Poor academic performance.</li>
                  <li>Loss of cultural identity.</li>
                </ul>
                <strong>Moral and Social Development:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Normalization of substance use.</li>
                  <li>Weakened community values.</li>
                  <li>Reduced participation in traditional activities.</li>
                  <li>Increased risk of early substance experimentation.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Family & Home Disruption:</span>
                <strong>Household Stability:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Family breakdown and domestic violence.</li>
                  <li>Child neglect and unsafe home environments.</li>
                  <li>Loss of traditional family structures.</li>
                  <li>Disrupted parenting and caregiving roles.</li>
                </ul>
                <strong>Inter-generational Impact:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb">
                  <li>Community members involved in trafficking networks.</li>
                </ul>
              </div>
            </ContentCard>
          </div>
        </section>

        {/* Section 3: Prevention */}
        <section id="prevention" className="pt-12 md:pt-16">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Current Prevention And Enforcement Efforts
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mt-3 rounded-full" />
          </div>

          <div className="space-y-6">
            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Immediate Prevention Measures:</span>
                <strong>Community Access Control:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Enhanced monitoring of main entry points.</li>
                  <li>Increased surveillance in high-risk areas.</li>
                  <li>Co-ordination with RCMP.</li>
                </ul>
                <strong>Technology Solutions:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtsbb space-y-1">
                  <li>Deployment of remote trail cameras at key locations.</li>
                  <li>Drone surveillance with night vision capabilities.</li>
                  <li>Database of vehicle registrations for monitoring at checkstop.</li>
                </ul>
                <strong>Community By-Law Enforcement:</strong>
                <ul className="list-disc list-inside mt-2 techtxtsbb space-y-1">
                  <li>Strengthening existing substance abuse by-laws.</li>
                  <li>Training community members as safety officers.</li>
                  <li>Establishing reporting mechanisms.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Intelligence Gathering and Community Involvement:</span>
                <strong>Community Watch Programs:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Teaching residents to identify suspicious activity.</li>
                  <li>Establish a confidential reporting system.</li>
                  <li>Regular community meetings to discuss safety concerns.</li>
                </ul>
                <strong>Youth Engagement:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Peer education programs.</li>
                  <li>Leadership development initiatives.</li>
                  <li>Cultural activity participation.</li>
                  <li>Mentorship programs.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Long-term Prevention Strategies:</span>
                <strong>Education and Awareness:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Cultural education emphasizing traditional values.</li>
                  <li>Life skills and decision-making training.</li>
                  <li>Family education and support programs.</li>
                  <li>Introduce technology-based career opportunities.</li>
                </ul>
                <strong>Economic Development:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Career training and employment opportunities.</li>
                  <li>Entrepreneurship development programs.</li>
                  <li>Traditional skills development.</li>
                </ul>
                <strong>Community Infrastructure:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Recreation facilities and programs.</li>
                  <li>Traditional Resource Stewardship Center.</li>
                  <li>Family support services.</li>
                </ul>
              </div>
            </ContentCard>
          </div>
        </section>

        {/* Section 4: Healing */}
        <section id="healing" className="pt-12 md:pt-16">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Healing And Recovery Initiatives
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mt-3 rounded-full" />
          </div>

          <div className="space-y-6">
            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Individual Healing Programs:</span>
                <strong>Existing Prevention Programs:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Addiction counseling services.</li>
                  <li>Medical detoxification support.</li>
                  <li>Ongoing recovery support groups.</li>
                </ul>
                <strong>Treatment And Support:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Traditional healing.</li>
                  <li>Professional addiction treatment referrals.</li>
                  <li>Family support services.</li>
                  <li>Peer support and mentorship programs.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Spiritual and Cultural Healing:</span>
                <strong>Traditional Knowledge Programs:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Elders teaching traditional lifestyles.</li>
                  <li>Land stewardship programs.</li>
                  <li>Traditional land use programs.</li>
                </ul>
                <strong>Multi-Faith Approaches:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Church services.</li>
                  <li>Gospel Jamborees.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Land-based Healing and Stewardship:</span>
                <strong>Reconnection To The Land:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Traditional land use programs.</li>
                  <li>Environmental stewardship programs.</li>
                  <li>Traditional lifestyles programs.</li>
                </ul>
                <strong>Healing Through Service:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Community beautification projects.</li>
                  <li>Environmental restoration programs.</li>
                  <li>Cultural activity participation.</li>
                </ul>
              </div>
            </ContentCard>
          </div>
        </section>

        {/* Section 5: Call to Action */}
        <section id="call-to-action" className="pt-12 md:pt-16">
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              Call To Action And Vision For The Future
            </h2>
            <div className="w-12 h-1 bg-gradient-to-r from-amber-600 to-amber-400 mt-3 rounded-full" />
          </div>

          <div className="space-y-6">
            <ContentCard>
              <div className="techtxtmbb p-2">
                <span className="techtxttitley block mb-4">A Community Commitment:</span>
                <strong>Unity In Purpose:</strong><br/><br/>
                Together, we possess the strength, wisdom, and determination to overcome this crisis.
                Our ancestors faced many challenges and persevered through unity, 
                traditional knowledge, and unwavering commitment to future generations.
                <div className="mt-6">
                  <strong>Actions Required:</strong>
                  <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                    <li>Community-wide participation in prevention efforts.</li>
                    <li>...</li>
                    <li>...</li>
                    <li>...</li>
                  </ul>
                </div>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb">
                <span className="techtxttitley block mb-4">Building a Healthy, Prosperous Community:</span>
                <strong>Short Term Goals:</strong>
                <ul className="list-disc list-inside mt-2 mb-4 techtxtmb space-y-1">
                  <li>Enhance security measures.</li>
                  <li>Launch community education campaigns.</li>
                  <li>Create youth engagement initiatives.</li>
                </ul>
                <strong>Long Term Goals:</strong>
                <ul className="list-disc list-inside mt-2 techtxtmb space-y-1">
                  <li>Develop sustainable economic opportunities.</li>
                  <li>Build on existing treatment and recovery infrastructure.</li>
                </ul>
              </div>
            </ContentCard>

            <ContentCard>
              <div className="techtxtmbb p-2">
                <span className="techtxttitley block mb-4">Final Words:</span>
                <strong>Our Promise to Future Generations:</strong><br/><br/>
                By working together leadership, community members, elders, youth, and families we can get rid the of drugs and alcohol 
                that poisons our community.<br/> 
                We will create a safe, healthy, and prosperous environment where our children and future generations can thrive. 
                <div className="mt-6">
                  <strong>The Path Forward:</strong><br/><br/>
                  This is not just a fight against substances; it is a fight for our community, our children&apos;s future, and our cultural survival. 
                  <br/>With determination, unity, and the wisdom of our ancestors guiding us, we will succeed.
                </div>
              </div>
            </ContentCard>
          </div>
        </section>

      </main>
    </div>
  )
}