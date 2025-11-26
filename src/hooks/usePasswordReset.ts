'use client'

import { useMutation } from '@tanstack/react-query'
import { requestPasswordReset, resetPassword } from '@/lib/auth-actions'

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const result = await requestPasswordReset(email)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send reset email')
      }
      
      return result
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      const result = await resetPassword(token, password)
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reset password')
      }
      
      return result
    },
  })
}
