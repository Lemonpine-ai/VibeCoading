/**
 * WebRTC 연결 단계 추적용 디버그 로그.
 * 개발자 도구 콘솔 필터: [CATvisor WebRTC]
 *
 * 주요 기능:
 * - logWebRtcDebug()         : 단계별 정보 로그
 * - attachIceStateLogger()   : RTCPeerConnection에 붙여서 ICE 상태를 자동으로 추적
 * - summarizeIceServersForLog(): ICE 서버 목록 요약 (로그용)
 */

const LOG_PREFIX = '[CATvisor WebRTC]'

export type WebRtcDebugRole = 'broadcaster' | 'viewer'

export function logWebRtcDebug(
  role: WebRtcDebugRole,
  step: string,
  detail?: Record<string, unknown>
): void {
  if (typeof console === 'undefined') return
  console.info(LOG_PREFIX, `[${role}] ${step}`, {
    at: new Date().toISOString(),
    ...detail,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ICE 연결 상태별 설명 (개발자가 어디서 막히는지 바로 알 수 있도록 한국어로 안내)
// ─────────────────────────────────────────────────────────────────────────────

const ICE_CONNECTION_STATE_GUIDE: Record<RTCIceConnectionState, string> = {
  new: '초기화 중 — ICE 후보 수집 시작 전',
  checking: 'ICE 후보 교환 후 연결 가능성 확인 중 (가장 오래 걸리는 단계)',
  connected: '✅ P2P 연결 성공 (STUN 경로 또는 TURN 릴레이)',
  completed: '✅ 최적 ICE 경로 확정 완료',
  failed:
    '❌ 연결 실패 — STUN만으로 NAT 통과 불가능할 가능성 높음. TURN 서버 설정을 확인하세요. ' +
    '(환경변수: WEBRTC_TURN_URLS / WEBRTC_TURN_USERNAME / WEBRTC_TURN_CREDENTIAL)',
  disconnected: '⚠️ 일시적으로 연결 끊김 — 네트워크 전환(Wi-Fi ↔ LTE) 또는 일시적 패킷 손실',
  closed: '연결 종료 (정상 해제)',
}

const ICE_GATHERING_STATE_GUIDE: Record<RTCIceGatheringState, string> = {
  new: 'ICE 후보 수집 대기 중',
  gathering: 'ICE 후보 수집 중 (로컬 주소 + STUN 반사 주소 + TURN 릴레이 주소)',
  complete: 'ICE 후보 수집 완료',
}

const CONNECTION_STATE_GUIDE: Record<RTCPeerConnectionState, string> = {
  new: 'PeerConnection 초기화',
  connecting: '연결 협상 중',
  connected: '✅ PeerConnection 연결 성공',
  disconnected: '⚠️ PeerConnection 연결 끊김',
  failed: '❌ PeerConnection 실패',
  closed: 'PeerConnection 종료',
}

// ─────────────────────────────────────────────────────────────────────────────
// 핵심 함수: RTCPeerConnection에 상태 변화 리스너를 붙여 단계마다 자동 로그
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `RTCPeerConnection` 생성 직후 이 함수에 넘기면,
 * 연결이 어느 단계에서 막히는지 개발자 도구 콘솔에서 바로 확인할 수 있다.
 *
 * 사용 예:
 * ```ts
 * const pc = new RTCPeerConnection(config)
 * attachIceStateLogger(pc, 'broadcaster')
 * ```
 */
export function attachIceStateLogger(pc: RTCPeerConnection, role: WebRtcDebugRole): void {
  // 1) ICE 연결 상태 변화 (가장 중요 — failed 시 TURN 미설정이 주원인)
  pc.addEventListener('iceconnectionstatechange', () => {
    const state = pc.iceConnectionState
    const guide = ICE_CONNECTION_STATE_GUIDE[state] ?? state
    const logFn =
      state === 'failed' || state === 'disconnected' ? console.error : console.info

    logFn(LOG_PREFIX, `[${role}] ICE 연결 상태 변경 → ${state}`, {
      iceConnectionState: state,
      guide,
      at: new Date().toISOString(),
    })
  })

  // 2) ICE 후보 수집 상태 변화 (gathering → complete 이 오래 걸리면 STUN 응답 문제)
  pc.addEventListener('icegatheringstatechange', () => {
    const state = pc.iceGatheringState
    console.info(LOG_PREFIX, `[${role}] ICE 수집 상태 → ${state}`, {
      iceGatheringState: state,
      guide: ICE_GATHERING_STATE_GUIDE[state] ?? state,
      at: new Date().toISOString(),
    })
  })

  // 3) PeerConnection 전체 상태 (ICE + DTLS 합산)
  pc.addEventListener('connectionstatechange', () => {
    const state = pc.connectionState
    const logFn = state === 'failed' ? console.error : console.info

    logFn(LOG_PREFIX, `[${role}] PeerConnection 상태 → ${state}`, {
      connectionState: state,
      guide: CONNECTION_STATE_GUIDE[state] ?? state,
      at: new Date().toISOString(),
    })
  })

  // 4) 수집된 ICE 후보 각각 로그 (relay 타입이 있으면 TURN이 제대로 동작 중인 것)
  pc.addEventListener('icecandidate', (event) => {
    if (!event.candidate) {
      console.info(LOG_PREFIX, `[${role}] ICE 후보 수집 완료 (null candidate)`)
      return
    }
    const { type, protocol, address, port } = event.candidate
    // relay = TURN 중계, srflx = STUN 반사, host = 로컬
    console.info(LOG_PREFIX, `[${role}] ICE 후보 수집됨`, {
      type,       // 'host' | 'srflx' | 'relay' — relay 가 있어야 외부망 TURN 사용 가능
      protocol,   // 'udp' | 'tcp'
      address,
      port,
    })
  })

  // 5) TURN이 없는데 failed → 추가 안내
  pc.addEventListener('iceconnectionstatechange', () => {
    if (pc.iceConnectionState !== 'failed') return
    console.group(LOG_PREFIX + ' ❌ ICE 연결 실패 — 체크리스트')
    console.error(
      '1) .env.local 에 WEBRTC_TURN_URLS, WEBRTC_TURN_USERNAME, WEBRTC_TURN_CREDENTIAL 세 항목이 모두 있는지 확인'
    )
    console.error(
      '2) TURN URL 형식 확인: turn:your-server.com:3478 (turn:https://... 형식은 잘못된 형식)'
    )
    console.error(
      '3) TURN 서버가 외부에서 접근 가능한지 확인 (방화벽 3478 UDP/TCP 포트 오픈 여부)'
    )
    console.error(
      '4) 위의 ICE 후보 로그에서 type=relay 가 하나도 없으면 TURN 서버 연결 자체가 실패한 것'
    )
    console.groupEnd()
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────────────────────

/** ICE 서버 목록 요약 (연결 시작 시 로그용) */
export function summarizeIceServersForLog(servers: RTCIceServer[]): {
  count: number
  stunHosts: string[]
  hasTurn: boolean
} {
  const stunHosts: string[] = []
  let hasTurn = false

  for (const entry of servers) {
    const list = Array.isArray(entry.urls) ? entry.urls : [entry.urls]
    for (const u of list) {
      if (typeof u !== 'string') continue
      if (/^turns?:/i.test(u)) hasTurn = true
      if (/^stun:/i.test(u)) {
        stunHosts.push(u.replace(/^stun:/i, '').split('?')[0])
      }
    }
  }

  return { count: servers.length, stunHosts: stunHosts.slice(0, 8), hasTurn }
}
