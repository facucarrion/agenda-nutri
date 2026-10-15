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
      appointments: {
        Row: {
          confirmation_token_hash: string | null
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          nutritionist_id: string
          patient_id: string
          pending_expires_at: string | null
          reminder_sent_at: string | null
          source: Database["public"]["Enums"]["appointment_source"]
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          confirmation_token_hash?: string | null
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          nutritionist_id: string
          patient_id: string
          pending_expires_at?: string | null
          reminder_sent_at?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          confirmation_token_hash?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          nutritionist_id?: string
          patient_id?: string
          pending_expires_at?: string | null
          reminder_sent_at?: string | null
          source?: Database["public"]["Enums"]["appointment_source"]
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
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
      nutritionists: {
        Row: {
          created_at: string
          full_name: string
          id: string
          slot_minutes: number
          slug: string
          timezone: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          slot_minutes?: number
          slug: string
          timezone?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          slot_minutes?: number
          slug?: string
          timezone?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          birth_date: string | null
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
      [_ in never]: never
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
