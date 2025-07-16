'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            There was an issue with the authentication process. This could be due to an expired or invalid link.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/auth/login">Try Signing In Again</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}