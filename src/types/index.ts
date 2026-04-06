export type CareLogType = 'feeding' | 'grooming' | 'vet_visit' | 'medication' | 'play' | 'other'

export interface Cat {
  id: string
  owner_id: string
  name: string
  breed: string | null
  date_of_birth: string | null
  weight_kg: number | null
  created_at: string
}

export interface FeedingSession {
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

export interface CareLog {
  id: string
  cat_id: string
  owner_id: string
  type: CareLogType
  notes: string | null
  voice_transcript: string | null
  logged_at: string
  created_at: string
}
