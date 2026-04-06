// Auto-generate this file with: pnpm supabase gen types typescript --local > src/types/database.ts
// Stub kept here so TypeScript is satisfied before generation.

export type Database = {
  public: {
    Tables: {
      cats: {
        Row: {
          id: string
          owner_id: string
          name: string
          breed: string | null
          date_of_birth: string | null
          weight_kg: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cats']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cats']['Insert']>
      }
      feeding_sessions: {
        Row: {
          id: string
          cat_id: string
          owner_id: string
          image_url: string
          food_type: string | null
          amount_grams: number | null
          duration_seconds: number | null
          ai_notes: string | null
          recorded_at: string
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['feeding_sessions']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['feeding_sessions']['Insert']>
      }
      care_logs: {
        Row: {
          id: string
          cat_id: string
          owner_id: string
          type: string
          notes: string | null
          voice_transcript: string | null
          logged_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['care_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['care_logs']['Insert']>
      }
    }
  }
}
