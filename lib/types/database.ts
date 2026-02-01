export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'tenant' | 'pm' | 'admin'

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

export type MaintenanceCategory = 
  | 'hvac' 
  | 'plumbing' 
  | 'electrical' 
  | 'appliance' 
  | 'structural' 
  | 'pest' 
  | 'other'

export type MaintenanceUrgency = 'low' | 'medium' | 'high' | 'emergency'

export type MaintenanceStatus = 
  | 'submitted' 
  | 'assigned' 
  | 'in_progress' 
  | 'completed' 
  | 'closed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          name: string
          address: string
          qbo_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          qbo_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          qbo_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          tenant_id: string | null
          qbo_customer_id: string | null
          monthly_rent: number | null
          lease_start_date: string | null
          lease_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          unit_number: string
          tenant_id?: string | null
          qbo_customer_id?: string | null
          monthly_rent?: number | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          unit_number?: string
          tenant_id?: string | null
          qbo_customer_id?: string | null
          monthly_rent?: number | null
          lease_start_date?: string | null
          lease_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          amount: number
          payment_date: string
          stripe_payment_intent_id: string | null
          qbo_payment_id: string | null
          status: PaymentStatus
          payment_method: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          unit_id: string
          amount: number
          payment_date?: string
          stripe_payment_intent_id?: string | null
          qbo_payment_id?: string | null
          status?: PaymentStatus
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          unit_id?: string
          amount?: number
          payment_date?: string
          stripe_payment_intent_id?: string | null
          qbo_payment_id?: string | null
          status?: PaymentStatus
          payment_method?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          category: MaintenanceCategory
          title: string
          description: string
          urgency: MaintenanceUrgency
          status: MaintenanceStatus
          asana_task_id: string | null
          asana_task_url: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          unit_id: string
          category: MaintenanceCategory
          title: string
          description: string
          urgency?: MaintenanceUrgency
          status?: MaintenanceStatus
          asana_task_id?: string | null
          asana_task_url?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          unit_id?: string
          category?: MaintenanceCategory
          title?: string
          description?: string
          urgency?: MaintenanceUrgency
          status?: MaintenanceStatus
          asana_task_id?: string | null
          asana_task_url?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_photos: {
        Row: {
          id: string
          request_id: string
          storage_path: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          storage_path: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          storage_path?: string
          url?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          request_id: string | null
          subject: string | null
          body: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string | null
          request_id?: string | null
          subject?: string | null
          body: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string | null
          request_id?: string | null
          subject?: string | null
          body?: string
          read?: boolean
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          author_id: string
          property_id: string | null
          title: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          property_id?: string | null
          title: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          property_id?: string | null
          title?: string
          body?: string
          created_at?: string
        }
      }
    }
  }
}
