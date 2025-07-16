import { z } from 'zod'

// Define the environment schema
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, 'Stripe publishable key is required'),
  STRIPE_SECRET_KEY: z.string().min(1, 'Stripe secret key is required'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'Stripe webhook secret is required'),
  
  // Application
  NEXT_PUBLIC_SITE_URL: z.string().url('Invalid site URL'),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional()
})

export type Env = z.infer<typeof envSchema>

/**
 * Validates all required environment variables
 * Throws an error if any required variables are missing or invalid
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n')
      
      console.error('❌ Environment variable validation failed:')
      console.error(missingVars)
      console.error('\n📝 Please check your .env.local file and ensure all required variables are set.')
      console.error('💡 See .env.example for the required variables and their format.\n')
      
      throw new Error(`Environment validation failed:\n${missingVars}`)
    }
    throw error
  }
}

/**
 * Validates environment variables and returns them
 * Use this at the top of your application startup
 */
export function getValidatedEnv(): Env {
  return validateEnv()
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if we're in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

// Validate environment variables on module load
// This ensures errors are caught early in the application lifecycle
if (typeof window === 'undefined') {
  // Only validate on server-side to avoid issues with client-side rendering
  try {
    validateEnv()
    // Environment variables validated successfully
  } catch (error) {
    // Don't throw during module load to avoid breaking the build
    // The error will be thrown when the functions are called
    console.warn('⚠️ Environment validation failed during module load')
  }
}