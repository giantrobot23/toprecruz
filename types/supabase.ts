export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          department: string | null
          location: string | null
          employment_type: string | null
          experience_level: string | null
          salary_range: string | null
          description: string
          responsibilities: string | null
          requirements: string
          benefits: string | null
          status: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          department?: string | null
          location?: string | null
          employment_type?: string | null
          experience_level?: string | null
          salary_range?: string | null
          description: string
          responsibilities?: string | null
          requirements: string
          benefits?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          department?: string | null
          location?: string | null
          employment_type?: string | null
          experience_level?: string | null
          salary_range?: string | null
          description?: string
          responsibilities?: string | null
          requirements?: string
          benefits?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      candidates: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          job_id: string
          match_score: number
          status: string
          skills: string[] | null
          experience: string[] | null
          education: string[] | null
          summary: string | null
          matched_skills: string[] | null
          missing_skills: string[] | null
          notes: string | null
          resume_url: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          job_id: string
          match_score?: number
          status?: string
          skills?: string[] | null
          experience?: string[] | null
          education?: string[] | null
          summary?: string | null
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          notes?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          job_id?: string
          match_score?: number
          status?: string
          skills?: string[] | null
          experience?: string[] | null
          education?: string[] | null
          summary?: string | null
          matched_skills?: string[] | null
          missing_skills?: string[] | null
          notes?: string | null
          resume_url?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
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

