import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { imageUrl } = await request.json()
  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 })
  }

  // TODO: call vision AI model with imageUrl, parse result
  // TODO: insert result into feeding_sessions table

  return NextResponse.json({ message: 'Vision analysis not yet implemented' }, { status: 501 })
}
