/**
 * TCN Portal Sync Client
 * 
 * Copy this file to your Master Database Manager project.
 * Configure the environment variables and use the exported functions
 * to sync data with the TCN Member Portal.
 * 
 * BIDIRECTIONAL SYNC:
 * - Master → Portal: fnmember, Barcode (Master is source of truth)
 * - Portal → Master: Profile, Family (Members update their own contact info)
 * 
 * Required Environment Variables:
 * - PORTAL_API_KEY: Your API key for the portal
 * - PORTAL_API_URL: Base URL of the portal API (e.g., https://portal.tcn.ca/api/sync)
 */

// Types
export interface Member {
  id?: string;
  birthdate: Date | string;
  first_name: string;
  last_name: string;
  t_number: string;
  deceased?: string | null;
}

export interface Profile {
  id?: string;
  gender?: string | null;
  o_r_status: string;
  community: string;
  address: string;
  phone_number: string;
  email: string;
  image_url?: string | null;
  fnmemberId?: string | null;
}

export interface Barcode {
  id?: string;
  barcode: string;
  activated?: number;
  fnmemberId?: string | null;
}

export interface Family {
  id?: string;
  spouse_fname?: string | null;
  spouse_lname?: string | null;
  dependents?: number;
  fnmemberId?: string | null;
}

export interface NewMemberWithRelations extends Member {
  profile?: Omit<Profile, 'id' | 'fnmemberId'>;
  barcode?: Omit<Barcode, 'id' | 'fnmemberId'>;
  family?: Omit<Family, 'id' | 'fnmemberId'>;
}

export interface SyncItem {
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPSERT';
  model: 'fnmember' | 'Profile' | 'Barcode' | 'Family';
  data?: any;
  id?: string;
}

export interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  timestamp: string;
}

export interface BatchSyncResult {
  syncId?: string;
  processed: number;
  failed: number;
  total: number;
  results?: Array<{
    index: number;
    success: boolean;
    error?: string;
  }>;
}

// Configuration
const getConfig = () => {
  const apiKey = process.env.PORTAL_API_KEY;
  const apiUrl = process.env.PORTAL_API_URL;

  if (!apiKey) {
    throw new Error('PORTAL_API_KEY environment variable is not set');
  }
  if (!apiUrl) {
    throw new Error('PORTAL_API_URL environment variable is not set');
  }

  return { apiKey, apiUrl };
};

// Base fetch function
async function syncFetch<T = any>(
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: any
): Promise<SyncResponse & { data?: T }> {
  const { apiKey, apiUrl } = getConfig();

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`Sync API error: ${response.status}`, result);
    }

    return result;
  } catch (error: any) {
    console.error('Sync fetch error:', error);
    return {
      success: false,
      error: error.message || 'Network error',
      timestamp: new Date().toISOString(),
    };
  }
}

// ==================== API FUNCTIONS ====================

/**
 * Check the portal sync API status
 */
export async function checkPortalStatus(): Promise<SyncResponse> {
  return syncFetch('/status', 'GET');
}

/**
 * Create a new member in the portal
 */
export async function createMember(member: NewMemberWithRelations): Promise<SyncResponse> {
  return syncFetch('/members', 'POST', member);
}

/**
 * Update an existing member in the portal
 */
export async function updateMember(
  id: string,
  updates: Partial<Omit<Member, 'id'>>
): Promise<SyncResponse> {
  return syncFetch('/members', 'POST', { id, ...updates });
}

/**
 * Update member by t_number (creates if doesn't exist)
 */
export async function upsertMemberByTNumber(member: Member): Promise<SyncResponse> {
  return syncFetch('/members', 'POST', member);
}

/**
 * Mark a member as deceased
 */
export async function markMemberDeceased(
  identifier: { memberId?: string; t_number?: string },
  deceasedDate: string
): Promise<SyncResponse> {
  if (!identifier.memberId && !identifier.t_number) {
    return {
      success: false,
      error: 'Either memberId or t_number must be provided',
      timestamp: new Date().toISOString(),
    };
  }

  return syncFetch('/members', 'DELETE', {
    ...identifier,
    deceasedDate,
  });
}

/**
 * Get members updated since a specific date (delta sync)
 */
export async function getUpdatedMembers(
  since: Date,
  options: { limit?: number; cursor?: string } = {}
): Promise<SyncResponse> {
  const params = new URLSearchParams({
    since: since.toISOString(),
    limit: String(options.limit || 100),
  });
  
  if (options.cursor) {
    params.append('cursor', options.cursor);
  }

  return syncFetch(`/members?${params.toString()}`, 'GET');
}

/**
 * Perform batch sync operations
 */
export async function batchSync(
  items: SyncItem[],
  syncId?: string
): Promise<SyncResponse & { data?: BatchSyncResult }> {
  return syncFetch('/batch', 'POST', {
    syncId: syncId || crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    source: 'master',
    items,
  });
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Sync a single member with all relations
 */
export async function syncFullMember(
  member: Member,
  profile?: Omit<Profile, 'id' | 'fnmemberId'>,
  barcode?: Omit<Barcode, 'id' | 'fnmemberId'>,
  family?: Omit<Family, 'id' | 'fnmemberId'>
): Promise<SyncResponse> {
  return createMember({
    ...member,
    profile,
    barcode,
    family,
  });
}

/**
 * Sync multiple members in batch
 */
export async function syncMembersBatch(members: NewMemberWithRelations[]): Promise<SyncResponse> {
  const items: SyncItem[] = members.map(member => ({
    operation: 'UPSERT' as const,
    model: 'fnmember' as const,
    data: {
      id: member.id || generateCuid(),
      birthdate: member.birthdate,
      first_name: member.first_name,
      last_name: member.last_name,
      t_number: member.t_number,
      deceased: member.deceased,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    },
  }));

  return batchSync(items);
}

/**
 * Update contact info for a member's profile
 */
export async function updateMemberContact(
  profileId: string,
  contact: { phone_number?: string; email?: string; address?: string }
): Promise<SyncResponse> {
  const items: SyncItem[] = [{
    operation: 'UPDATE',
    model: 'Profile',
    data: {
      id: profileId,
      ...contact,
    },
  }];

  return batchSync(items);
}

/**
 * Get all updates since last sync and return paginated results
 */
export async function getAllUpdatesSince(since: Date): Promise<{
  members: any[];
  errors: string[];
}> {
  const allMembers: any[] = [];
  const errors: string[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const result = await getUpdatedMembers(since, { limit: 100, cursor });
    
    if (!result.success) {
      errors.push(result.error || 'Unknown error');
      break;
    }

    if (result.data?.members) {
      allMembers.push(...result.data.members);
    }

    cursor = result.data?.pagination?.nextCursor;
    hasMore = result.data?.pagination?.hasMore || false;
  }

  return { members: allMembers, errors };
}

// ==================== PULL FROM PORTAL (Portal → Master) ====================
// These functions allow the master DB to PULL Profile & Family updates from the portal

/**
 * Pull Profile updates from the portal (member-edited contact info)
 * Use this to sync contact information that members updated on the portal
 */
export async function pullProfileUpdates(
  options: { since?: Date; limit?: number; cursor?: string } = {}
): Promise<SyncResponse & { data?: { profiles: Profile[]; pagination: any } }> {
  const params = new URLSearchParams({
    models: 'Profile',
    limit: String(options.limit || 100),
  });
  
  if (options.since) {
    params.append('since', options.since.toISOString());
  }
  if (options.cursor) {
    params.append('cursor', options.cursor);
  }

  return syncFetch(`/pull?${params.toString()}`, 'GET');
}

/**
 * Pull Family updates from the portal (member-edited family info)
 */
export async function pullFamilyUpdates(
  options: { since?: Date; limit?: number; cursor?: string } = {}
): Promise<SyncResponse & { data?: { families: Family[]; pagination: any } }> {
  const params = new URLSearchParams({
    models: 'Family',
    limit: String(options.limit || 100),
  });
  
  if (options.since) {
    params.append('since', options.since.toISOString());
  }
  if (options.cursor) {
    params.append('cursor', options.cursor);
  }

  return syncFetch(`/pull?${params.toString()}`, 'GET');
}

/**
 * Pull all member-editable data (Profile + Family) from the portal
 */
export async function pullAllMemberUpdates(
  options: { since?: Date; limit?: number } = {}
): Promise<SyncResponse & { data?: { profiles: Profile[]; families: Family[]; pagination: any } }> {
  const params = new URLSearchParams({
    models: 'Profile,Family',
    limit: String(options.limit || 100),
  });
  
  if (options.since) {
    params.append('since', options.since.toISOString());
  }

  return syncFetch(`/pull?${params.toString()}`, 'GET');
}

/**
 * Pull ALL Profile and Family updates since last sync (handles pagination)
 * Returns all records updated since the given date
 */
export async function pullAllUpdatesSince(since: Date): Promise<{
  profiles: any[];
  families: any[];
  errors: string[];
}> {
  const allProfiles: any[] = [];
  const allFamilies: any[] = [];
  const errors: string[] = [];
  
  // Pull profiles
  let cursor: string | undefined;
  let hasMore = true;
  
  while (hasMore) {
    const result = await pullProfileUpdates({ since, limit: 100, cursor });
    
    if (!result.success) {
      errors.push(`Profile pull error: ${result.error}`);
      break;
    }
    
    if (result.data?.profiles) {
      allProfiles.push(...result.data.profiles);
    }
    
    cursor = result.data?.pagination?.nextCursor;
    hasMore = result.data?.pagination?.hasMore || false;
  }
  
  // Pull families
  cursor = undefined;
  hasMore = true;
  
  while (hasMore) {
    const result = await pullFamilyUpdates({ since, limit: 100, cursor });
    
    if (!result.success) {
      errors.push(`Family pull error: ${result.error}`);
      break;
    }
    
    if (result.data?.families) {
      allFamilies.push(...result.data.families);
    }
    
    cursor = result.data?.pagination?.nextCursor;
    hasMore = result.data?.pagination?.hasMore || false;
  }
  
  return { profiles: allProfiles, families: allFamilies, errors };
}

// Simple CUID generator (you may want to use a proper library)
function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}

// ==================== EXAMPLE USAGE ====================
/*
import { 
  checkPortalStatus, 
  createMember, 
  updateMember,
  markMemberDeceased,
  batchSync,
  pullProfileUpdates,
  pullFamilyUpdates,
  pullAllUpdatesSince,
} from './portal-sync-client';

// ========== PUSH TO PORTAL (Master → Portal) ==========
// Use these when YOU update fnmember or Barcode data

// Check status first
const status = await checkPortalStatus();
console.log('Portal status:', status);

// Create new member (pushes to portal)
const newMember = await createMember({
  birthdate: '1990-05-15',
  first_name: 'John',
  last_name: 'Flett',
  t_number: 'TCN-12345',
  profile: {
    gender: 'M',
    o_r_status: 'On-Reserve',
    community: 'Split Lake',
    address: '123 Main St',
    phone_number: '(204) 555-1234',
    email: 'john@example.com',
  },
});

// Update member name (pushes to portal)
const updated = await updateMember('clx123...', {
  first_name: 'Jonathan',
});

// Mark deceased (pushes to portal)
const deceased = await markMemberDeceased(
  { t_number: 'TCN-12345' },
  '2025-11-15'
);

// ========== PULL FROM PORTAL (Portal → Master) ==========
// Use these to get Profile/Family updates that members made on the portal

// Pull all Profile updates since last sync
const profileUpdates = await pullProfileUpdates({ 
  since: new Date('2025-11-01') 
});
console.log('Updated profiles:', profileUpdates.data?.profiles);

// Pull all Family updates since last sync
const familyUpdates = await pullFamilyUpdates({ 
  since: new Date('2025-11-01') 
});
console.log('Updated families:', familyUpdates.data?.families);

// Pull everything since last sync (handles pagination automatically)
const allUpdates = await pullAllUpdatesSince(new Date('2025-11-01'));
console.log(`Got ${allUpdates.profiles.length} profiles and ${allUpdates.families.length} families`);

// Process updates and save to your master database
for (const profile of allUpdates.profiles) {
  console.log(`Member ${profile.member?.t_number} updated contact info:`, {
    email: profile.email,
    phone: profile.phone_number,
    address: profile.address,
  });
  // Save to your master DB here...
}
*/
