/**
 * Contextual Help Content
 * 
 * Centralized help text for every page in the staff app.
 * Keyed by route path (relative to /Fq6pm72NjqUA).
 */

export interface HelpStep {
  label: string
  detail: string
}

export interface HelpFaq {
  question: string
  answer: string
}

export interface HelpEntry {
  title: string
  description: string
  steps?: HelpStep[]
  tips?: string[]
  faqs?: HelpFaq[]
}

const BASE = '/Fq6pm72NjqUA'

export const helpContent: Record<string, HelpEntry> = {
  // ──────────────────────────────────────────────
  // STAFF DASHBOARD
  // ──────────────────────────────────────────────
  [`${BASE}/dashboard`]: {
    title: 'Staff Dashboard',
    description: 'Your home screen showing a quick overview of unread memos, timesheet status, draft travel forms, and recent activity.',
    tips: [
      'Click any card to jump directly to that section.',
      'Unread memo count updates in real-time when you open memos.',
      'The timesheet card shows the current pay period status.',
    ],
    faqs: [
      { question: 'Why does my timesheet show "No Timesheet"?', answer: 'You haven\'t created a timesheet for the current pay period yet. Go to Timesheets and click Save to start one.' },
      { question: 'How do I get to admin features?', answer: 'If your role is Staff Admin, Admin, or Council, use the sidebar toggle at the bottom to switch between Staff and Admin views.' },
    ],
  },

  // ── Communications Hub ────────────────────────
  [`${BASE}/dashboard/communications`]: {
    title: 'Communications Hub',
    description: 'Central page for all outreach tools — SMS, Email, and Bulletins.',
    tips: [
      'Use SMS for urgent, short notices (e.g. office closures).',
      'Use Email for longer or formal communications.',
      'Use Bulletins to post announcements to the community portal.',
    ],
  },

  // ── SMS ───────────────────────────────────────
  [`${BASE}/dashboard/communications/sms`]: {
    title: 'SMS Composer',
    description: 'Send text messages to community members. Messages are delivered via Twilio to the phone numbers on file.',
    steps: [
      { label: 'Write your message', detail: 'Type in the message box. The character/segment counter updates as you type.' },
      { label: 'Select recipients', detail: 'Use the contact search to find members by name or T-number. You can filter by community. Only members with a phone number on file can be selected.' },
      { label: 'Review & send', detail: 'Double-check the recipient count and message, then click Send.' },
    ],
    tips: [
      'Standard SMS segments are 160 characters. Messages over 160 chars are split into multiple segments.',
      'Unicode characters (emojis, special symbols) reduce the segment size to 70 characters.',
      'You can send to up to 500 recipients at once.',
      'Keep messages concise — recipients see them on small screens.',
    ],
    faqs: [
      { question: 'Why can\'t I select a member?', answer: 'They may not have a phone number on file. Contact your admin to update their profile.' },
      { question: 'What does "segments" mean?', answer: 'Long messages are split into segments by the carrier. Each segment counts as one SMS for billing. The counter shows how many segments your message will use.' },
    ],
  },

  // ── Email ─────────────────────────────────────
  [`${BASE}/dashboard/communications/email`]: {
    title: 'Email Composer',
    description: 'Send emails to community members with optional TCN letterhead branding.',
    steps: [
      { label: 'Enter a subject line', detail: 'Keep it clear and descriptive so recipients know what the email is about.' },
      { label: 'Compose your message', detail: 'Use the rich text editor to format your email. You can add bold, italic, lists, and links.' },
      { label: 'Choose letterhead (optional)', detail: 'Toggle the letterhead option to wrap your email in official TCN branding with a selectable logo.' },
      { label: 'Select recipients', detail: 'Search and select community members. Only members with an email on file will appear.' },
      { label: 'Send', detail: 'Review everything and click Send. A confirmation will appear when delivered.' },
    ],
    tips: [
      'Use letterhead for official communications — it adds professionalism.',
      'You can attach files by using the attachment button in the editor.',
      'Emails are sent via the Resend service and may take a few seconds per batch.',
    ],
    faqs: [
      { question: 'Can I send to all members at once?', answer: 'You can select multiple members from the search. There is no "Select All" button to prevent accidental mass emails.' },
      { question: 'What does the letterhead look like?', answer: 'It wraps your email in a branded template with the TCN logo at the top and contact info at the bottom.' },
    ],
  },

  // ── Bulletin ──────────────────────────────────
  [`${BASE}/dashboard/communications/bulletin`]: {
    title: 'Bulletin Creator',
    description: 'Create announcements for the community portal. You can create text-based bulletins or upload a poster image.',
    steps: [
      { label: 'Choose bulletin type', detail: 'Select "Text Bulletin" for a written announcement or "Poster Bulletin" to upload an image/flyer.' },
      { label: 'Fill in the details', detail: 'For text: enter a title, category, and body. For poster: upload an image file and add a title.' },
      { label: 'Preview', detail: 'Review how your bulletin will look before publishing.' },
      { label: 'Publish', detail: 'Click Create/Publish to push the bulletin to the community portal.' },
    ],
    tips: [
      'Poster images have to be in US letter paper size (8.5" X 11") at maximum 2550px X 3300px. The app will automatically optimize the image to 612px X 792px',
      'Supported image formats: JPG, PNG, and WebP.',
      'Text bulletins support rich formatting — use headings and lists to make them scannable.',
      'Bulletins appear on the member-facing community portal immediately after publishing.',
    ],
    faqs: [
      { question: 'Can I edit a bulletin after publishing?', answer: 'Yes — go to the bulletin history and click Edit on any existing bulletin.' },
      { question: 'What\'s the difference between text and poster?', answer: 'Text bulletins are typed content displayed directly. Poster bulletins display an uploaded image (like a flyer or event poster).' },
    ],
  },

  // ── Memos ─────────────────────────────────────
  [`${BASE}/dashboard/memos`]: {
    title: 'Office Memos',
    description: 'View memos from administration. Pinned and high-priority memos appear at the top.',
    tips: [
      'Unread memos are highlighted. Click a memo to mark it as read.',
      'Pinned memos always stay at the top of the list.',
      'Priority levels: Low (green), Medium (orange), High (red), Urgent (pulsing red).',
    ],
    faqs: [
      { question: 'Can I reply to a memo?', answer: 'Memos are one-way — contact the sender directly via SMS or Email if you need to respond.' },
      { question: 'How do I know if I\'ve read a memo?', answer: 'Read memos lose their highlight and show a checkmark. The unread count in your dashboard also updates.' },
    ],
  },

  // ── Timesheets ────────────────────────────────
  [`${BASE}/dashboard/timesheets`]: {
    title: 'Timesheets',
    description: 'Track your daily hours for each biweekly pay period. Save drafts and submit when ready for approval.',
    steps: [
      { label: 'Navigate to the correct pay period', detail: 'Use the left/right arrows to move between pay periods. The current period is selected by default.' },
      { label: 'Enter daily hours', detail: 'Click on each day and enter your start time, end time, and any break time. Hours are calculated automatically.' },
      { label: 'Use schedule presets', detail: 'Click a preset (e.g. "Regular 8h") to quickly fill in standard hours instead of typing manually.' },
      { label: 'Save as draft', detail: 'Click Save to store your entries without submitting. You can come back and edit later.' },
      { label: 'Submit for approval', detail: 'When your timesheet is complete, click Submit. Your admin will review and approve or reject it.' },
    ],
    tips: [
      'You can save a draft at any time — your entries won\'t be lost.',
      'Once submitted, you cannot edit the timesheet unless it\'s rejected.',
      'Weekends are shaded differently — you can still log hours on weekends if needed.',
      'Check the total hours at the bottom to make sure everything adds up.',
    ],
    faqs: [
      { question: 'What happens after I submit?', answer: 'Your timesheet goes to your admin/manager for review. They will approve or reject it. Check back to see the status.' },
      { question: 'Can I edit a submitted timesheet?', answer: 'No — once submitted, it\'s locked. If rejected, it returns to draft status and you can edit it.' },
      { question: 'What are the schedule presets?', answer: 'Quick-fill options like "Regular 8h" (9am–5pm, 1h break) or "Half Day" (9am–1pm) that auto-fill the time fields.' },
    ],
  },

  // ── Travel Forms List ─────────────────────────
  [`${BASE}/dashboard/travel`]: {
    title: 'Travel Forms',
    description: 'View and manage your travel expense claims. Create new claims or check the status of submitted ones.',
    steps: [
      { label: 'View your forms', detail: 'Filter by status (Draft, Submitted, Approved, Rejected) using the tabs at the top.' },
      { label: 'Create a new form', detail: 'Click "New Travel Form" to start a new expense claim.' },
      { label: 'Edit drafts', detail: 'Click on any draft form to continue editing it.' },
    ],
    tips: [
      'Draft forms are not visible to admins until you submit them.',
      'The status counts at the top give you a quick overview.',
    ],
  },

  // ── New Travel Form ───────────────────────────
  [`${BASE}/dashboard/travel/new`]: {
    title: 'New Travel Form',
    description: 'Create a travel expense claim. Fill in each tab: basic info, accommodation, meals, transportation, and other expenses.',
    steps: [
      { label: 'Basic Info', detail: 'Enter the trip purpose, destination, and travel dates.' },
      { label: 'Accommodation', detail: 'Add hotel or lodging expenses. Default rates are pre-filled.' },
      { label: 'Meals', detail: 'Select which meals to claim for each day. Per-diem rates are applied automatically.' },
      { label: 'Transportation', detail: 'Enter mileage or add receipts for flights, taxis, rentals, etc.' },
      { label: 'Other Expenses', detail: 'Add any additional costs (parking, registration fees, supplies, etc.).' },
      { label: 'Review & Submit', detail: 'Check the totals on each tab. Save as draft or submit for approval.' },
    ],
    tips: [
      'Default rates are pre-filled from government travel guidelines — override only if needed.',
      'Totals update automatically as you enter expenses.',
      'Save as draft frequently — you can come back to finish later.',
      'Make sure dates are correct — travel dates affect meal and accommodation calculations.',
    ],
    faqs: [
      { question: 'What are the default meal rates?', answer: 'Rates follow government per-diem guidelines: breakfast, lunch, dinner, and incidentals each have set amounts.' },
      { question: 'Can I claim partial days?', answer: 'Yes — on the Meals tab, select only the meals applicable for partial travel days.' },
    ],
  },

  // ── Sign-Up Forms List ────────────────────────
  [`${BASE}/dashboard/forms`]: {
    title: 'Sign-Up Forms',
    description: 'View community sign-up forms you\'ve created. Check submission counts and form status.',
    tips: [
      'Filter between All, Active, and Closed forms using the tabs.',
      'Click on a form to view its submissions and details.',
      'Active forms are accepting submissions; Closed forms are view-only.',
    ],
  },

  // ── New Sign-Up Form ──────────────────────────
  [`${BASE}/dashboard/forms/new`]: {
    title: 'Create Sign-Up Form',
    description: 'Build a custom form for community sign-ups, registrations, or surveys.',
    steps: [
      { label: 'Set form details', detail: 'Enter a form title, description, and select a department/category.' },
      { label: 'Add fields', detail: 'Click "Add Field" and choose a field type (text, email, phone, dropdown, etc.). Drag to reorder.' },
      { label: 'Configure each field', detail: 'Set the field label, placeholder text, and whether it\'s required. For dropdowns, add the options.' },
      { label: 'Preview', detail: 'Use the Preview tab to see how the form looks to community members.' },
      { label: 'Save/Publish', detail: 'Save to create the form. It will be available for submissions immediately.' },
    ],
    tips: [
      'Available field types: Text, Textarea, Number, Email, Phone, Date, Dropdown, Multi-Select, and Checkbox.',
      'Mark important fields as "Required" so submissions can\'t skip them.',
      'Use the Preview mode to test your form before publishing.',
      'You can edit the form after creation — but existing submissions won\'t change.',
    ],
    faqs: [
      { question: 'Can I add conditional logic?', answer: 'Not currently — all fields appear for every respondent.' },
      { question: 'Where do community members access the form?', answer: 'Published forms appear on the TCN community portal under the appropriate department.' },
    ],
  },

  // ── Form Detail (dynamic route) ───────────────
  [`${BASE}/dashboard/forms/[id]`]: {
    title: 'Form Details & Submissions',
    description: 'View a specific sign-up form\'s fields and all submissions received.',
    tips: [
      'Submissions are listed in reverse chronological order (newest first).',
      'You can delete individual submissions if needed.',
      'Click Refresh to check for new submissions.',
    ],
  },

  // ──────────────────────────────────────────────
  // ADMIN SECTION
  // ──────────────────────────────────────────────
  [`${BASE}/admin`]: {
    title: 'Admin Dashboard',
    description: 'Administrative overview showing staff counts, pending approvals, active memos, forms, and recent activity.',
    tips: [
      'Pending timesheets and travel forms need your review — click to jump to the review page.',
      'Stats refresh each time you visit the dashboard.',
      'The activity chart shows communication trends over the last 30 days.',
    ],
    faqs: [
      { question: 'What roles can access admin?', answer: 'Staff Admin, Admin, and Council roles. Regular Staff only see the staff dashboard.' },
    ],
  },

  // ── Admin Staff Manager ───────────────────────
  [`${BASE}/admin/staff`]: {
    title: 'Staff Manager',
    description: 'Create, edit, and manage staff user accounts. Assign roles and departments.',
    steps: [
      { label: 'View staff list', detail: 'Browse all staff accounts. Use search to filter by name or email.' },
      { label: 'Create a new user', detail: 'Click "Add Staff" and fill in name, email, department, and role.' },
      { label: 'Edit a user', detail: 'Click the edit icon on any row to update their details or role.' },
      { label: 'Change password', detail: 'Use the password action to set a new password for a user.' },
      { label: 'Delete a user', detail: 'Click delete to remove a staff account. This cannot be undone.' },
    ],
    tips: [
      'Roles: Staff (basic access), Staff Admin (can review timesheets/travel/memos/forms), Admin (full access + staff management), Council (full access).',
      'You cannot delete your own account.',
      'Filter by role to quickly find specific user groups.',
    ],
    faqs: [
      { question: 'What\'s the difference between Admin and Council?', answer: 'Both have full access. Council is a separate designation for elected council members.' },
      { question: 'Can a Staff Admin manage other staff accounts?', answer: 'No — only Admin and Council roles can create/edit/delete staff accounts.' },
    ],
  },

  // ── Admin Memos ───────────────────────────────
  [`${BASE}/admin/memos`]: {
    title: 'Memos Manager',
    description: 'Create, edit, pin, and delete office memos for all staff to read.',
    steps: [
      { label: 'Create a memo', detail: 'Click "New Memo" and enter a title, body, priority level, and target department (or All).' },
      { label: 'Pin important memos', detail: 'Toggle the pin icon to keep a memo at the top of everyone\'s list.' },
      { label: 'Edit or delete', detail: 'Click Edit to update memo content, or Delete to remove it entirely.' },
    ],
    tips: [
      'Priority levels affect how the memo appears: Urgent memos pulse to draw attention.',
      'You can target memos to specific departments or send to all staff.',
      'Check the "Read By" count to see how many staff have opened the memo.',
    ],
  },

  // ── Admin Communications ──────────────────────
  [`${BASE}/admin/communications`]: {
    title: 'Admin Communications Hub',
    description: 'Send SMS, Email, and Bulletins as an administrator with additional scheduling options.',
    tips: [
      'Admin communications have scheduling support — set a future date/time for delivery.',
      'Use SMS for time-sensitive notices.',
      'Use Email for detailed communications with attachments.',
      'Use Bulletins to post to the community portal.',
    ],
  },

  [`${BASE}/admin/communications/sms`]: {
    title: 'Admin SMS',
    description: 'Send SMS messages with optional scheduling. Same features as the staff SMS tool plus a date/time picker for future delivery.',
    steps: [
      { label: 'Write your message', detail: 'Compose an SMS and monitor the character/segment counter.' },
      { label: 'Select recipients', detail: 'Search and select community members by name, T-number, or community.' },
      { label: 'Schedule (optional)', detail: 'Toggle scheduling to pick a future date and time for delivery.' },
      { label: 'Send or schedule', detail: 'Click Send for immediate delivery, or Schedule to queue it.' },
    ],
    tips: [
      'Scheduled messages can be cancelled before the delivery time.',
      'All the same character limits and segment rules from the staff SMS apply here.',
    ],
  },

  [`${BASE}/admin/communications/email`]: {
    title: 'Admin Email',
    description: 'Send emails with letterhead and scheduling support.',
    steps: [
      { label: 'Compose', detail: 'Enter subject, write email body using the rich text editor.' },
      { label: 'Add letterhead', detail: 'Toggle letterhead and select a logo for branded emails.' },
      { label: 'Select recipients', detail: 'Search and select members with emails on file.' },
      { label: 'Schedule (optional)', detail: 'Set a future send date/time if needed.' },
      { label: 'Send', detail: 'Click Send or Schedule to deliver.' },
    ],
    tips: [
      'Use letterhead for all official communications.',
      'Scheduled emails appear in a queue you can manage.',
    ],
  },

  [`${BASE}/admin/communications/bulletin`]: {
    title: 'Admin Bulletin',
    description: 'Create and manage community portal bulletins. Same as the staff bulletin creator.',
    steps: [
      { label: 'Choose type', detail: 'Text bulletin or poster (image upload).' },
      { label: 'Fill in content', detail: 'Add title, category, and body or upload an image.' },
      { label: 'Publish', detail: 'Click Create to push to the community portal.' },
    ],
    tips: [
      'You can manage all bulletins (including those created by staff) from the admin bulletin history.',
    ],
  },

  // ── Admin Timesheets ──────────────────────────
  [`${BASE}/admin/timesheets`]: {
    title: 'Timesheets Review',
    description: 'Review, approve, or reject staff timesheets submitted for each pay period.',
    steps: [
      { label: 'Filter submissions', detail: 'Use the status tabs to show Pending, Approved, or Rejected timesheets. Use search to find a specific staff member.' },
      { label: 'Review a timesheet', detail: 'Click on a submission to expand and see daily hour entries.' },
      { label: 'Approve', detail: 'Click Approve if the hours look correct.' },
      { label: 'Reject', detail: 'Click Reject and provide a reason. The staff member will see the reason and can resubmit.' },
    ],
    tips: [
      'Check total hours against expected hours for the pay period.',
      'Rejected timesheets return to draft status for the staff member.',
      'The pending count on your dashboard reflects items awaiting your review.',
    ],
    faqs: [
      { question: 'Can I approve a timesheet I already rejected?', answer: 'The staff member needs to resubmit after editing. You\'ll see it as a new pending submission.' },
    ],
  },

  // ── Admin Travel ──────────────────────────────
  [`${BASE}/admin/travel`]: {
    title: 'Travel Forms Review',
    description: 'Review, approve, or reject travel expense claims submitted by staff.',
    steps: [
      { label: 'Filter by status', detail: 'View Pending, Approved, or Rejected travel forms.' },
      { label: 'Review a claim', detail: 'Click on a form to see all expense details — accommodation, meals, transportation, and other costs.' },
      { label: 'Approve or Reject', detail: 'Approve if expenses are valid, or Reject with a reason.' },
    ],
    tips: [
      'Compare claimed rates against the default government per-diem rates.',
      'Check that travel dates match the expense entries.',
      'Rejected forms return to draft status for the staff member.',
    ],
  },

  // ── Admin Forms ───────────────────────────────
  [`${BASE}/admin/forms`]: {
    title: 'Admin Forms Manager',
    description: 'Manage all sign-up forms across the organization. View submissions and delete forms.',
    tips: [
      'You can see forms created by any staff member.',
      'Deleting a form also deletes all its submissions — use with caution.',
      'Filter by Active or Closed to manage form lifecycle.',
    ],
  },

  [`${BASE}/admin/forms/new`]: {
    title: 'Admin Create Form',
    description: 'Build a new sign-up form. Same as the staff form builder with all field types available.',
    steps: [
      { label: 'Set form details', detail: 'Title, description, and department category.' },
      { label: 'Add fields', detail: 'Choose from 8+ field types and configure labels, placeholders, and required status.' },
      { label: 'Preview & Save', detail: 'Preview the form, then save to make it live.' },
    ],
  },

  [`${BASE}/admin/forms/[id]`]: {
    title: 'Admin Form Detail',
    description: 'View form details through to individual submissions. Manage and delete submissions.',
    tips: [
      'Click on any submission to expand full details.',
      'Delete submissions that are spam or duplicates.',
    ],
  },

  // ── Login ─────────────────────────────────────
  [`${BASE}/login`]: {
    title: 'Staff Login',
    description: 'Sign in with your staff email and password.',
    tips: [
      'This app is designed for desktop use (1024px+ screens).',
      'Contact your admin if you\'ve forgotten your password.',
    ],
  },
}

/**
 * Match a route path to help content.
 * Handles dynamic segments like [id] by checking if a pattern matches.
 */
export function getHelpForRoute(pathname: string): HelpEntry | null {
  // Direct match first
  if (helpContent[pathname]) {
    return helpContent[pathname]
  }

  // Try matching dynamic routes (e.g. /forms/abc123 → /forms/[id])
  for (const [pattern, entry] of Object.entries(helpContent)) {
    if (pattern.includes('[')) {
      const regex = new RegExp(
        '^' + pattern.replace(/\[[\w]+\]/g, '[^/]+') + '$'
      )
      if (regex.test(pathname)) {
        return entry
      }
    }
  }

  return null
}
