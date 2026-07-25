"use client"

import { Backbtn } from "@/components/Backbtn"
import { useState, useEffect, useRef } from "react"
import { 
  Cpu, 
  Leaf, 
  MessageSquare, 
  Globe, 
  Code, 
  Camera, 
  Gamepad2, 
  Shield, 
  Factory, 
  Wrench,
  Smartphone,
  Mail,
  FileText,
  Users,
  Lightbulb,
  Sparkles,
  ChevronDown,
  Zap,
  BookOpen,
  Target,
  Monitor,
  Rocket
} from "lucide-react"

const sections = [
  { id: "vision", title: "Self-Sufficient Cree Nation", shortTitle: "Vision", icon: Lightbulb },
  { id: "history", title: "History of Problem Solving", shortTitle: "History", icon: BookOpen },
  { id: "platform", title: "Our Communications Platform", shortTitle: "Platform", icon: Monitor },
]

// Areas where technology can be applied
const techAreas = [
  { title: "Land Stewardship", icon: Leaf, description: "Protecting and managing our traditional territories with modern tools", color: "emerald" },
  { title: "Culture Preservation", icon: Users, description: "Documenting and sharing our Cree heritage for future generations", color: "amber" },
  { title: "Entertainment", icon: Gamepad2, description: "Creating games and media that tell our stories our way", color: "purple" },
  { title: "Public Safety", icon: Shield, description: "Using technology to keep our community safe and secure", color: "blue" },
  { title: "Manufacturing", icon: Factory, description: "Building products and solutions locally for local needs", color: "orange" },
  { title: "Software Development", icon: Code, description: "Building custom applications tailored to our needs", color: "cyan" },
  { title: "Technical Services", icon: Wrench, description: "IT support and infrastructure maintenance", color: "stone" },
]

// Skills needed for the platform
const skillsNeeded = [
  { title: "IT Technicians", icon: Cpu, description: "Hardware and network support" },
  { title: "Website Builders", icon: Globe, description: "Creating web presence and apps" },
  { title: "Application Developers", icon: Code, description: "Building custom software" },
  { title: "Graphic Designers", icon: Sparkles, description: "Visual design and branding" },
  { title: "Videographers", icon: Camera, description: "Media creation and documentation" },
  { title: "Game Developers", icon: Gamepad2, description: "Interactive entertainment" },
  { title: "Communicators", icon: MessageSquare, description: "Content creation and outreach" },
]

// Communication channels
const commChannels = [
  { title: "SMS Texting", icon: Smartphone, description: "Private individual messages for direct, personal communication with members", color: "blue" },
  { title: "Email", icon: Mail, description: "Detailed information for individuals and groups with attachments and links", color: "amber" },
  { title: "Bulletin Posts", icon: FileText, description: "Public announcements delivered directly to your device in real-time", color: "emerald" },
]

export default function TCN_Technology() {
  const [activeSection, setActiveSection] = useState("vision")
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

  // Simple Card (removed motion animations for performance)
  const GlassCard = ({ children, className = "", highlight = false }: { children: React.ReactNode, className?: string, highlight?: boolean }) => (
    <div
      className={`
        relative overflow-hidden rounded-2xl md:rounded-3xl
        ${highlight 
          ? 'bg-gradient-to-br from-amber-900/90 via-amber-900/80 to-amber-800/90 border-amber-500/40' 
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
        <p className="mt-3 text-body-lg text-stone-600 max-w-2xl">{subtitle}</p>
      )}
    </div>
  )

  // Tech Area Card
  const TechAreaCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => {
    const colorClasses: Record<string, { bg: string, border: string, iconBg: string, iconText: string }> = {
      emerald: { bg: 'from-emerald-900/40 to-emerald-950/40', border: 'border-emerald-500/30', iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400' },
      amber: { bg: 'from-amber-900/40 to-amber-950/40', border: 'border-amber-500/30', iconBg: 'bg-amber-500/20', iconText: 'text-amber-400' },
      purple: { bg: 'from-purple-900/40 to-purple-950/40', border: 'border-purple-500/30', iconBg: 'bg-purple-500/20', iconText: 'text-purple-400' },
      blue: { bg: 'from-blue-900/40 to-blue-950/40', border: 'border-blue-500/30', iconBg: 'bg-blue-500/20', iconText: 'text-blue-400' },
      orange: { bg: 'from-orange-900/40 to-orange-950/40', border: 'border-orange-500/30', iconBg: 'bg-orange-500/20', iconText: 'text-orange-400' },
      cyan: { bg: 'from-cyan-900/40 to-cyan-950/40', border: 'border-cyan-500/30', iconBg: 'bg-cyan-500/20', iconText: 'text-cyan-400' },
      stone: { bg: 'from-stone-800/40 to-stone-900/40', border: 'border-stone-500/30', iconBg: 'bg-stone-500/20', iconText: 'text-stone-400' },
    }
    const colors = colorClasses[color] || colorClasses.amber

    return (
      <div
        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} p-6`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
        <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-4`}>
          <Icon className={`w-7 h-7 ${colors.iconText}`} />
        </div>
        <h3 className="text-heading-sm font-bold text-white mb-2">{title}</h3>
        <p className="text-stone-300 text-body-sm">{description}</p>
      </div>
    )
  }

  // Skill Badge
  const SkillBadge = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div
      className="group flex items-center gap-4 bg-stone-800/50 rounded-xl p-4 border border-stone-700/50"
    >
      <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-6 h-6 text-amber-400" />
      </div>
      <div>
        <h4 className="font-semibold text-white text-body">{title}</h4>
        <p className="text-stone-400 text-body-sm">{description}</p>
      </div>
    </div>
  )

  // Channel Card
  const ChannelCard = ({ icon: Icon, title, description, color }: { icon: React.ElementType, title: string, description: string, color: string }) => {
    const colorClasses: Record<string, { gradient: string, iconBg: string, iconText: string, ring: string }> = {
      blue: { gradient: 'from-blue-600 to-blue-800', iconBg: 'bg-white/20', iconText: 'text-white', ring: 'ring-blue-400/30' },
      amber: { gradient: 'from-amber-600 to-amber-800', iconBg: 'bg-white/20', iconText: 'text-white', ring: 'ring-amber-400/30' },
      emerald: { gradient: 'from-emerald-600 to-emerald-800', iconBg: 'bg-white/20', iconText: 'text-white', ring: 'ring-emerald-400/30' },
    }
    const colors = colorClasses[color] || colorClasses.amber

    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors.gradient} p-6 md:p-8 shadow-xl ring-1 ${colors.ring}`}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className={`w-16 h-16 rounded-2xl ${colors.iconBg} flex items-center justify-center mb-5`}>
          <Icon className={`w-8 h-8 ${colors.iconText}`} />
        </div>
        <h3 className="text-heading font-bold text-white mb-3">{title}</h3>
        <p className="text-white/80 text-body-lg">{description}</p>
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
      <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden pt-32 md:pt-20">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(251, 191, 36, 0.4) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/70 via-stone-800/40 to-stone-900/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 via-transparent to-cyan-900/20" />
        
        {/* Glowing orbs - reduced blur for better performance */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 text-center">
          <div>
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">TCN Technology Initiative</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight">
              Building Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 pb-2">
                Digital Future
              </span>
            </h1>
            
            <p className="text-body-lg text-stone-300 max-w-2xl mx-auto mb-10">
              Using technology to strengthen our community while honoring our traditions 
              and creating opportunities for future generations.
            </p>

           
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-amber-500/50" />
        </div>
      </section>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pb-20">
        
        {/* Section 1: Vision */}
        <section id="vision" className="py-16 md:py-24">
          <SectionHeader 
            number="01" 
            title="Making TCN Self-Sufficient"
            subtitle="Building a strong, technology-enabled Cree Nation"
          />

          <div className="space-y-6 md:space-y-8">
            <GlassCard highlight className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider">The Power of Technology</span>
                  </div>
                  <h3 className="text-heading font-bold text-white mb-4">Transforming How We Live & Work</h3>
                  <p className="text-stone-300 text-body-lg mb-6">
                    Modern technology has transformed how people live, work, and relate to one another.
                    Because technology underpins so many parts of modern life, technical skills have become essential.
                  </p>
                  <p className="text-amber-200/80 text-body">
                    They let individuals understand and leverage digital tools, build and maintain systems, 
                    and translate ideas into practical solutions for our community.
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-amber-800/30 to-stone-900/50 rounded-2xl p-8 border border-amber-500/20">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <Lightbulb className="w-7 h-7 text-amber-400" />
                      </div>
                      <h4 className="text-heading-sm font-bold text-white">Key Insight</h4>
                    </div>
                    <p className="text-stone-300 text-body-lg">
                      Technical skills let us understand digital tools, build systems, and turn ideas into 
                      real solutions that serve our community today and create opportunities for tomorrow.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Rocket className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-heading font-bold text-white">Continuous Learning & Innovation</h3>
                  <p className="text-stone-100 text-body">Adapting and growing responsibly</p>
                </div>
              </div>
              <p className="text-stone-300 text-body-lg mb-6">
                Technology evolves rapidly, so a mindset of continuous learning along with a solid set of core technical skills 
                will allow us to adapt and innovate responsibly.
              </p>
              <div className="bg-gradient-to-r from-amber-500/10 to-transparent rounded-xl p-6 border-l-4 border-amber-500">
                <p className="text-amber-100 text-body-lg font-medium">
                  By using the wisdom of our ancestors and keeping with our values and cultural practices, 
                  we can shape tools and run services that serve our community today, and create career opportunities and entrepreneurship.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Section 2: History */}
        <section id="history" className="py-16 md:py-24">
          <SectionHeader 
            number="02" 
            title="A History of Problem Solving"
            subtitle="Drawing on ancestral wisdom for modern challenges"
          />

          <div className="space-y-6 md:space-y-8">
            <GlassCard highlight className="p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300 text-xs font-semibold uppercase tracking-wider">Our Ancestral Spirit</span>
                  </div>
                  <h3 className="text-heading font-bold text-white mb-4">Millennia of Innovation</h3>
                  <p className="text-stone-300 text-body-lg mb-6">
                    Our ancestors overcame the challenges of survival in a beautiful but unforgiving land for millennia.
                    We gained our traditional knowledge of the land and how to live in it, with a keen eye for detail and critical thinking.
                  </p>
                  <p className="text-amber-200/80 text-body">
                    Even though we live in a different world now, we can still use the same spirit of innovative thinking 
                    as our ancestors did in problem solving today.
                  </p>
                </div>
                <div className="relative">
                  <img 
                    src="/tcnarialview2.jpg" 
                    alt="Tataskweyak Territory" 
                    className="w-full rounded-2xl shadow-2xl"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10" />
                </div>
              </div>
            </GlassCard>

            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-amber-500/50 flex items-center justify-center">
                  <Target className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-heading font-bold text-black">Technology Application Areas</h3>
                  <p className="text-stone-700 text-body">New careers and business opportunities</p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {techAreas.map((area) => (
                  <TechAreaCard 
                    key={area.title}
                    icon={area.icon} 
                    title={area.title} 
                    description={area.description}
                    color={area.color}
                  />
                ))}
              </div>

              <p className="mt-8 text-center text-stone-700 text-body-lg">
                We will be exploring different areas of science and technology in detail, and how they can be applied here in TCN.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Platform */}
        <section id="platform" className="py-16 md:py-24">
          <SectionHeader 
            number="03" 
            title="Our Communications Platform"
            subtitle="The foundation of a connected community"
          />

          <div className="space-y-6 md:space-y-8">
            {/* Platform Intro */}
            <GlassCard highlight className="p-8 md:p-12 text-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 mb-6">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-300 font-semibold">You Are Here Right Now</span>
                </div>
                
                <h3 className="text-heading font-bold text-white mb-6">Our First Step Forward</h3>
                
                <p className="text-body-xl text-stone-300 max-w-3xl mx-auto">
                  The system you are logged into right now is our first step towards building a self-sufficient Cree Nation.
                  A central place for communications and access to services, designed to make staying informed and connected easier than ever.
                </p>
              </div>
            </GlassCard>

            {/* Communication Channels */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-heading font-bold text-black mb-2">How We Connect</h3>
                <p className="text-stone-700 text-body">TCN admin and program managers can reach members through:</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                {commChannels.map((channel) => (
                  <ChannelCard 
                    key={channel.title}
                    icon={channel.icon}
                    title={channel.title}
                    description={channel.description}
                    color={channel.color}
                  />
                ))}
              </div>
            </div>

            {/* Skills Needed */}
            <GlassCard className="p-6 md:p-10">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 font-semibold">Join Our Team</span>
                </div>
                <h3 className="text-heading font-bold text-white mb-3">Skills We Need</h3>
                <p className="text-stone-100 text-body max-w-2xl mx-auto">
                  This is our own custom-built system. To bring it to its full potential, 
                  we need TCN members with skills in these areas:
                </p>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {skillsNeeded.map((skill) => (
                  <SkillBadge 
                    key={skill.title}
                    icon={skill.icon}
                    title={skill.title}
                    description={skill.description}
                  />
                ))}
              </div>
            </GlassCard>

            {/* CTA */}
            {/* <GlassCard highlight className="p-8 md:p-12 text-center">
              <div>
                <div className="w-20 h-20 rounded-3xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-10 h-10 text-amber-400" />
                </div>
                
                <h3 className="text-heading font-bold text-white mb-4">
                  Interested in Contributing?
                </h3>
                
                <p className="text-stone-300 text-body-lg max-w-2xl mx-auto mb-8">
                  If you have skills in any of these areas and want to help build our community&apos;s digital future, 
                  we want to hear from you. Together, we can create something amazing for TCN.
                </p>

                <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/20 rounded-full border border-amber-500/30">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-200 font-medium text-body">Reach out to TCN Administration</span>
                </div>
              </div>
            </GlassCard> */}
          </div>
        </section>

      </main>
    </div>
  )
}
