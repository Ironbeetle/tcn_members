/**
 * Seed script to create sample fillable forms for testing
 * Run with: npx ts-node scripts/seed-forms.ts
 * Or: npx tsx scripts/seed-forms.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleForms = [
  {
    title: 'General Information Update',
    description: 'Update your personal information on file with the Band Office.',
    category: 'GENERAL',
    pdf_url: '/forms/general-info-update.pdf',
    is_active: true,
    form_fields: [
      {
        id: 'full_name',
        name: 'full_name',
        label: 'Full Legal Name',
        type: 'text',
        required: true,
        placeholder: 'Enter your full name',
        pdfFieldName: 'FullName',
      },
      {
        id: 'date_of_birth',
        name: 'date_of_birth',
        label: 'Date of Birth',
        type: 'date',
        required: true,
        pdfFieldName: 'DOB',
      },
      {
        id: 'phone',
        name: 'phone',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        placeholder: '(204) 000-0000',
        pdfFieldName: 'Phone',
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: false,
        placeholder: 'your.email@example.com',
        pdfFieldName: 'Email',
      },
      {
        id: 'address',
        name: 'address',
        label: 'Current Address',
        type: 'textarea',
        required: true,
        placeholder: 'Enter your full mailing address',
        pdfFieldName: 'Address',
      },
      {
        id: 'consent',
        name: 'consent',
        label: 'I consent to update my information',
        type: 'checkbox',
        required: true,
        placeholder: 'I agree to update my records',
        pdfFieldName: 'Consent',
      },
    ],
  },
  {
    title: 'Housing Repair Request',
    description: 'Submit a request for housing repairs or maintenance.',
    category: 'HOUSING',
    pdf_url: '/forms/housing-repair-request.pdf',
    is_active: true,
    form_fields: [
      {
        id: 'resident_name',
        name: 'resident_name',
        label: 'Resident Name',
        type: 'text',
        required: true,
        placeholder: 'Your full name',
        pdfFieldName: 'ResidentName',
      },
      {
        id: 'house_number',
        name: 'house_number',
        label: 'House Number',
        type: 'text',
        required: true,
        placeholder: 'Enter your house number',
        pdfFieldName: 'HouseNumber',
      },
      {
        id: 'repair_type',
        name: 'repair_type',
        label: 'Type of Repair Needed',
        type: 'select',
        required: true,
        options: [
          { value: 'plumbing', label: 'Plumbing' },
          { value: 'electrical', label: 'Electrical' },
          { value: 'heating', label: 'Heating/Furnace' },
          { value: 'roofing', label: 'Roofing' },
          { value: 'windows_doors', label: 'Windows/Doors' },
          { value: 'structural', label: 'Structural' },
          { value: 'other', label: 'Other' },
        ],
        pdfFieldName: 'RepairType',
      },
      {
        id: 'urgency',
        name: 'urgency',
        label: 'Urgency Level',
        type: 'radio',
        required: true,
        options: [
          { value: 'emergency', label: 'Emergency - Immediate attention needed' },
          { value: 'urgent', label: 'Urgent - Within 1 week' },
          { value: 'normal', label: 'Normal - Within 1 month' },
          { value: 'low', label: 'Low - When available' },
        ],
        pdfFieldName: 'Urgency',
      },
      {
        id: 'description',
        name: 'description',
        label: 'Describe the Issue',
        type: 'textarea',
        required: true,
        placeholder: 'Please describe the repair needed in detail...',
        pdfFieldName: 'Description',
      },
      {
        id: 'preferred_contact',
        name: 'preferred_contact',
        label: 'Best Contact Number',
        type: 'phone',
        required: true,
        placeholder: '(204) 000-0000',
        pdfFieldName: 'ContactPhone',
      },
    ],
  },
  {
    title: 'Education Funding Application',
    description: 'Apply for educational funding support for post-secondary studies.',
    category: 'EDUCATION',
    pdf_url: '/forms/education-funding.pdf',
    is_active: true,
    form_fields: [
      {
        id: 'student_name',
        name: 'student_name',
        label: 'Student Full Name',
        type: 'text',
        required: true,
        placeholder: 'Enter student name',
        pdfFieldName: 'StudentName',
      },
      {
        id: 'treaty_number',
        name: 'treaty_number',
        label: 'Treaty/Status Number',
        type: 'text',
        required: true,
        placeholder: 'Enter treaty number',
        pdfFieldName: 'TreatyNumber',
      },
      {
        id: 'institution',
        name: 'institution',
        label: 'Educational Institution',
        type: 'text',
        required: true,
        placeholder: 'Name of school/college/university',
        pdfFieldName: 'Institution',
      },
      {
        id: 'program',
        name: 'program',
        label: 'Program of Study',
        type: 'text',
        required: true,
        placeholder: 'e.g., Bachelor of Science in Nursing',
        pdfFieldName: 'Program',
      },
      {
        id: 'program_length',
        name: 'program_length',
        label: 'Program Length (years)',
        type: 'number',
        required: true,
        validation: { min: 1, max: 10 },
        pdfFieldName: 'ProgramLength',
      },
      {
        id: 'start_date',
        name: 'start_date',
        label: 'Program Start Date',
        type: 'date',
        required: true,
        pdfFieldName: 'StartDate',
      },
      {
        id: 'funding_type',
        name: 'funding_type',
        label: 'Type of Funding Requested',
        type: 'select',
        required: true,
        options: [
          { value: 'tuition', label: 'Tuition Only' },
          { value: 'living', label: 'Living Allowance Only' },
          { value: 'full', label: 'Full Funding (Tuition + Living)' },
          { value: 'books', label: 'Books and Supplies' },
        ],
        pdfFieldName: 'FundingType',
      },
      {
        id: 'additional_info',
        name: 'additional_info',
        label: 'Additional Information',
        type: 'textarea',
        required: false,
        placeholder: 'Any additional information to support your application...',
        pdfFieldName: 'AdditionalInfo',
      },
      {
        id: 'declaration',
        name: 'declaration',
        label: 'Declaration',
        type: 'checkbox',
        required: true,
        placeholder: 'I declare that all information provided is true and accurate',
        pdfFieldName: 'Declaration',
      },
    ],
  },
  {
    title: 'Recreation Program Registration',
    description: 'Register for community recreation programs and activities.',
    category: 'RECREATION',
    pdf_url: '/forms/recreation-registration.pdf',
    is_active: true,
    form_fields: [
      {
        id: 'participant_name',
        name: 'participant_name',
        label: 'Participant Name',
        type: 'text',
        required: true,
        placeholder: 'Name of person registering',
        pdfFieldName: 'ParticipantName',
      },
      {
        id: 'age',
        name: 'age',
        label: 'Age',
        type: 'number',
        required: true,
        validation: { min: 1, max: 120 },
        pdfFieldName: 'Age',
      },
      {
        id: 'program',
        name: 'program',
        label: 'Program',
        type: 'select',
        required: true,
        options: [
          { value: 'hockey', label: 'Hockey' },
          { value: 'basketball', label: 'Basketball' },
          { value: 'volleyball', label: 'Volleyball' },
          { value: 'fitness', label: 'Fitness Classes' },
          { value: 'swimming', label: 'Swimming' },
          { value: 'youth_night', label: 'Youth Night' },
          { value: 'elders_program', label: 'Elders Program' },
        ],
        pdfFieldName: 'Program',
      },
      {
        id: 'emergency_contact',
        name: 'emergency_contact',
        label: 'Emergency Contact Name',
        type: 'text',
        required: true,
        placeholder: 'Name of emergency contact',
        pdfFieldName: 'EmergencyContact',
      },
      {
        id: 'emergency_phone',
        name: 'emergency_phone',
        label: 'Emergency Contact Phone',
        type: 'phone',
        required: true,
        placeholder: '(204) 000-0000',
        pdfFieldName: 'EmergencyPhone',
      },
      {
        id: 'medical_conditions',
        name: 'medical_conditions',
        label: 'Medical Conditions/Allergies',
        type: 'textarea',
        required: false,
        placeholder: 'List any medical conditions or allergies we should be aware of...',
        pdfFieldName: 'MedicalConditions',
      },
      {
        id: 'waiver',
        name: 'waiver',
        label: 'Liability Waiver',
        type: 'checkbox',
        required: true,
        placeholder: 'I agree to the liability waiver and release of claims',
        pdfFieldName: 'Waiver',
      },
    ],
  },
  {
    title: 'Employment Application',
    description: 'Apply for employment opportunities with Tataskweyak Cree Nation.',
    category: 'EMPLOYMENT',
    pdf_url: '/forms/employment-application.pdf',
    is_active: true,
    form_fields: [
      {
        id: 'applicant_name',
        name: 'applicant_name',
        label: 'Full Name',
        type: 'text',
        required: true,
        placeholder: 'Your full legal name',
        pdfFieldName: 'ApplicantName',
      },
      {
        id: 'email',
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'your.email@example.com',
        pdfFieldName: 'Email',
      },
      {
        id: 'phone',
        name: 'phone',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        placeholder: '(204) 000-0000',
        pdfFieldName: 'Phone',
      },
      {
        id: 'position',
        name: 'position',
        label: 'Position Applied For',
        type: 'text',
        required: true,
        placeholder: 'Enter the job title',
        pdfFieldName: 'Position',
      },
      {
        id: 'education_level',
        name: 'education_level',
        label: 'Highest Education Level',
        type: 'select',
        required: true,
        options: [
          { value: 'high_school', label: 'High School Diploma' },
          { value: 'ged', label: 'GED' },
          { value: 'certificate', label: 'Certificate/Diploma' },
          { value: 'bachelor', label: "Bachelor's Degree" },
          { value: 'master', label: "Master's Degree" },
          { value: 'doctorate', label: 'Doctorate' },
          { value: 'other', label: 'Other' },
        ],
        pdfFieldName: 'EducationLevel',
      },
      {
        id: 'experience',
        name: 'experience',
        label: 'Relevant Work Experience',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your relevant work experience...',
        pdfFieldName: 'Experience',
      },
      {
        id: 'availability',
        name: 'availability',
        label: 'Availability',
        type: 'radio',
        required: true,
        options: [
          { value: 'full_time', label: 'Full Time' },
          { value: 'part_time', label: 'Part Time' },
          { value: 'casual', label: 'Casual/On-Call' },
          { value: 'contract', label: 'Contract' },
        ],
        pdfFieldName: 'Availability',
      },
      {
        id: 'start_date',
        name: 'start_date',
        label: 'Available Start Date',
        type: 'date',
        required: true,
        pdfFieldName: 'StartDate',
      },
      {
        id: 'references',
        name: 'references',
        label: 'References',
        type: 'textarea',
        required: false,
        placeholder: 'List 2-3 professional references with contact information...',
        pdfFieldName: 'References',
      },
      {
        id: 'consent',
        name: 'consent',
        label: 'Background Check Consent',
        type: 'checkbox',
        required: true,
        placeholder: 'I consent to a background check if required for this position',
        pdfFieldName: 'Consent',
      },
    ],
  },
];

async function main() {
  console.log('🌱 Starting to seed fillable forms...\n');

  for (const form of sampleForms) {
    try {
      const created = await prisma.fillable_form.create({
        data: {
          title: form.title,
          description: form.description,
          category: form.category as any,
          pdf_url: form.pdf_url,
          is_active: form.is_active,
          form_fields: form.form_fields,
        },
      });
      console.log(`✅ Created form: ${created.title}`);
    } catch (error) {
      console.error(`❌ Failed to create form: ${form.title}`, error);
    }
  }

  console.log('\n✨ Seeding complete!');
  console.log(`   Created ${sampleForms.length} sample forms`);
  console.log('\n📝 Forms created:');
  sampleForms.forEach((form, i) => {
    console.log(`   ${i + 1}. ${form.title} (${form.category})`);
  });
}

main()
  .catch((e) => {
    console.error('Error seeding forms:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
