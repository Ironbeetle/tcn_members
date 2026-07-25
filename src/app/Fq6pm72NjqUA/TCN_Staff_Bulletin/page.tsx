'use client'

import { useStaffAuth } from '../contexts/StaffAuthContext'
import BulletinCreator from '../components/communications/BulletinCreator'

export default function StaffBulletinPage() {
  const { user } = useStaffAuth()

  return <BulletinCreator user={user} />
}
