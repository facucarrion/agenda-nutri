export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_log: {
        Row: {
          action: string
          admin_email: string
          created_at: string
          detail: Json | null
          id: number
          target: string | null
        }
        Insert: {
          action: string
          admin_email: string
          created_at?: string
          detail?: Json | null
          id?: number
          target?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          created_at?: string
          detail?: Json | null
          id?: number
          target?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type_id: string | null
          confirmation_token_hash: string | null
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          nutritionist_id: string
          patient_id: string
          pending_expires_at: string | null
          reminder_sent_at: string | null
          whatsapp_reminded_at: string | null
          source: Database["public"]["Enums"]["appointment_source"]
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          appointment_type_id?: string | null
          confirmation_token_hash?: string | null
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          nutritionist_id: string
          patient_id: string
          pending_expires_at?: string | null
          reminder_sent_at?: string | null
          whatsapp_reminded_at?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          appointment_type_id?: string | null
          confirmation_token_hash?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          nutritionist_id?: string
          patient_id?: string
          pending_expires_at?: string | null
          reminder_sent_at?: string | null
          whatsapp_reminded_at?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointment_types: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          is_active: boolean
          name: string
          nutritionist_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes: number
          id?: string
          is_active?: boolean
          name: string
          nutritionist_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          is_active?: boolean
          name?: string
          nutritionist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_types_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_blocks: {
        Row: {
          ends_at: string
          id: string
          nutritionist_id: string
          reason: string | null
          starts_at: string
        }
        Insert: {
          ends_at: string
          id?: string
          nutritionist_id: string
          reason?: string | null
          starts_at: string
        }
        Update: {
          ends_at?: string
          id?: string
          nutritionist_id?: string
          reason?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_blocks_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_rules: {
        Row: {
          end_time: string
          id: string
          nutritionist_id: string
          start_time: string
          weekday: number
        }
        Insert: {
          end_time: string
          id?: string
          nutritionist_id: string
          start_time: string
          weekday: number
        }
        Update: {
          end_time?: string
          id?: string
          nutritionist_id?: string
          start_time?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "availability_rules_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_codes: {
        Row: {
          business_name: string | null
          code: string
          created_at: string
          note: string | null
          used_at: string | null
          used_by: string | null
          trial_days: number
        }
        Insert: {
          business_name?: string | null
          code: string
          created_at?: string
          note?: string | null
          used_at?: string | null
          trial_days?: number
          used_by?: string | null
        }
        Update: {
          business_name?: string | null
          code?: string
          created_at?: string
          note?: string | null
          used_at?: string | null
          trial_days?: number
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_codes_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
      nutritionists: {
        Row: {
          business_name: string | null
          created_at: string
          full_name: string
          id: string
          min_notice_hours: number
          slot_minutes: number
          slug: string
          timezone: string
          plan: string
          trial_ends_at: string | null
          active_until: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          full_name?: string
          id: string
          min_notice_hours?: number
          slot_minutes?: number
          slug: string
          timezone?: string
          plan?: string
          trial_ends_at?: string | null
          active_until?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          full_name?: string
          id?: string
          min_notice_hours?: number
          slot_minutes?: number
          slug?: string
          timezone?: string
          plan?: string
          trial_ends_at?: string | null
          active_until?: string | null
        }
        Relationships: []
      }
      patients: {
        Row: {
          birth_date: string | null
          consent_at: string | null
          consent_version: string | null
          created_at: string
          dni: string | null
          email: string | null
          first_name: string
          height_cm: number | null
          id: string
          last_name: string
          notes: string | null
          nutritionist_id: string
          phone: string | null
          weight_kg: number | null
        }
        Insert: {
          birth_date?: string | null
          consent_at?: string | null
          consent_version?: string | null
          created_at?: string
          dni?: string | null
          email?: string | null
          first_name: string
          height_cm?: number | null
          id?: string
          last_name: string
          notes?: string | null
          nutritionist_id: string
          phone?: string | null
          weight_kg?: number | null
        }
        Update: {
          birth_date?: string | null
          consent_at?: string | null
          consent_version?: string | null
          created_at?: string
          dni?: string | null
          email?: string | null
          first_name?: string
          height_cm?: number | null
          id?: string
          last_name?: string
          notes?: string | null
          nutritionist_id?: string
          phone?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_nutritionist_id_fkey"
            columns: ["nutritionist_id"]
            isOneToOne: false
            referencedRelation: "nutritionists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_account_stats: {
        Args: never
        Returns: {
          appointments_count: number
          last_appointment_at: string
          nutritionist_id: string
          patients_count: number
        }[]
      }
      has_write_access: { Args: never; Returns: boolean }
      rate_limit_hit: {
        Args: { p_key: string; p_max: number; p_window_seconds: number }
        Returns: boolean
      }
    }
    Enums: {
      appointment_source: "manual" | "public"
      appointment_status:
        | "pending"
        | "confirmed"
        | "cancelled"
        | "completed"
        | "no_show"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      appointment_source: ["manual", "public"],
      appointment_status: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "no_show",
      ],
    },
  },
} as const
