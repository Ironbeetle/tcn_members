"use client"
import { UserSessionBar } from '@/components/UserSessionBar';
import { MobileBottomNav, MobilePageHeader } from '@/components/MobileNav';
import { useRouter } from "next/navigation";
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Building2,
  Users,
  Heart,
  GraduationCap,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  ArrowLeft,
  Home,
  Shield,
  Dumbbell,
  Hotel,
  Baby,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Search,
  Filter
} from 'lucide-react';

// Department/Program data structure
interface StaffMember {
  name: string;
  position: string;
  phone?: string;
  email?: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  address?: string;
  phone?: string;
  fax?: string;
  email?: string;
  hours?: string;
  staff: StaffMember[];
  programs?: string[];
}

// External organizations data
interface ExternalOrg {
  id: string;
  name: string;
  phone?: string;
  fax?: string;
  tollFree?: string;
  description: string;
}

const externalOrganizations: ExternalOrg[] = [
  { id: 'ucn', name: 'University College of the North', phone: '(204) 342-2995', fax: '(204) 342-2621', description: 'Post-secondary education services' },
  { id: 'wawatay', name: 'Wawatay Inn', phone: '(204) 677-1000', fax: '(204) 778-8041', description: 'Accommodation in Thompson' },
  { id: 'aboriginal-strategies', name: 'Aboriginal Strategies', phone: '(204) 942-2944', tollFree: '1-800-761-7110', fax: '(204) 949-0564', description: 'Indigenous consultation services' },
  { id: 'ktc', name: 'Keewatin Tribal Council', phone: '(204) 677-2341', fax: '(204) 677-0255', description: 'Tribal council services' },
  { id: 'mko', name: 'MKO (Manitoba Keewatinowi Okimakanak)', phone: '(204) 677-1000', fax: '(204) 778-7655', description: 'Northern Manitoba First Nations advocacy' },
  { id: 'ininew', name: 'Ininew Office', phone: '(204) 956-0900', fax: '(204) 956-4766', description: 'Regional support services' },
  { id: 'day-school', name: 'Day School Settlement', tollFree: '1-888-221-2898', description: 'Day school claims support' },
  { id: 'water-settlements', name: 'Water Settlements', tollFree: '1-833-252-4220', description: 'Drinking water settlement claims' },
  { id: 'thompson-ford', name: 'Thompson Ford', phone: '(204) 778-6386', description: 'Vehicle sales and service' },
];

const departments: Department[] = [
  {
    id: 'band-office',
    name: 'Band Office',
    description: 'Administrative services, membership, and member support services for Tataskweyak Cree Nation.',
    icon: Briefcase,
    color: 'amber',
    gradientFrom: 'from-amber-700',
    gradientTo: 'to-amber-900',
    address: 'Band Office, Split Lake, MB R0B 1P0',
    phone: '(204) 342-2045',
    fax: '(204) 342-2110',
    email: 'bandoffice@tcn.ca',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'Melissa Spence', position: 'Receptionist', phone: '(204) 342-2045' },
      { name: 'Karlene Anderson', position: 'C/C Assistant', phone: '(204) 342-2045' },
      { name: 'Sheila Flett', position: 'HR Manager', phone: '(204) 342-2045' },
      { name: 'Darlene Bittern', position: 'Trust Finance', phone: '(204) 342-2045' },
      { name: 'Betsy Keeper', position: 'Registry Membership', phone: '(204) 342-2045' },
    ],
    programs: ['Membership Services', 'Treaty Payments', 'Status Cards', 'Birth/Death Registration', 'Human Resources']
  },
  {
    id: 'housing',
    name: 'Housing Department',
    description: 'Housing services, repairs, maintenance, and new housing applications.',
    icon: Home,
    color: 'orange',
    gradientFrom: 'from-orange-700',
    gradientTo: 'to-orange-900',
    phone: '(204) 342-2045',
    email: 'housing@tcn.ca',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'Roddy Spence', position: 'Housing Manager', phone: '(204) 342-2045' },
      { name: 'Cliff Tanner', position: 'Housing Assistant Manager', phone: '(204) 342-2045' },
      { name: 'Clarise Martin', position: 'Housing Admin Assistant', phone: '(204) 342-2045' },
    ],
    programs: ['Housing Applications', 'Home Repairs', 'Renovations', 'CMHC Programs', 'Emergency Repairs']
  },
  {
    id: 'social-services',
    name: 'Social Services',
    description: 'Social assistance, welfare support, and community outreach programs.',
    icon: Heart,
    color: 'green',
    gradientFrom: 'from-green-700',
    gradientTo: 'to-green-900',
    phone: '(204) 342-2045',
    fax: '(204) 342-2512',
    email: 'socialservices@tcn.ca',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'Louisa Spence', position: 'Welfare Administrator', phone: '(204) 342-2045' },
      { name: 'Rebecca Brightnose', position: 'Welfare Assistant', phone: '(204) 342-2045' },
      { name: 'Joan McGillivary', position: 'Outreach Worker', phone: '(204) 342-2045' },
    ],
    programs: ['Social Assistance', 'Emergency Support', 'Community Outreach', 'Family Support']
  },
  {
    id: 'employment',
    name: 'Employment & Training',
    description: 'Employment services, job training, and workforce development programs.',
    icon: Users,
    color: 'indigo',
    gradientFrom: 'from-indigo-700',
    gradientTo: 'to-indigo-900',
    phone: '(204) 342-2045',
    email: 'employment@tcn.ca',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'Sara Cole', position: 'Ongoing Jobs Manager', phone: '(204) 342-2045' },
      { name: 'Yvonne Wastesicoot', position: 'ISETS Worker', phone: '(204) 342-2045' },
    ],
    programs: ['Job Placements', 'ISETS Training', 'Skills Development', 'Career Counseling']
  },
  {
    id: 'prevention-services',
    name: 'Prevention Services',
    description: 'Community prevention programs and family support services.',
    icon: Shield,
    color: 'purple',
    gradientFrom: 'from-purple-700',
    gradientTo: 'to-purple-900',
    phone: '(431) 354-1395',
    email: 'prevention@tcn.ca',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'TBD', position: 'Prevention Services Director', phone: '(431) 757-7095' },
      { name: 'Beatrice Flett', position: 'Prevention Services', phone: '(431) 354-1395' },
    ],
    programs: ['Family Prevention', 'Youth Programs', 'Community Wellness', 'Support Services']
  },
  {
    id: 'financial-building',
    name: 'Financial Building',
    description: 'Financial services and administration offices.',
    icon: Building2,
    color: 'slate',
    gradientFrom: 'from-slate-700',
    gradientTo: 'to-slate-900',
    phone: '(204) 342-2025',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'Finance Office Line 1', position: 'Financial Services', phone: '(204) 342-2025' },
      { name: 'Finance Office Line 2', position: 'Financial Services', phone: '(204) 342-2032' },
      { name: 'Finance Office Line 3', position: 'Financial Services', phone: '(204) 342-2054' },
      { name: 'Finance Office Line 4', position: 'Financial Services', phone: '(204) 342-2075' },
    ],
    programs: ['Accounts Payable', 'Accounts Receivable', 'Payroll', 'Financial Planning']
  },
  {
    id: 'education-youth',
    name: 'Education - Youth',
    description: 'K-12 education services, student support, and youth programs.',
    icon: GraduationCap,
    color: 'blue',
    gradientFrom: 'from-blue-700',
    gradientTo: 'to-blue-900',
    phone: '(204) 342-2045',
    email: 'education@tcn.ca',
    hours: 'Monday - Friday: 8:30 AM - 4:30 PM',
    staff: [
      { name: 'TBD', position: 'Education Director', phone: '(204) 342-2045' },
      { name: 'TBD', position: 'School Principal', phone: '(204) 342-2045' },
    ],
    programs: ['Elementary School', 'High School', 'Special Education', 'School Lunch Program', 'Student Transportation']
  },
  {
    id: 'arena',
    name: 'Arena & Recreation',
    description: 'Sports facilities, recreation programs, and community events.',
    icon: Dumbbell,
    color: 'teal',
    gradientFrom: 'from-teal-700',
    gradientTo: 'to-teal-900',
    phone: '(204) 342-2045',
    email: 'arena@tcn.ca',
    hours: 'Monday - Sunday: Hours vary by season',
    staff: [
      { name: 'TBD', position: 'Recreation Director', phone: '(204) 342-2045' },
      { name: 'TBD', position: 'Arena Manager', phone: '(204) 342-2045' },
    ],
    programs: ['Hockey Programs', 'Figure Skating', 'Youth Sports', 'Fitness Programs', 'Community Events']
  },
  {
    id: 'hotel',
    name: 'Split Lake Hotel',
    description: 'Accommodation services for visitors and community guests.',
    icon: Hotel,
    color: 'rose',
    gradientFrom: 'from-rose-700',
    gradientTo: 'to-rose-900',
    phone: '(204) 342-2045',
    email: 'hotel@tcn.ca',
    hours: 'Open 24/7',
    staff: [
      { name: 'TBD', position: 'Hotel Manager', phone: '(204) 342-2045' },
      { name: 'TBD', position: 'Front Desk Supervisor', phone: '(204) 342-2045' },
    ],
    programs: ['Room Reservations', 'Conference Rooms', 'Catering Services']
  },
  {
    id: 'daycare',
    name: 'Daycare Centre',
    description: 'Early childhood care and education for community children.',
    icon: Baby,
    color: 'pink',
    gradientFrom: 'from-pink-700',
    gradientTo: 'to-pink-900',
    phone: '(204) 342-2045',
    email: 'daycare@tcn.ca',
    hours: 'Monday - Friday: 7:30 AM - 5:30 PM',
    staff: [
      { name: 'TBD', position: 'Daycare Director', phone: '(204) 342-2045' },
      { name: 'TBD', position: 'Lead Early Childhood Educator', phone: '(204) 342-2045' },
    ],
    programs: ['Infant Care', 'Toddler Program', 'Preschool', 'Head Start', 'After School Care']
  },
];

// Department Card Component
function DepartmentCard({ department }: { department: Department }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = department.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
    >
      {/* Header */}
      <div 
        className={`bg-gradient-to-r ${department.gradientFrom} ${department.gradientTo} p-4 cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{department.name}</h3>
              <p className="text-sm text-white/80">{department.description}</p>
            </div>
          </div>
          <div className="text-white">
            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Quick Contact Info (always visible) */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex flex-wrap gap-4 text-sm">
          {department.phone && (
            <a href={`tel:${department.phone}`} className="flex items-center gap-2 text-stone-600 hover:text-amber-700">
              <Phone className="w-4 h-4" />
              <span>{department.phone}</span>
            </a>
          )}
          {department.email && (
            <a href={`mailto:${department.email}`} className="flex items-center gap-2 text-stone-600 hover:text-amber-700">
              <Mail className="w-4 h-4" />
              <span>{department.email}</span>
            </a>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 space-y-4"
        >
          {/* Hours & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {department.hours && (
              <div className="flex items-start gap-2 text-sm">
                <Clock className="w-4 h-4 text-amber-700 mt-0.5" />
                <div>
                  <div className="font-medium text-stone-700">Hours</div>
                  <div className="text-stone-600">{department.hours}</div>
                </div>
              </div>
            )}
            {department.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-amber-700 mt-0.5" />
                <div>
                  <div className="font-medium text-stone-700">Address</div>
                  <div className="text-stone-600">{department.address}</div>
                </div>
              </div>
            )}
            {department.fax && (
              <div className="flex items-start gap-2 text-sm">
                <Phone className="w-4 h-4 text-amber-700 mt-0.5" />
                <div>
                  <div className="font-medium text-stone-700">Fax</div>
                  <div className="text-stone-600">{department.fax}</div>
                </div>
              </div>
            )}
          </div>

          {/* Staff Directory */}
          <div>
            <h4 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-700" />
              Personnel
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {department.staff.map((person, idx) => (
                <div key={idx} className="bg-stone-50 rounded-lg p-3">
                  <div className="font-medium text-stone-800">{person.name}</div>
                  <div className="text-sm text-amber-700">{person.position}</div>
                  {person.phone && (
                    <a href={`tel:${person.phone}`} className="text-xs text-stone-500 hover:text-amber-700 block mt-1">
                      {person.phone}
                    </a>
                  )}
                  {person.email && (
                    <a href={`mailto:${person.email}`} className="text-xs text-stone-500 hover:text-amber-700 block">
                      {person.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Programs */}
          {department.programs && department.programs.length > 0 && (
            <div>
              <h4 className="font-bold text-stone-800 mb-3">Programs & Services</h4>
              <div className="flex flex-wrap gap-2">
                {department.programs.map((program, idx) => (
                  <span 
                    key={idx} 
                    className={`px-3 py-1 text-sm rounded-full bg-${department.color}-100 text-${department.color}-800`}
                    style={{ 
                      backgroundColor: `var(--color-${department.color}-100, #fef3c7)`,
                      color: `var(--color-${department.color}-800, #92400e)`
                    }}
                  >
                    {program}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TCNBandOfficePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.staff.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.position.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    return matchesSearch && dept.id === selectedCategory;
  });

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen genbkg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/TCN_Enter");
    return null;
  }
  
  return (
    <div className="w-full min-h-screen genbkg">
      {/* Fixed Top Navigation */}
      <div className="fixed top-0 z-50 w-full shadow-md">
        <UserSessionBar showLogo={true} logoSrc="/tcnlogolg.png" />
      </div>

      <div className="pt-16 pb-20 lg:pb-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-4">
            <MobilePageHeader 
              title="Community Directory"
              subtitle="Programs & contacts"
              icon={<Building2 className="w-5 h-5" />}
            />
            
            {/* Mobile Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search departments, staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            {/* Mobile Filter Button */}
            <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
              <SheetTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-medium text-stone-700">
                      {selectedCategory === 'all' ? 'All Departments' : departments.find(d => d.id === selectedCategory)?.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh] rounded-t-3xl">
                <SheetHeader className="text-left pb-4 border-b border-stone-100">
                  <SheetTitle className="text-lg font-bold text-stone-800">Departments</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-1 overflow-y-auto max-h-[calc(60vh-80px)]">
                  <button
                    onClick={() => { setSelectedCategory('all'); setFilterSheetOpen(false); }}
                    className={`w-full p-3 rounded-xl text-left text-sm transition-colors ${
                      selectedCategory === 'all' ? 'bg-amber-100 text-amber-900 font-medium' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    All Departments
                  </button>
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => { setSelectedCategory(dept.id); setFilterSheetOpen(false); }}
                        className={`w-full p-3 rounded-xl text-left transition-colors flex items-center gap-3 ${
                          selectedCategory === dept.id ? 'bg-amber-100 text-amber-900 font-medium' : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{dept.name}</span>
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Back Button */}
          <div className="hidden lg:block mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-stone-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            
            {/* LEFT SIDEBAR - Quick Navigation (Desktop only) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-stone-800 mb-3 text-sm">Quick Navigation</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full p-2 rounded-lg text-left text-sm transition-colors ${
                      selectedCategory === 'all' 
                        ? 'bg-amber-100 text-amber-900 font-medium' 
                        : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    All Departments
                  </button>
                  {departments.map((dept) => {
                    const Icon = dept.icon;
                    return (
                      <button
                        key={dept.id}
                        onClick={() => setSelectedCategory(dept.id)}
                        className={`w-full p-2 rounded-lg text-left text-sm transition-colors flex items-center gap-2 ${
                          selectedCategory === dept.id 
                            ? 'bg-amber-100 text-amber-900 font-medium' 
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{dept.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="lg:col-span-6 space-y-3 sm:space-y-4">
              {/* Desktop Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="hidden lg:block bg-gradient-to-r from-amber-700 to-amber-900 rounded-2xl shadow-lg p-6 text-white"
              >
                <div className="flex items-center gap-4 mb-3">
                  <Building2 className="w-8 h-8" />
                  <h1 className="text-2xl font-bold">Community Directory</h1>
                </div>
                <p className="text-amber-50">Contact information and personnel for TCN programs and departments.</p>
                
                {/* Desktop Search Bar */}
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Search departments, staff, or services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
              </motion.div>

              {/* Department Cards */}
              <div className="space-y-3 sm:space-y-4">
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept, index) => (
                    <motion.div
                      key={dept.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <DepartmentCard department={dept} />
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 text-center">
                    <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-600">No departments found matching your search.</p>
                  </div>
                )}
              </div>
            </main>

            {/* RIGHT SIDEBAR - Emergency Contacts & Info (Desktop only) */}
            <aside className="hidden lg:block lg:col-span-3 space-y-4">
              {/* Emergency Contacts */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-sm border border-red-200 p-4 sticky top-24"
              >
                <h3 className="font-bold text-red-900 mb-3">Emergency Contacts</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium text-red-800">Fire / Ambulance</div>
                    <a href="tel:911" className="text-red-700 text-lg font-bold">911</a>
                  </div>
                  <div className="border-t border-red-200 pt-2">
                    <div className="font-medium text-red-800">RCMP</div>
                    <a href="tel:2046776911" className="text-red-700">(204) 677-6911</a>
                  </div>
                  <div className="border-t border-red-200 pt-2">
                    <div className="font-medium text-red-800">John Wavey Health Centre</div>
                    <a href="tel:2043422033" className="text-red-700">(204) 342-2033</a>
                  </div>
                 
                </div>
              </motion.div>

              {/* General Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4"
              >
                <h3 className="font-bold text-stone-800 mb-3">Band Office Info</h3>
                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                    <span>Band Office<br />Split Lake, MB<br />R0B 1P0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-700" />
                    <a href="tel:2043422045" className="hover:text-amber-700">(204) 342-2045</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Mon-Fri: 8:30 AM - 4:30 PM</span>
                  </div>
                </div>
              </motion.div>

              {/* External Organizations */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-4"
              >
                <h3 className="font-bold text-blue-900 mb-3">External Organizations</h3>
                <div className="space-y-3 text-sm max-h-64 overflow-y-auto">
                  {externalOrganizations.map((org) => (
                    <div key={org.id} className="border-b border-blue-200 pb-2 last:border-0 last:pb-0">
                      <div className="font-medium text-blue-800">{org.name}</div>
                      <div className="text-xs text-blue-600 mb-1">{org.description}</div>
                      {org.phone && (
                        <a href={`tel:${org.phone.replace(/[^0-9]/g, '')}`} className="text-blue-700 text-xs block hover:underline">
                          Ph: {org.phone}
                        </a>
                      )}
                      {org.tollFree && (
                        <a href={`tel:${org.tollFree.replace(/[^0-9]/g, '')}`} className="text-blue-700 text-xs block hover:underline">
                          Toll Free: {org.tollFree}
                        </a>
                      )}
                      {org.fax && (
                        <span className="text-blue-600 text-xs block">Fax: {org.fax}</span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl shadow-sm border border-amber-200 p-4"
              >
                <h3 className="font-bold text-amber-900 mb-3">Directory Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-amber-700">{departments.length}</div>
                    <div className="text-xs text-amber-800">Departments Listed</div>
                  </div>
                  <div className="border-t border-amber-200 pt-2">
                    <div className="text-2xl font-bold text-amber-700">
                      {departments.reduce((acc, d) => acc + d.staff.length, 0)}
                    </div>
                    <div className="text-xs text-amber-800">Staff Positions</div>
                  </div>
                  <div className="border-t border-amber-200 pt-2">
                    <div className="text-2xl font-bold text-amber-700">
                      {externalOrganizations.length}
                    </div>
                    <div className="text-xs text-amber-800">External Contacts</div>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}