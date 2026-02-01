'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Fingerprint, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthenticateWithFingerprint, useWebAuthnSupport } from '@/hooks/useWebAuthn'

interface FingerprintLoginProps {
  username?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export function FingerprintLogin({ 
  username, 
  onSuccess, 
  onError,
  className 
}: FingerprintLoginProps) {
  const router = useRouter()
  const { isSupported } = useWebAuthnSupport()
  const authenticateMutation = useAuthenticateWithFingerprint()
  const [error, setError] = useState<string>('')

  // Don't render if WebAuthn is not supported
  if (!isSupported) {
    return null
  }

  const handleFingerprintLogin = async () => {
    setError('')
    
    try {
      await authenticateMutation.mutateAsync(username)
      onSuccess?.()
      router.push('/TCN_Home')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
      onError?.(message)
    }
  }

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        onClick={handleFingerprintLogin}
        disabled={authenticateMutation.isPending}
        className="w-full flex items-center justify-center gap-2"
      >
        {authenticateMutation.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Fingerprint className="h-5 w-5" />
            Sign in with Fingerprint
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
