'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './CameraDeviceManager.module.css'

type CameraDevice = {
  id: string; device_name: string; is_paired: boolean
  is_active: boolean; last_seen_at: string | null; created_at: string
}

type PairingModalState =
  | { kind: 'closed' }
  | { kind: 'creating' }
  | { kind: 'ready'; pairingCode: string; deviceId: string; expiresAt: number }

const PAIRING_CODE_VALID_MS = 5 * 60 * 1000

/**
 * 대시보드 카메라 기기 관리 — 코드 생성 + 기기 목록 + 삭제.
 * "카메라 추가" → 이름 입력 → 4자리 코드 표시 → 남는 폰에서 /camera/pair 에서 코드 입력.
 */
export function CameraDeviceManager({ homeId }: { homeId: string }) {
  const supabase = createClient()
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([])
  const [pairingModal, setPairingModal] = useState<PairingModalState>({ kind: 'closed' })
  const [countdownSeconds, setCountdownSeconds] = useState(0)
  const [newDeviceName, setNewDeviceName] = useState('새 카메라')
  const [isLoadingDevices, setIsLoadingDevices] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const pairingDeviceIdRef = useRef<string | null>(null)

  const fetchCameraDevices = useCallback(async () => {
    const { data, error } = await supabase
      .from('camera_devices')
      .select('id, device_name, is_paired, is_active, last_seen_at, created_at')
      .eq('home_id', homeId)
      .order('created_at', { ascending: false })
    if (!error && data) setCameraDevices(data)
    setIsLoadingDevices(false)
  }, [supabase, homeId])

  useEffect(() => { void fetchCameraDevices() }, [fetchCameraDevices])

  useEffect(() => {
    pairingDeviceIdRef.current = pairingModal.kind === 'ready' ? pairingModal.deviceId : null
  }, [pairingModal])

  // Realtime: 남는 폰에서 페어링 완료 시 자동으로 코드 카드 닫기
  useEffect(() => {
    const channel = supabase
      .channel(`camera-devices-realtime-${homeId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'camera_devices', filter: `home_id=eq.${homeId}` },
        (payload) => {
          const row = payload.new as { id: string; is_paired: boolean }
          void fetchCameraDevices()
          if (row.is_paired && pairingDeviceIdRef.current === row.id) {
            setPairingModal({ kind: 'closed' })
            pairingDeviceIdRef.current = null
          }
        })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [supabase, homeId, fetchCameraDevices])

  // 카운트다운 타이머
  useEffect(() => {
    if (pairingModal.kind !== 'ready') return
    const update = () => {
      const remain = pairingModal.expiresAt - Date.now()
      if (remain <= 0) { setCountdownSeconds(0); setPairingModal({ kind: 'closed' }); void fetchCameraDevices(); return }
      setCountdownSeconds(Math.ceil(remain / 1000))
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [pairingModal, fetchCameraDevices])

  async function generatePairingCode() {
    if (!newDeviceName.trim()) { setErrorMessage('카메라 이름을 입력해 주세요.'); return }
    setPairingModal({ kind: 'creating' })
    setErrorMessage(null)

    const pairingCode = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    const expiresAt = new Date(Date.now() + PAIRING_CODE_VALID_MS)

    const { data: device, error: err } = await supabase
      .from('camera_devices')
      .insert({
        home_id: homeId,
        device_name: newDeviceName.trim(),
        pairing_code: pairingCode,
        pairing_code_expires_at: expiresAt.toISOString(),
        is_paired: false,
      })
      .select('id')
      .single()

    if (err || !device) { setErrorMessage(err?.message ?? '코드 생성에 실패했어요.'); setPairingModal({ kind: 'closed' }); return }
    setPairingModal({ kind: 'ready', pairingCode, deviceId: device.id, expiresAt: expiresAt.getTime() })
    setNewDeviceName('새 카메라')
    void fetchCameraDevices()
  }

  async function deleteDevice(deviceId: string) {
    await supabase.from('camera_devices').delete().eq('id', deviceId)
    void fetchCameraDevices()
  }

  function formatLastSeen(ts: string | null): string {
    if (!ts) return '없음'
    const s = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (s < 60) return `${s}초 전`
    if (s < 3600) return `${Math.floor(s / 60)}분 전`
    if (s < 86400) return `${Math.floor(s / 3600)}시간 전`
    return `${Math.floor(s / 86400)}일 전`
  }

  const cdMin = Math.floor(countdownSeconds / 60)
  const cdSec = String(countdownSeconds % 60).padStart(2, '0')

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>📡 카메라 기기</h2>
        <button className={styles.btnAddCamera} onClick={() => setPairingModal((p) => p.kind === 'closed' ? { kind: 'creating' } : { kind: 'closed' })}>
          + 카메라 추가
        </button>
      </div>

      {errorMessage && <p className={styles.errorText} role="alert">{errorMessage}</p>}

      {pairingModal.kind !== 'closed' && (
        <div className={styles.pairingCard}>
          {pairingModal.kind === 'creating' ? (
            <div className={styles.pairingForm}>
              <label className={styles.label} htmlFor="new-device-name">카메라 이름</label>
              <input id="new-device-name" className={styles.input} type="text" maxLength={30} placeholder="예: 거실 카메라" value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} autoFocus />
              <div className={styles.pairingFormButtons}>
                <button className={styles.btnCancel} onClick={() => setPairingModal({ kind: 'closed' })}>취소</button>
                <button className={styles.btnGenerate} onClick={() => void generatePairingCode()}>코드 생성</button>
              </div>
            </div>
          ) : pairingModal.kind === 'ready' ? (
            <div className={styles.pairingReady}>
              <p className={styles.pairingInstruction}>
                남는 폰에서 <strong>/camera/pair</strong> 접속 후<br />아래 코드를 입력해 주세요.
              </p>
              <div className={styles.bigCode} aria-label={`페어링 코드: ${pairingModal.pairingCode}`}>
                {pairingModal.pairingCode.split('').map((d, i) => (
                  <span key={i} className={styles.bigCodeDigit}>{d}</span>
                ))}
              </div>
              <p className={styles.countdown}>{countdownSeconds > 0 ? `⏱ ${cdMin}:${cdSec} 후 만료` : '만료됨'}</p>
              <button className={styles.btnCancel} onClick={() => { setPairingModal({ kind: 'closed' }); void fetchCameraDevices() }}>닫기</button>
            </div>
          ) : null}
        </div>
      )}

      <div className={styles.deviceList}>
        {isLoadingDevices ? (
          <p className={styles.loadingText}>불러오는 중…</p>
        ) : cameraDevices.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden>📷</span>
            <p className={styles.emptyText}>아직 등록된 카메라가 없어요.<br />&apos;카메라 추가&apos;로 시작해 보세요!</p>
          </div>
        ) : cameraDevices.map((device) => (
          <div key={device.id} className={styles.deviceCard}>
            <div className={styles.deviceInfo}>
              <div className={styles.deviceNameRow}>
                <span className={`${styles.statusDot} ${device.is_active ? styles.statusDotLive : device.is_paired ? styles.statusDotPaired : styles.statusDotUnpaired}`} aria-hidden />
                <span className={styles.deviceName}>{device.device_name}</span>
              </div>
              <span className={styles.deviceMeta}>
                {device.is_active ? '🔴 방송 중' : device.is_paired ? `연결됨 · 최근 ${formatLastSeen(device.last_seen_at)}` : '페어링 대기 중'}
              </span>
            </div>
            <button className={styles.btnDelete} onClick={() => void deleteDevice(device.id)} aria-label={`${device.device_name} 삭제`}>삭제</button>
          </div>
        ))}
      </div>
    </section>
  )
}
