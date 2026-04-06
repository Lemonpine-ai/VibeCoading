/**
 * WebRTC `RTCPeerConnection`용 ICE 서버 목록을 만든다.
 * - STUN: 기본 포함 (NAT 뒤 주소 탐색).
 * - TURN: 선택. 대칭 NAT·모바일 통신사·공용 Wi-Fi 등에서는 STUN만으로는 P2P가 실패할 수 있어
 *   중계(TURN)가 필요하다. UDP가 막힌 환경은 `turns:`(TLS 443) URL을 함께 넣는 것이 좋다.
 *
 * 환경변수 우선순위 (필드마다 위에서 아래 순으로 첫 번째 유효값 사용):
 *   1) WEBRTC_TURN_URLS / WEBRTC_TURN_USERNAME / WEBRTC_TURN_CREDENTIAL
 *      → 서버(API Route)에서만 읽힘. Vercel 환경변수 갱신 후 재배포만 하면 빌드 캐시 없이 반영.
 *   2) NEXT_PUBLIC_WEBRTC_TURN_URLS / NEXT_PUBLIC_WEBRTC_TURN_USERNAME / NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL
 *      → next build 시 클라이언트 번들에 인라인됨. 값 변경 후 재빌드·재배포 필요.
 *
 * TURN URL 올바른 형식 예시:
 *   turn:your-server.com:3478
 *   turn:your-server.com:443?transport=tcp
 *   turns:your-server.com:443?transport=tcp   ← UDP가 막힌 환경 대응
 *
 * ⚠️ 잘못된 형식: turn:https://your-server.com:3478  (https:// 를 넣으면 브라우저가 인식 못 함)
 */

/** Google + Cloudflare 공개 STUN — 외부망·NAT 뒤에서 peer 후보 탐색에 사용 */
const DEFAULT_STUN_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  { urls: 'stun:stun.cloudflare.com:3478' },
]

function stripSurroundingQuotes(value: string): string {
  const t = value.trim()
  if (
    t.length >= 2 &&
    ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))
  ) {
    return t.slice(1, -1).trim()
  }
  return t
}

function readOptionalTrimmedEnv(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name]
  if (value === undefined || value === '') return undefined
  const trimmed = stripSurroundingQuotes(value)
  return trimmed === '' ? undefined : trimmed
}

let partialTurnEnvWarningShown = false

/**
 * 필드별로 `WEBRTC_TURN_*` 우선, 없으면 `NEXT_PUBLIC_WEBRTC_TURN_*` 사용.
 * 별칭: `*_TURN_URL` 단수 = `*_TURN_URLS`, `*_TURN_PASSWORD` = `*_TURN_CREDENTIAL`
 */
export function resolveWebRtcTurnTripleFromEnv(env: NodeJS.ProcessEnv): {
  urls: string | undefined
  username: string | undefined
  credential: string | undefined
} {
  const urls =
    readOptionalTrimmedEnv(env, 'WEBRTC_TURN_URLS') ??
    readOptionalTrimmedEnv(env, 'NEXT_PUBLIC_WEBRTC_TURN_URLS') ??
    readOptionalTrimmedEnv(env, 'WEBRTC_TURN_URL') ??
    readOptionalTrimmedEnv(env, 'NEXT_PUBLIC_WEBRTC_TURN_URL')

  const username =
    readOptionalTrimmedEnv(env, 'WEBRTC_TURN_USERNAME') ??
    readOptionalTrimmedEnv(env, 'NEXT_PUBLIC_WEBRTC_TURN_USERNAME')

  const credential =
    readOptionalTrimmedEnv(env, 'WEBRTC_TURN_CREDENTIAL') ??
    readOptionalTrimmedEnv(env, 'NEXT_PUBLIC_WEBRTC_TURN_CREDENTIAL') ??
    readOptionalTrimmedEnv(env, 'WEBRTC_TURN_PASSWORD') ??
    readOptionalTrimmedEnv(env, 'NEXT_PUBLIC_WEBRTC_TURN_PASSWORD')

  return { urls, username, credential }
}

function warnIfPartialTurnEnv(env: NodeJS.ProcessEnv): void {
  if (typeof window === 'undefined') return
  if (partialTurnEnvWarningShown) return
  const { urls, username, credential } = resolveWebRtcTurnTripleFromEnv(env)
  const setCount = [urls, username, credential].filter(Boolean).length
  if (setCount > 0 && setCount < 3) {
    partialTurnEnvWarningShown = true
    console.warn(
      '[CATvisor WebRTC] TURN 환경변수가 일부만 설정되었습니다. ' +
        'WEBRTC_TURN_URLS · WEBRTC_TURN_USERNAME · WEBRTC_TURN_CREDENTIAL 세 항목이 모두 있어야 TURN이 추가됩니다. ' +
        '(.env.local.example 참고)'
    )
  }
}

/** TURN 세 항목이 모두 채워졌는지 (UI·로그용) */
export function isWebRtcTurnEnvComplete(env: NodeJS.ProcessEnv = process.env): boolean {
  const { urls, username, credential } = resolveWebRtcTurnTripleFromEnv(env)
  return Boolean(urls && username && credential)
}

/** 쉼표·줄바꿈으로 구분된 TURN URL 목록 (Vercel 다줄 붙여넣기 대응) */
function parseTurnUrlList(raw: string): string[] {
  return raw
    .replace(/\r\n/g, '\n')
    .trim()
    .split(/[\n,]+/)
    .map((part) => stripSurroundingQuotes(part).trim())
    .filter(Boolean)
}

/**
 * `RTCPeerConnection` 에 전달할 ICE 서버 목록을 반환한다.
 * @param env 기본값 `process.env`. 테스트에서 다른 객체를 넘겨 TURN 조합을 검증할 수 있다.
 */
export function buildWebRtcIceServers(env: NodeJS.ProcessEnv = process.env): RTCIceServer[] {
  warnIfPartialTurnEnv(env)

  const servers: RTCIceServer[] = [...DEFAULT_STUN_SERVERS]

  const { urls: turnUrlsRaw, username: turnUsername, credential: turnCredential } =
    resolveWebRtcTurnTripleFromEnv(env)

  if (turnUrlsRaw && turnUsername && turnCredential) {
    const turnUrlList = parseTurnUrlList(turnUrlsRaw)
    if (turnUrlList.length > 0) {
      // 동일 자격증명으로 여러 URL을 하나의 항목(urls 배열)으로 묶는 것이 권장 방식
      servers.push({
        urls: turnUrlList,
        username: turnUsername,
        credential: turnCredential,
      })
    }
  }

  return servers
}
