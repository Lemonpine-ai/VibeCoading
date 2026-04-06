'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CameraLiveViewer } from '@/components/catvisor/CameraLiveViewer'
import { CameraDeviceManager } from '@/components/catvisor/CameraDeviceManager'
import {
  CAT_STATUS_DB_VALUES,
  STATUS_DISPLAY_LABEL,
  type CatStatusDbValue,
} from '@/lib/cat/catStatusDisplayLabel'
import { Loader2 } from 'lucide-react'

// ── 타입 ─────────────────────────────────────────────────────────
type CatProfileRow = {
  id: string
  home_id: string
  name: string
  sex: 'male' | 'female' | 'unknown' | null
  breed: string | null
  photo_front_url: string | null
  status: string | null
}

// ── 고양이 카드 ──────────────────────────────────────────────────
function CatCard({ cat, homeId }: { cat: CatProfileRow; homeId: string }) {
  const supabase = createClient()
  const [, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<string | null>(cat.status)
  const [busy, setBusy] = useState<CatStatusDbValue | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  async function handleStatus(dbValue: CatStatusDbValue) {
    setBusy(dbValue)
    setFeedback(null)
    try {
      await supabase.from('cats').update({ status: dbValue }).eq('id', cat.id)
      await supabase.from('cat_logs').insert({
        home_id: homeId,
        cat_id: cat.id,
        status: dbValue,
        captured_at: new Date().toISOString(),
      })
      setCurrentStatus(dbValue)
      setFeedback(`${cat.name}이(가) 아주 좋아할 거예요 💚`)
      startTransition(() => {})
      setTimeout(() => setFeedback(null), 2200)
    } finally {
      setBusy(null)
    }
  }

  const statusLabel = currentStatus
    ? (STATUS_DISPLAY_LABEL[currentStatus as CatStatusDbValue] ?? currentStatus)
    : null

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-[#4FD1C5]/20 bg-white shadow-md transition hover:shadow-lg">
      {/* 사진 영역 */}
      <div className="relative aspect-square w-full bg-[#F1FBF9]">
        {cat.photo_front_url ? (
          <Image
            src={cat.photo_front_url}
            alt={`${cat.name} 사진`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-5xl">🐱</div>
        )}
        {statusLabel && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold text-[#1e8f83] shadow">
            {statusLabel}
          </span>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col gap-2 p-3">
        <h3 className="text-sm font-bold text-[#1e8f83]">{cat.name}</h3>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[0.7rem] text-slate-500">
          <dt className="font-medium">성별</dt>
          <dd>{cat.sex === 'male' ? '수컷 ♂' : cat.sex === 'female' ? '암컷 ♀' : '미등록'}</dd>
          <dt className="font-medium">품종</dt>
          <dd className="truncate">{cat.breed?.trim() || '미등록'}</dd>
        </dl>

        {/* 활동 버튼 */}
        <div className="mt-1 flex flex-wrap gap-1" role="group" aria-label={`${cat.name} 활동 기록`}>
          {CAT_STATUS_DB_VALUES.map((dbValue) => (
            <button
              key={dbValue}
              type="button"
              disabled={busy !== null}
              onClick={() => void handleStatus(dbValue)}
              className="rounded-full bg-[#4FD1C5]/10 px-2 py-1 text-[0.65rem] font-semibold text-[#1e8f83] transition hover:bg-[#4FD1C5]/25 disabled:opacity-50"
            >
              {busy === dbValue ? '…' : STATUS_DISPLAY_LABEL[dbValue]}
            </button>
          ))}
        </div>

        {feedback && (
          <p className="text-center text-[0.7rem] font-medium text-[#1e8f83]" role="status">
            {feedback}
          </p>
        )}
      </div>
    </article>
  )
}

// ── 메인 페이지 ─────────────────────────────────────────────────
export default function FeedingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [cats, setCats] = useState<CatProfileRow[]>([])
  const [homeId, setHomeId] = useState<string | null>(null)
  const [catsLoading, setCatsLoading] = useState(true)
  const [loadTimedOut, setLoadTimedOut] = useState(false)
  const [waterAt, setWaterAt] = useState<string | undefined>(undefined)
  const [litterAt, setLitterAt] = useState<string | undefined>(undefined)

  // 5초 타임아웃 — 로딩이 너무 길면 안내 메시지 표시
  useEffect(() => {
    const timer = setTimeout(() => setLoadTimedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    async function load() {
      // 1) 세션 확인 — 없으면 로그인 페이지로
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // 2) 프로필 + home_id 조회
      const { data: profile } = await supabase
        .from('profiles')
        .select('home_id')
        .eq('id', user.id)
        .single()

      const hid = profile?.home_id
      if (!hid) { setCatsLoading(false); return }
      setHomeId(hid)

      // 3) 고양이 목록 조회
      const { data: catRows } = await supabase
        .from('cats')
        .select('id, home_id, name, sex, breed, photo_front_url, status')
        .eq('home_id', hid)
        .order('name')

      setCats((catRows as CatProfileRow[]) ?? [])
      setCatsLoading(false)
    }
    void load()
  }, [supabase, router])

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-12">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e8f83]">🐾 우리 고양이</h1>
        <p className="mt-1 text-sm text-slate-400">
          활동을 기록하고 라이브 카메라로 실시간 확인해요
        </p>
      </div>

      {/* 고양이 카드 그리드 */}
      <section aria-label="우리 고양이">
        {catsLoading && !loadTimedOut ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="size-7 animate-spin text-[#4FD1C5]" />
          </div>
        ) : catsLoading && loadTimedOut ? (
          <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
            <p className="text-3xl">⏳</p>
            <p className="mt-2 text-sm font-semibold text-amber-700">데이터를 찾을 수 없습니다</p>
            <p className="mt-1 text-xs text-amber-600">
              로그인 상태 또는 Supabase 연결을 확인해 주세요.
              profiles 테이블에 home_id가 설정되어 있어야 합니다.
            </p>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-4 rounded-full bg-[#0d9488] px-5 py-2 text-sm font-bold text-white shadow transition hover:brightness-110"
            >
              로그인 화면으로
            </button>
          </div>
        ) : cats.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#4FD1C5]/40 bg-[#F1FBF9] p-8 text-center">
            <p className="text-3xl">🐱</p>
            <p className="mt-2 text-sm font-semibold text-[#1e8f83]">고양이를 등록해보세요</p>
            <p className="mt-1 text-xs text-slate-400">
              Supabase 대시보드 → cats 테이블에 고양이 정보를 추가하면 여기에 나타납니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {cats.map((cat) => (
              <CatCard key={cat.id} cat={cat} homeId={cat.home_id} />
            ))}
          </div>
        )}
      </section>

      {/* 카메라 기기 관리 (코드 생성 + 기기 목록) */}
      {homeId && (
        <section aria-label="카메라 기기 관리">
          <CameraDeviceManager homeId={homeId} />
        </section>
      )}

      {/* 라이브 카메라 + 케어 기록 */}
      <section aria-label="라이브 카메라">
        <CameraLiveViewer
          onWaterChangeRecorded={(ts) => setWaterAt(ts)}
          onLitterCleanRecorded={(ts) => setLitterAt(ts)}
        />
        <span className="sr-only">{waterAt}{litterAt}</span>
      </section>
    </div>
  )
}
