'use client'

import { useState } from 'react'
import { Fingerprint, Loader2, Trash2, Smartphone, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  useWebAuthnSupport, 
  useRegisterFingerprint, 
  useWebAuthnCredentials,
  useDeleteCredential 
} from '@/hooks/useWebAuthn'
import { formatDistanceToNow } from 'date-fns'

export function FingerprintSettings() {
  const { isSupported } = useWebAuthnSupport()
  const { data: credentials, isLoading: loadingCredentials } = useWebAuthnCredentials()
  const registerMutation = useRegisterFingerprint()
  const deleteMutation = useDeleteCredential()
  
  const [deviceName, setDeviceName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleRegister = async () => {
    setError('')
    setSuccess('')
    
    try {
      await registerMutation.mutateAsync(deviceName || undefined)
      setSuccess('Fingerprint registered successfully!')
      setDeviceName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  const handleDelete = async (credentialId: string) => {
    setError('')
    setSuccess('')
    
    if (!confirm('Are you sure you want to remove this device? You will no longer be able to sign in with fingerprint on this device.')) {
      return
    }
    
    try {
      await deleteMutation.mutateAsync(credentialId)
      setSuccess('Device removed successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove device')
    }
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Fingerprint Sign-in
          </CardTitle>
          <CardDescription>
            Sign in quickly using your device&apos;s fingerprint sensor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Fingerprint authentication is not supported on this browser or device. 
            Try using a modern browser on a device with a fingerprint sensor.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Fingerprint Sign-in
        </CardTitle>
        <CardDescription>
          Register your device to sign in quickly using your fingerprint
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success/Error Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Registered Devices */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Registered Devices</h4>
          
          {loadingCredentials ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading devices...
            </div>
          ) : credentials && credentials.length > 0 ? (
            <div className="space-y-2">
              {credentials.map((cred) => (
                <div 
                  key={cred.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {cred.deviceName || 'Unknown Device'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDistanceToNow(new Date(cred.created), { addSuffix: true })}
                        {cred.lastUsed && (
                          <> • Last used {formatDistanceToNow(new Date(cred.lastUsed), { addSuffix: true })}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cred.id)}
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No devices registered. Add one below to enable fingerprint sign-in.
            </p>
          )}
        </div>

        {/* Register New Device */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="text-sm font-medium">Add New Device</h4>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Device name (optional, e.g., 'My Phone')"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            
            <Button
              onClick={handleRegister}
              disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Register This Device
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            When you click &quot;Register This Device&quot;, your device will prompt you to verify 
            your fingerprint. This creates a secure credential stored on your device.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
