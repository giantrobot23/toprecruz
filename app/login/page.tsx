"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FormData {
  email: string
  password: string
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (hasError) {
      console.error('Login page error:', error)
    }
  }, [hasError, error])

  if (hasError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    )
  }

  try {
    return <>{children}</>
  } catch (e) {
    setError(e instanceof Error ? e : new Error('Unknown error'))
    setHasError(true)
    return null
  }
}

function LoginForm() {
  console.log('LoginForm rendering') // Debug log
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })

  useEffect(() => {
    // Debug logs
    console.log('LoginForm useEffect', {
      user,
      authLoading,
      searchParams: searchParams?.toString()
    })

    // If user is already logged in, redirect them
    if (user && !authLoading) {
      try {
        const redirectTo = searchParams?.get('redirect')
        const decodedRedirect = redirectTo ? decodeURIComponent(redirectTo) : '/dashboard'
        console.log('Redirecting to:', decodedRedirect) // Debug log
        router.push(decodedRedirect)
      } catch (e) {
        console.error('Redirect error:', e)
        router.push('/dashboard') // Fallback to dashboard if redirect fails
      }
    }
  }, [user, authLoading, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('Attempting sign in') // Debug log
      await signIn(formData.email, formData.password)
      toast.success('Signed in successfully')
      // Redirect will be handled by useEffect when user state updates
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid email or password')
      toast.error('Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </ErrorBoundary>
  )
}

