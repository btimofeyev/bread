import { NextRequest, NextResponse } from 'next/server'

interface RateLimitRule {
  interval: number // Time window in ms
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitStore {
  [key: string]: {
    count: number
    lastReset: number
  }
}

// In-memory store (in production, use Redis or similar)
const store: RateLimitStore = {}

// Default rate limit: 100 requests per 15 minutes
const DEFAULT_RULES: RateLimitRule = {
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 100
}

// Stricter limits for specific endpoints
const ENDPOINT_RULES: Record<string, RateLimitRule> = {
  '/api/orders': {
    interval: 60 * 1000, // 1 minute  
    uniqueTokenPerInterval: 10 // 10 orders per minute max
  },
  '/api/auth': {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 5 // 5 auth attempts per minute
  },
  '/api/upload': {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 20 // 20 uploads per minute
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Use IP address as identifier
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  
  // In production, you might also want to consider user ID for authenticated requests
  const userId = request.headers.get('authorization') ? 'authenticated' : 'anonymous'
  
  return `${ip}-${userId}`
}

function getRuleForEndpoint(pathname: string): RateLimitRule {
  // Find the most specific rule
  for (const [endpoint, rule] of Object.entries(ENDPOINT_RULES)) {
    if (pathname.startsWith(endpoint)) {
      return rule
    }
  }
  return DEFAULT_RULES
}

export function rateLimit(
  request: NextRequest,
  customRule?: RateLimitRule
): { success: boolean; remaining: number; resetTime: number } {
  const identifier = getClientIdentifier(request)
  const rule = customRule || getRuleForEndpoint(request.nextUrl.pathname)
  const key = `${identifier}-${request.nextUrl.pathname}`
  
  const now = Date.now()
  const entry = store[key]
  
  if (!entry || now - entry.lastReset > rule.interval) {
    // Reset or create new entry
    store[key] = {
      count: 1,
      lastReset: now
    }
    return {
      success: true,
      remaining: rule.uniqueTokenPerInterval - 1,
      resetTime: now + rule.interval
    }
  }
  
  if (entry.count >= rule.uniqueTokenPerInterval) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      resetTime: entry.lastReset + rule.interval
    }
  }
  
  // Increment counter
  entry.count++
  
  return {
    success: true,
    remaining: rule.uniqueTokenPerInterval - entry.count,
    resetTime: entry.lastReset + rule.interval
  }
}

export function createRateLimitResponse(
  remaining: number,
  resetTime: number,
  message = 'Too many requests'
): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}

// Helper to add rate limiting to API routes
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  customRule?: RateLimitRule
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { success, remaining, resetTime } = rateLimit(request, customRule)
    
    if (!success) {
      return createRateLimitResponse(remaining, resetTime)
    }
    
    // Add rate limit headers to successful responses
    const response = await handler(request)
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
    
    return response
  }
}

// Clean up old entries periodically (call this from a cron job in production)
export function cleanupRateLimitStore() {
  const now = Date.now()
  for (const [key, entry] of Object.entries(store)) {
    // Remove entries older than 1 hour
    if (now - entry.lastReset > 60 * 60 * 1000) {
      delete store[key]
    }
  }
}