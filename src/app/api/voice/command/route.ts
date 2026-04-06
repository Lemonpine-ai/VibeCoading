import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { transcript } = await request.json()
  if (!transcript) {
    return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
  }

  // TODO: normalize transcript, map to care log entry type
  // TODO: insert into care_logs table

  return NextResponse.json({ message: 'Voice command processing not yet implemented' }, { status: 501 })
}
