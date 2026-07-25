export const BULLETIN_CATEGORIES = [
  'CHIEF_COUNCIL',
  'COMMUNITY_EVENTS',
  'ECONOMIC_DEVELOPMENT',
  'YOUTH',
  'LAND_TREATY',
  'CULTURAL_SPIRITUAL',
  'EDUCATION',
  'EMPLOYMENT',
  'HEALTH_FAMILY',
  'COMMUNITY_INFRASTRUCTURE',
  'RECREATION',
  'COMMUNITY_MEETINGS',
  'COMMUNITY_ADMIN',
  'TRSC',
] as const;

export type BulletinCategoryValue = typeof BULLETIN_CATEGORIES[number];

export const BULLETIN_CATEGORY_LABELS: Record<BulletinCategoryValue, string> = {
  CHIEF_COUNCIL: 'Chief & Council',
  COMMUNITY_EVENTS: 'Community Events',
  ECONOMIC_DEVELOPMENT: 'Economic Development',
  YOUTH: 'Youth',
  LAND_TREATY: 'Land & Treaty',
  CULTURAL_SPIRITUAL: 'Cultural & Spiritual',
  EDUCATION: 'Education',
  EMPLOYMENT: 'Employment',
  HEALTH_FAMILY: 'Health & Family',
  COMMUNITY_INFRASTRUCTURE: 'Community Infrastructure',
  RECREATION: 'Recreation',
  COMMUNITY_MEETINGS: 'Community Meetings',
  COMMUNITY_ADMIN: 'Community Admin',
  TRSC: 'TRSC',
};

export const BULLETIN_CATEGORY_OPTIONS: Array<{ value: BulletinCategoryValue; label: string }> =
  BULLETIN_CATEGORIES.map((value) => ({
    value,
    label: BULLETIN_CATEGORY_LABELS[value],
  }));

export const FORM_CATEGORIES = [
  'BAND_OFFICE',
  'BAND_MEMBERSHIP',
  'TREATY_LAND_ENTITLEMENT',
  'ADVERSE_AFFECTS',
  'TEMA',
  'RESOURCE_MGMT_BOARD',
  'TRSC',
  'CHURCH',
  'TRADITIONAL_LIFESTYLE',
  'EDUCATION_AUTHORITY',
  'CSCMEC',
  'TRADITIONAL_KNOWLEDGE',
  'ADULT_ED',
  'ISETS_TRAINING_EMPLOYMENT',
  'ON_GOING_JOBS_MB_HYDRO',
  'TCN_HEALTH',
  'TCN_PREVENTION',
  'JORDANS_PRINCIPLE',
  'WAWATAY',
  'KEEKINOW',
  'HEADSTART',
  'HOUSING',
  'PUBLIC_UTILITIES',
  'FIRE_DEPARTMENT',
  'WATER_TREATMENT_PLANT',
  'NAT_RESOURCES_HELI_PAD',
  'IT_COMMUNICATIONS',
  'BAND_HALL',
  'TCN_RECREATION',
  'TCN_GAMING',
  'ARENA',
  'PUBLIC_SAFETY_POLICE',
  'SOCIAL_WELFARE',
  'JUSTICE_PROGRAM',
  'FINANCE',
  'TCN_TRUST',
] as const;

export type FormCategoryValue = typeof FORM_CATEGORIES[number];

export const FORM_CATEGORY_LABELS: Record<FormCategoryValue, string> = {
  BAND_OFFICE: 'Band Office',
  BAND_MEMBERSHIP: 'Band Membership',
  TREATY_LAND_ENTITLEMENT: 'Treaty Land Entitlement',
  ADVERSE_AFFECTS: 'Adverse Affects',
  TEMA: 'TEMA',
  RESOURCE_MGMT_BOARD: 'Resource Management Board',
  TRSC: 'TRSC',
  CHURCH: 'Church',
  TRADITIONAL_LIFESTYLE: 'Traditional Lifestyle',
  EDUCATION_AUTHORITY: 'Education Authority',
  CSCMEC: 'CSCMEC',
  TRADITIONAL_KNOWLEDGE: 'Traditional Knowledge',
  ADULT_ED: 'Adult Education',
  ISETS_TRAINING_EMPLOYMENT: 'ISETS Training & Employment',
  ON_GOING_JOBS_MB_HYDRO: 'On-Going Jobs MB Hydro',
  TCN_HEALTH: 'TCN Health',
  TCN_PREVENTION: 'TCN Prevention',
  JORDANS_PRINCIPLE: "Jordan's Principle",
  WAWATAY: 'Wawatay',
  KEEKINOW: 'Keekinow',
  HEADSTART: 'Headstart',
  HOUSING: 'Housing',
  PUBLIC_UTILITIES: 'Public Utilities',
  FIRE_DEPARTMENT: 'Fire Department',
  WATER_TREATMENT_PLANT: 'Water Treatment Plant',
  NAT_RESOURCES_HELI_PAD: 'Natural Resources / Heli Pad',
  IT_COMMUNICATIONS: 'IT & Communications',
  BAND_HALL: 'Band Hall',
  TCN_RECREATION: 'TCN Recreation',
  TCN_GAMING: 'TCN Gaming',
  ARENA: 'Arena',
  PUBLIC_SAFETY_POLICE: 'Public Safety / Police',
  SOCIAL_WELFARE: 'Social Welfare',
  JUSTICE_PROGRAM: 'Justice Program',
  FINANCE: 'Finance',
  TCN_TRUST: 'TCN Trust',
};

export const FORM_CATEGORY_OPTIONS: Array<{ value: FormCategoryValue; label: string }> =
  FORM_CATEGORIES.map((value) => ({
    value,
    label: FORM_CATEGORY_LABELS[value],
  }));

const LEGACY_FORM_CATEGORY_MAP: Record<string, FormCategoryValue> = {
  HEALTH: 'TCN_HEALTH',
  EDUCATION: 'EDUCATION_AUTHORITY',
  RECREATION: 'TCN_RECREATION',
  EMPLOYMENT: 'ISETS_TRAINING_EMPLOYMENT',
  SOCIAL_SERVICES: 'SOCIAL_WELFARE',
  IRON_NORTH: 'RESOURCE_MGMT_BOARD',
  GENERAL: 'BAND_OFFICE',
};

export function isFormCategoryValue(value: string): value is FormCategoryValue {
  return FORM_CATEGORIES.includes(value as FormCategoryValue);
}

export function normalizeFormCategoryValue(category: string | undefined | null): FormCategoryValue {
  if (!category) return 'BAND_OFFICE';

  const upperCategory = category.toUpperCase().trim();
  if (isFormCategoryValue(upperCategory)) {
    return upperCategory;
  }

  return LEGACY_FORM_CATEGORY_MAP[upperCategory] || 'BAND_OFFICE';
}
