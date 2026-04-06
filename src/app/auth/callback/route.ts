import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ensureHttpsApiUrl } from '@/lib/url/ensureHttpsApiUrl'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  type EmailOtpType = 'signup' | 'email' | 'recovery' | 'invite' | 'email_change'
  const rawType = url.searchParams.get('type') ?? 'signup'
  const otpType = (
    ['signup', 'email', 'recovery', 'invite', 'email_change'].includes(rawType) ? rawType : 'signup'
  ) as EmailOtpType
  const nextPath = url.searchParams.get('next') ?? '/'
  const origin = url.origin
  const safeNext = nextPath.startsWith('/') ? nextPath : `/${nextPath}`

  if (!code && !tokenHash) {
    return NextResponse.redirect(`${origin}/login?error=oauth`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/login?error=config`)
  }

  const cookieStore = await cookies()
  const redirectResponse = NextResponse.redirect(`${origin}${safeNext}`)

  const supabase = createServerClient(
    ensureHttpsApiUrl(supabaseUrl.trim()),
    supabaseAnonKey.trim(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType })
    if (error) return NextResponse.redirect(`${origin}/login?error=oauth&message=${encodeURIComponent(error.message)}`)
    return redirectResponse
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code!)
  if (error) return NextResponse.redirect(`${origin}/login?error=oauth&message=${encodeURIComponent(error.message)}`)
  return redirectResponse
}
