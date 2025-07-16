export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          phone: string | null
          role: string | null
          address: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          phone?: string | null
          role?: string | null
          address?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          cost: number
          category: string
          available: boolean | null
          image_url: string | null
          lead_time_hours: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          cost: number
          category: string
          available?: boolean | null
          image_url?: string | null
          lead_time_hours?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          cost?: number
          category?: string
          available?: boolean | null
          image_url?: string | null
          lead_time_hours?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string
          status: string | null
          payment_status: string | null
          total: number
          cost: number
          profit: number
          pickup_date: string | null
          delivery_method: string | null
          notes: string | null
          stripe_payment_link_id: string | null
          customer_name: string | null
          customer_phone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: string | null
          payment_status?: string | null
          total: number
          cost: number
          profit: number
          pickup_date?: string | null
          delivery_method?: string | null
          notes?: string | null
          stripe_payment_link_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          order_number?: string
          status?: string | null
          payment_status?: string | null
          total?: number
          cost?: number
          profit?: number
          pickup_date?: string | null
          delivery_method?: string | null
          notes?: string | null
          stripe_payment_link_id?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          price: number
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          price: number
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          price?: number
          created_at?: string | null
        }
      }
      customer_favorites: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}