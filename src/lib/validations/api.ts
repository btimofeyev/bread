import { z } from 'zod'

// Product validation schemas
export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.number().positive('Price must be positive').max(1000, 'Price too high'),
  cost: z.number().positive('Cost must be positive').max(1000, 'Cost too high'),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  lead_time_hours: z.number().int().min(0, 'Lead time must be non-negative').max(168, 'Lead time too long').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  available: z.boolean().optional()
})

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  price: z.number().positive('Price must be positive').max(1000, 'Price too high').optional(),
  cost: z.number().positive('Cost must be positive').max(1000, 'Cost too high').optional(),
  category: z.string().min(1, 'Category is required').max(50, 'Category too long').optional(),
  lead_time_hours: z.number().int().min(0, 'Lead time must be non-negative').max(168, 'Lead time too long').optional(),
  image_url: z.string().url('Invalid image URL').optional(),
  available: z.boolean().optional()
})

// Order validation schemas
export const createOrderSchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  status: z.enum(['pending', 'confirmed', 'baking', 'ready', 'completed', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).optional(),
  total: z.number().positive('Total must be positive').max(10000, 'Total too high'),
  cost: z.number().positive('Cost must be positive').max(10000, 'Cost too high'),
  profit: z.number().min(0, 'Profit cannot be negative').max(10000, 'Profit too high'),
  pickup_date: z.string().min(1, 'Pickup date is required').refine((date) => {
    // Accept both date strings (YYYY-MM-DD) and datetime strings (ISO 8601)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    return dateRegex.test(date) || datetimeRegex.test(date) || !isNaN(Date.parse(date))
  }, 'Invalid pickup date format'),
  delivery_method: z.enum(['pickup', 'delivery']),
  notes: z.string().max(500, 'Notes too long').optional(),
  items: z.array(z.object({
    product: z.object({
      id: z.string().uuid('Invalid product ID'),
      price: z.number().positive('Product price must be positive')
    }),
    quantity: z.number().int().positive('Quantity must be positive').max(100, 'Quantity too high')
  })).min(1, 'Order must contain at least one item')
})

export const updateOrderSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'baking', 'ready', 'completed', 'cancelled']).optional(),
  payment_status: z.enum(['pending', 'processing', 'completed', 'failed', 'refunded']).optional()
})

export const createPaymentLinkSchema = z.object({
  orderId: z.string().uuid('Invalid order ID')
})

// Profile validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').max(20, 'Phone number too long').optional(),
  address: z.string().max(200, 'Address too long').optional(),
  city: z.string().max(50, 'City too long').optional(),
  state: z.string().max(50, 'State too long').optional(),
  zip_code: z.string().max(10, 'ZIP code too long').optional()
})

// Image upload validation schemas
export const uploadImageSchema = z.object({
  image: z.any().refine((file) => {
    if (!(file instanceof File)) return false
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) return false
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return false
    
    return true
  }, 'Invalid image file. Must be JPEG, PNG, or WebP under 5MB')
})

export const deleteImageSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(100, 'File name too long')
})

// Utility function to validate and parse request data
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: message }
    }
    return { success: false, error: 'Invalid input data' }
  }
}

// Utility function to validate query parameters
export function validateQuery<T>(schema: z.ZodSchema<T>, url: URL): { success: true; data: T } | { success: false; error: string } {
  try {
    const params = Object.fromEntries(url.searchParams.entries())
    const result = schema.parse(params)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
      return { success: false, error: message }
    }
    return { success: false, error: 'Invalid query parameters' }
  }
}