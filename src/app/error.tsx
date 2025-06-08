
'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled Client-Side Error Boundary:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="text-center p-8 border border-primary/30 bg-card/80 rounded-lg shadow-xl max-w-md">
        <Bot className="h-20 w-20 text-primary mx-auto mb-6" />
        <h1 className="text-4xl font-headline text-primary mb-3">Oops!</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Something went wrong.</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected issue. Please try again, or if the problem persists,
          let us know.
        </p>
        {error?.message && (
            <p className="text-xs text-destructive/80 bg-destructive/10 p-2 rounded-md my-3">
                Error detail: {error.message}
            </p>
        )}
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          size="lg"
          className="font-semibold"
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}
