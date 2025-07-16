import type { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Application types
export type Profile = Tables<'profiles'>
export type Product = Tables<'products'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type CustomerFavorite = Tables<'customer_favorites'>

export type OrderStatus = 'pending' | 'confirmed' | 'baking' | 'ready' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product | null })[]
  profile?: {
    id: string
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  pendingOrders: number
  ordersToday: number
  revenueToday: number
}