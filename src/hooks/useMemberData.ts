'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { getMemberData } from '@/lib/auth-actions'

export interface MemberData {
  id: string
  first_name: string
  last_name: string
  t_number: string
  birthdate: string
  activated: string
  auth: {
    username: string
    email: string
    verified: boolean
    lastLogin: string | null
  } | null
  profile: any[]
  barcode: any[]
  family: any[]
}

export function useMemberData() {
  const { user, isAuthenticated } = useAuth()

  return useQuery<MemberData>({
    queryKey: ['member-data', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }
      
      const result = await getMemberData(user.id)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch member data')
      }
      
      return result.data as MemberData
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}
