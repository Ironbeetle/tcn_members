"use client"

import { Backbtn } from "@/components/Backbtn"
import { useState, useEffect, useRef } from "react"
import { 
  AlertTriangle,
  Shield,
  Heart,
  Users,
  Target,
  Eye,
  Truck,
  UserX,
  Brain,
  Home,
  Baby,
  Stethoscope,
  Camera,
  FileCheck,
  HandHeart,
  TreePine,
  Church,
  Compass,
  Sparkles,
  ChevronDown
} from "lucide-react"

const sections = [
  { id: "current-state", title: "Current State", shortTitle: "State", icon: AlertTriangle },
  { id: "impact", title: "Impact on Community", shortTitle: "Impact", icon: Heart },
  { id: "prevention", title: "Prevention & Enforcement", shortTitle: "Prevention", icon: Shield },
  { id: "healing", title: "Healing & Recovery", shortTitle: "Healing", icon: HandHeart },
  { id: "call-to-action", title: "Call to Action", shortTitle: "Action", icon: Target },
]

export default function TCN_Matters() {
  const [activeSection, setActiveSection] = useState("current-state")
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const sectionElements = sections.map(s => document.getElementById(s.id))
          const scrollPosition = window.scrollY + 200

          for (let i = sectionElements.length - 1; i >= 0; i--) {
            const section = sectionElements[i]
            if (section && section.offsetTop <= scrollPosition) {
              setActiveSection(sections[i].id)
              break
            }
          }
          ticking.current = false
        })
        ticking.current = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: "smooth" })
    }
  }

  // Glass Card (removed motion for performance)
  const GlassCard = ({ children, className = "", highlight = false }: { children: React.ReactNode, className?: string, highlight?: boolean }) => (
    <div
      className={`
        relative overflow-hidden rounded-2xl md:rounded-3xl
        ${highlight 
          ? 'bg-gradient-to-br from-amber-900/90 via-amber-800/80 to-stone-900/90 border-amber-500/40' 
          : 'bg-gradient-to-br from-stone-800/80 via-stone-800/60 to-stone-900/80 border-stone-600/30'
        }
        border shadow-2xl shadow-black/20
        ${className}
      `}
    >
      {highlight && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      {children}
    </div>
  )

  // Section Header (removed motion for performance)
  const SectionHeader = ({ number, title, subtitle }: { number: string, title: string, subtitle?: string }) => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-5xl md:text-7xl font-black text-amber-500/20">{number}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent" />
      </div>
      <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-lg md:text-xl text-stone-600 max-w-2xl">{subtitle}</p>
      )}
    </div>
  )

  // Icon List Item
  const IconListItem = ({ icon: Icon, text, color = "amber" }: { icon: React.ElementType, text: string, color?: string }) => {
    const colorClasses: Record<string, { bg: string, hover: string, text: string }> = {
      amber: { bg: 'bg-amber-500/20', hover: 'group-hover:bg-amber-500/30', text: 'text-amber-400' },
      red: { bg: 'bg-red-500/20', hover: 'group-hover:bg-red-500/30', text: 'text-red-400' },
      emerald: { bg: 'bg-emerald-500/20', hover: 'group-hover:bg-emerald-500/30', text: 'text-emerald-400' },
    }
    const colors = colorClasses[color] || colorClasses.amber
    
    return (
      <li className="flex items-start gap-3 group">
        <div className={`mt-1 p-1.5 rounded-lg ${colors.bg} ${colors.hover} transition-colors`}>
          <Icon className={`w-4 h-4 ${colors.text}`} />
        </div>
        <span className="text-stone-200 text-base md:text-lg leading-relaxed">{text}</span>
      </li>
    )
  }

  // Stat Card
  const StatCard = ({ icon: Icon, label, value, color = "amber" }: { icon: React.ElementType, label: string, value: string, color?: string }) => {
    const colorClasses: Record<string, { bg: string, text: string }> = {
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
      red: { bg: 'bg-red-500/20', text: 'text-red-400' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
    }
    const colors = colorClasses[color] || colorClasses.amber
    
    return (
      <div className="text-center p-4 md:p-6">
        <div className={`mx-auto w-14 h-14 md:w-16 md:h-16 rounded-2xl ${colors.bg} flex items-center justify-center mb-3`}>
          <Icon className={`w-7 h-7 md:w-8 md:h-8 ${colors.text}`} />
        </div>
        <div className={`text-2xl md:text-3xl font-bold ${colors.text} mb-1`}>{value}</div>
        <div className="text-stone-400 text-sm md:text-base">{label}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen genbkg scroll-smooth">
      {/* Navigation - removed backdrop-blur for performance */}
      <nav className="fixed top-0 z-50 w-full will-change-transform">
        <div className="bg-amber-900 border-b border-amber-700/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between h-16 md:h-20">
              <div className="flex items-center gap-4">
                <div className="w-20">
                  <Backbtn />
                </div>
                <div className="hidden md:block h-8 w-px bg-amber-600/50" />
                <img
                  src="/tcnlogolg.png"
                  alt="TCN Logo"
                  className="hidden md:block h-10 w-auto"
                />
              </div>
              
              {/* Desktop Nav Pills */}
              <div className="hidden lg:flex items-center gap-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeSection === section.id
                          ? "bg-amber-500 text-stone-950"
                          : "text-amber-100 hover:text-white hover:bg-amber-800/50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {section.shortTitle}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Section Nav - removed backdrop-blur for performance */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-amber-900 border-b border-amber-700/50 overflow-x-auto will-change-transform">
        <div className="flex items-center gap-2 px-4 py-3 min-w-max">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? "bg-amber-500 text-stone-950"
                    : "bg-amber-800/60 text-amber-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {section.shortTitle}
              </button>
            )
          })}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden pt-32 md:pt-20">
        <div className="absolute inset-0 bg-[url('/tcnarialview2.jpg')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-800/50 to-stone-900/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 to-red-900/30" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-300 text-sm font-medium">Community Priority</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Community
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Matters
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-300 max-w-2xl mx-auto mb-10">
              Addressing the substance abuse crisis in our community with unity, 
              determination, and the wisdom of our ancestors.
            </p>

          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-amber-500/50" />
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-20">
        
        {/* Section 1: Current State */}
        <section id="current-state" className="py-16 md:py-24">
          <SectionHeader 
            number="01" 
            title="Current State of Substance Abuse"
            subtitle="Understanding the reality our community faces today"
          />

          <div className="space-y-6 md:space-y-8">
            <GlassCard highlight className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 mb-4">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-xs font-semibold uppercase tracking-wider">Critical Issue</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">The Reality We Face</h3>
                  <p className="text-stone-300 text-lg leading-relaxed mb-6">
                    Our First Nation community is experiencing an unprecedented influx of illegal drugs and alcohol, 
                    threatening the safety and health of our people.
                  </p>
                  <p className="text-amber-200/80 text-base">
                    This crisis requires immediate and sustained action from leadership, 
                    community members, and external partners.
                  </p>
                </div>
                <div className="relative">
                  <img 
                    src="/slide1panel1.jpg" 
                    alt="Community" 
                    className="w-full rounded-2xl shadow-2xl"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                </div>
              </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Truck className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">How Substances Enter</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> External Sources
                    </h4>
                    <ul className="space-y-3">
                      <IconListItem icon={UserX} text="Non-community members exploiting relationships with local residents" />
                      <IconListItem icon={Compass} text="Unauthorized entry through remote access points" />
                      <IconListItem icon={Truck} text="Vehicles entering without proper screening" />
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-700/50">
                    <h4 className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" /> Internal Factors
                    </h4>
                    <ul className="space-y-3">
                      <IconListItem icon={UserX} text="Community members involved in trafficking networks" />
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <UserX className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Who Is Doing This?</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-red-400 font-semibold mb-3">Outside Influences</h4>
                    <ul className="space-y-3">
                      <IconListItem icon={Target} text="Drug dealers targeting vulnerable community members" color="red" />
                      <IconListItem icon={Eye} text="Criminal organizations exploiting remote locations" color="red" />
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-700/50">
                    <h4 className="text-amber-400 font-semibold mb-3">Community Member Involvement</h4>
                    <ul className="space-y-3">
                      <IconListItem icon={Users} text="Some residents unknowingly facilitating entry" />
                      <IconListItem icon={UserX} text="Others actively participating in distribution" />
                      <IconListItem icon={Brain} text="Peer pressure and addiction driving participation" />
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Section 2: Impact */}
        <section id="impact" className="py-16 md:py-24">
          <SectionHeader 
            number="02" 
            title="Impact On Our Community"
            subtitle="The devastating effects on our people and our future"
          />

          <div className="space-y-6 md:space-y-8">
            {/* Impact Stats Grid */}
            <GlassCard className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-700/50">
              <StatCard icon={Stethoscope} label="Health Impact" value="Rising" color="red" />
              <StatCard icon={Baby} label="Children Affected" value="Many" color="amber" />
              <StatCard icon={Home} label="Families Disrupted" value="Growing" color="amber" />
              <StatCard icon={Heart} label="Community Healing" value="Needed" color="emerald" />
            </GlassCard>

            <div className="grid md:grid-cols-3 gap-6">
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-red-500/20">
                    <Stethoscope className="w-6 h-6 text-red-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Physical Health</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={AlertTriangle} text="Increased addiction rates across all age groups" color="red" />
                  <IconListItem icon={AlertTriangle} text="Rising overdose incidents and medical emergencies" color="red" />
                  <IconListItem icon={Brain} text="Deteriorating mental health and cognitive function" color="red" />
                  <IconListItem icon={Stethoscope} text="Strain on local healthcare resources" color="red" />
                </ul>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Baby className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Children&apos;s Development</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={Heart} text="Trauma from exposure to substance abuse" />
                  <IconListItem icon={Brain} text="Increased anxiety and behavioral problems" />
                  <IconListItem icon={Users} text="Normalization of substance use" />
                  <IconListItem icon={TreePine} text="Loss of cultural identity" />
                </ul>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Home className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Family & Home</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={Home} text="Family breakdown and domestic violence" />
                  <IconListItem icon={Baby} text="Child neglect and unsafe environments" />
                  <IconListItem icon={Users} text="Loss of traditional family structures" />
                  <IconListItem icon={Heart} text="Disrupted parenting and caregiving" />
                </ul>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* Section 3: Prevention */}
        <section id="prevention" className="py-16 md:py-24">
          <SectionHeader 
            number="03" 
            title="Prevention & Enforcement"
            subtitle="Current efforts and strategies to protect our community"
          />

          <div className="space-y-6 md:space-y-8">
            <GlassCard highlight className="p-6 md:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Immediate Prevention Measures</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-amber-400 font-semibold mb-4 text-lg">Community Access Control</h4>
                  <ul className="space-y-3">
                    <IconListItem icon={Eye} text="Enhanced monitoring of main entry points" />
                    <IconListItem icon={Camera} text="Increased surveillance in high-risk areas" />
                    <IconListItem icon={Shield} text="Co-ordination with RCMP" />
                  </ul>
                </div>

                <div>
                  <h4 className="text-amber-400 font-semibold mb-4 text-lg">Technology Solutions</h4>
                  <ul className="space-y-3">
                    <IconListItem icon={Camera} text="Remote trail cameras at key locations" />
                    <IconListItem icon={Eye} text="Drone surveillance with night vision" />
                    <IconListItem icon={FileCheck} text="Vehicle registration database" />
                  </ul>
                </div>

                <div>
                  <h4 className="text-amber-400 font-semibold mb-4 text-lg">By-Law Enforcement</h4>
                  <ul className="space-y-3">
                    <IconListItem icon={FileCheck} text="Strengthening substance abuse by-laws" />
                    <IconListItem icon={Users} text="Training community safety officers" />
                    <IconListItem icon={Target} text="Establishing reporting mechanisms" />
                  </ul>
                </div>
              </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Eye className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Community Watch Programs</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={Eye} text="Teaching residents to identify suspicious activity" />
                  <IconListItem icon={Shield} text="Confidential reporting system" />
                  <IconListItem icon={Users} text="Regular community safety meetings" />
                </ul>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Youth Engagement</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={Users} text="Peer education programs" />
                  <IconListItem icon={Target} text="Leadership development initiatives" />
                  <IconListItem icon={TreePine} text="Cultural activity participation" />
                  <IconListItem icon={HandHeart} text="Mentorship programs" />
                </ul>
              </GlassCard>
            </div>

            <GlassCard className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-amber-500/20">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Long-term Prevention Strategies</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-amber-400 font-semibold mb-4">Education & Awareness</h4>
                  <ul className="space-y-3 text-stone-300">
                    <IconListItem icon={TreePine} text="Cultural education emphasizing traditional values" />
                    <IconListItem icon={Brain} text="Life skills and decision-making training" />
                    <IconListItem icon={Home} text="Family education and support programs" />
                  </ul>
                </div>
                <div>
                  <h4 className="text-amber-400 font-semibold mb-4">Economic Development</h4>
                  <ul className="space-y-3 text-stone-300">
                    <IconListItem icon={Target} text="Career training and employment opportunities" />
                    <IconListItem icon={Sparkles} text="Entrepreneurship development" />
                    <IconListItem icon={TreePine} text="Traditional skills development" />
                  </ul>
                </div>
                <div>
                  <h4 className="text-amber-400 font-semibold mb-4">Infrastructure</h4>
                  <ul className="space-y-3 text-stone-300">
                    <IconListItem icon={Users} text="Recreation facilities and programs" />
                    <IconListItem icon={TreePine} text="Traditional Resource Stewardship Center" />
                    <IconListItem icon={Home} text="Family support services" />
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Section 4: Healing */}
        <section id="healing" className="py-16 md:py-24">
          <SectionHeader 
            number="04" 
            title="Healing & Recovery"
            subtitle="Supporting our people on the path to wellness"
          />

          <div className="space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <Heart className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Individual Healing</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-3">Existing Programs</h4>
                    <ul className="space-y-3">
                      <IconListItem icon={HandHeart} text="Addiction counseling services" color="emerald" />
                      <IconListItem icon={Stethoscope} text="Medical detoxification support" color="emerald" />
                      <IconListItem icon={Users} text="Ongoing recovery support groups" color="emerald" />
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-stone-700/50">
                    <h4 className="text-amber-400 font-semibold mb-3">Treatment & Support</h4>
                    <ul className="space-y-3">
                      <IconListItem icon={TreePine} text="Traditional healing" />
                      <IconListItem icon={Stethoscope} text="Professional addiction treatment referrals" />
                      <IconListItem icon={Users} text="Peer support and mentorship" />
                    </ul>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Spiritual & Cultural Healing</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-amber-400 font-semibold mb-3">Traditional Knowledge</h4>
                    <ul className="space-y-3">
                      <IconListItem icon={Users} text="Elders teaching traditional lifestyles" />
                      <IconListItem icon={TreePine} text="Land stewardship programs" />
                      <IconListItem icon={Compass} text="Traditional land use programs" />
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-stone-700/50">
                    <h4 className="text-amber-400 font-semibold mb-3">Multi-Faith Approaches</h4>
                    <ul className="space-y-3">
                      <IconListItem icon={Church} text="Church services" />
                      <IconListItem icon={Heart} text="Gospel Jamborees" />
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </div>

            <GlassCard highlight className="p-6 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-emerald-500/20">
                  <TreePine className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Land-based Healing & Stewardship</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-emerald-400 font-semibold mb-4 text-lg">Reconnection To The Land</h4>
                  <ul className="space-y-3">
                    <IconListItem icon={TreePine} text="Traditional land use programs" color="emerald" />
                    <IconListItem icon={Compass} text="Environmental stewardship programs" color="emerald" />
                    <IconListItem icon={Users} text="Traditional lifestyles programs" color="emerald" />
                  </ul>
                </div>
                <div>
                  <h4 className="text-emerald-400 font-semibold mb-4 text-lg">Healing Through Service</h4>
                  <ul className="space-y-3">
                    <IconListItem icon={Sparkles} text="Community beautification projects" color="emerald" />
                    <IconListItem icon={TreePine} text="Environmental restoration programs" color="emerald" />
                    <IconListItem icon={Heart} text="Cultural activity participation" color="emerald" />
                  </ul>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Section 5: Call to Action */}
        <section id="call-to-action" className="py-16 md:py-24">
          <SectionHeader 
            number="05" 
            title="Call To Action"
            subtitle="Our vision and commitment for the future"
          />

          <div className="space-y-6 md:space-y-8">
            <GlassCard highlight className="p-8 md:p-12 text-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 font-semibold">Unity In Purpose</span>
                </div>
                
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-6">A Community Commitment</h3>
                
                <p className="text-lg md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
                  Together, we possess the strength, wisdom, and determination to overcome this crisis.
                  Our ancestors faced many challenges and persevered through unity, 
                  traditional knowledge, and unwavering commitment to future generations.
                </p>
              </div>
            </GlassCard>

            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-amber-500/20">
                    <Target className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Short Term Goals</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={Shield} text="Enhance security measures" />
                  <IconListItem icon={Users} text="Launch community education campaigns" />
                  <IconListItem icon={Heart} text="Create youth engagement initiatives" />
                </ul>
              </GlassCard>

              <GlassCard className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-emerald-500/20">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Long Term Goals</h3>
                </div>
                <ul className="space-y-3">
                  <IconListItem icon={Target} text="Develop sustainable economic opportunities" color="emerald" />
                  <IconListItem icon={Heart} text="Build on existing treatment and recovery infrastructure" color="emerald" />
                </ul>
              </GlassCard>
            </div>

            {/* Final Message */}
            <GlassCard highlight className="p-8 md:p-12">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                  <Heart className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-semibold">Our Promise</span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">To Future Generations</h3>
                
                <p className="text-lg text-stone-300 mb-8 leading-relaxed">
                  By working together &mdash; leadership, community members, elders, youth, and families &mdash; 
                  we can rid our community of the drugs and alcohol that poison us. 
                  We will create a safe, healthy, and prosperous environment where our children 
                  and future generations can thrive.
                </p>

                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 rounded-2xl p-6 md:p-8 border border-amber-500/30">
                  <p className="text-xl md:text-2xl text-amber-100 font-medium italic">
                    &ldquo;This is not just a fight against substances; it is a fight for our community, 
                    our children&apos;s future, and our cultural survival. With determination, unity, 
                    and the wisdom of our ancestors guiding us, we will succeed.&rdquo;
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

      </main>
    </div>
  )
}
