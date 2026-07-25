'use client'

/**
 * Bulletin Board Creator Page
 * 
 * Create poster or text bulletins for the community.
 * Matches the desktop Communications app structure.
 */

import { useStaffAuth } from '../../../contexts/StaffAuthContext'
import BulletinCreator from '../../../components/communications/BulletinCreator'

export default function BulletinPage() {
  const { user } = useStaffAuth()

  return <BulletinCreator user={user} />
}
