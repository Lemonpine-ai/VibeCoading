/**
 * camera_sessions.offer_sdp / answer_sdp 컬럼용 SDP 직렬화.
 *
 * 저장: v=0 으로 시작하는 SDP 본문만 TEXT 로 저장 (JSON 객체 통째 문자열 금지).
 * 읽기: 순수 SDP, {"type","sdp"}, rawv1:, sdpv2: 등 레거시 포맷 모두 지원.
 */

const SDP_V2_PREFIX = 'sdpv2:' as const
const RAW_V1_PREFIX = 'rawv1:' as const

function repairLiteralEscapesInSdpText(sdpText: string): string {
  return sdpText.replace(/\\r\\n/g, '\r\n').replace(/\\n/g, '\n').replace(/\\r/g, '\r')
}

export function sanitizeSdpForWebRtc(sdpText: string): string {
  let repaired = repairLiteralEscapesInSdpText(sdpText.trim())
  if (!repaired) return ''
  if (repaired.charCodeAt(0) === 0xfeff) repaired = repaired.slice(1)

  const singleLinefeed = repaired.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const versionLineMatch = /^v=/m.exec(singleLinefeed)
  if (!versionLineMatch || versionLineMatch.index === undefined) {
    throw new Error('SDP에 v= 줄이 없습니다.')
  }

  const lines = singleLinefeed
    .slice(versionLineMatch.index)
    .split('\n')
    .map((line) => line.replace(/\u0000/g, '').trimEnd())
    .filter((line) => line.length > 0)

  if (lines.length === 0) return ''
  if (!lines[0].startsWith('v=')) throw new Error('SDP 첫 줄은 v= 로 시작해야 합니다.')

  return `${lines.join('\r\n')}\r\n`
}

function utf8StringToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToUtf8String(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

function normalizeSdpLineEndingsOnly(sdpRaw: string): string {
  let s = sdpRaw
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1)
  const lines = s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\u0000/g, '').trimEnd())
  const idx = lines.findIndex((line) => line.trimStart().startsWith('v='))
  const nonEmpty = (idx === -1 ? lines : lines.slice(idx)).filter((l) => l.length > 0)
  if (nonEmpty.length === 0) throw new Error('SDP 본문이 비어 있습니다.')
  return `${nonEmpty.join('\r\n')}\r\n`
}

/** DB에 넣을 값: v= 로 시작하는 SDP 본문만 정규화 */
export function encodePlainSdpForDatabaseColumn(sdp: string): string {
  return sanitizeSdpForWebRtc(sdp)
}

/** DB에서 읽은 문자열 → RTCSessionDescriptionInit */
export function decodeSdpFromDatabaseColumn(
  stored: string | null | undefined,
  fallbackType: RTCSessionDescriptionInit['type']
): RTCSessionDescriptionInit {
  if (stored == null || !String(stored).trim()) throw new Error('SDP column is empty.')

  const trimmed = stored.trim()

  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as RTCSessionDescriptionInit
    return { type: parsed.type ?? fallbackType, sdp: sanitizeSdpForWebRtc(parsed.sdp ?? '') }
  }

  if (trimmed.startsWith(RAW_V1_PREFIX)) {
    const rest = trimmed.slice(RAW_V1_PREFIX.length)
    const colonIdx = rest.indexOf(':')
    if (colonIdx === -1) throw new Error('rawv1 SDP 형식이 올바르지 않습니다.')
    return {
      type: rest.slice(0, colonIdx) as RTCSessionDescriptionInit['type'],
      sdp: normalizeSdpLineEndingsOnly(base64ToUtf8String(rest.slice(colonIdx + 1))),
    }
  }

  if (trimmed.startsWith(SDP_V2_PREFIX)) {
    const parsed = JSON.parse(base64ToUtf8String(trimmed.slice(SDP_V2_PREFIX.length))) as RTCSessionDescriptionInit
    return { type: parsed.type, sdp: sanitizeSdpForWebRtc(parsed.sdp ?? '') }
  }

  if (/^v=/m.test(trimmed)) {
    return { type: fallbackType, sdp: sanitizeSdpForWebRtc(trimmed) }
  }

  try {
    const legacy = JSON.parse(trimmed) as RTCSessionDescriptionInit
    if (legacy && typeof legacy === 'object' && 'sdp' in legacy) {
      return { type: legacy.type ?? fallbackType, sdp: sanitizeSdpForWebRtc(String(legacy.sdp ?? '')) }
    }
  } catch { /* ignore */ }

  throw new Error('SDP 형식을 알 수 없습니다.')
}

/** @deprecated encodePlainSdpForDatabaseColumn 사용 */
export function encodeSessionDescriptionForDatabase(description: RTCSessionDescriptionInit): string {
  return encodePlainSdpForDatabaseColumn(description.sdp ?? '')
}

// utf8StringToBase64 는 현재 미사용이나 향후 sdpv2 인코딩 시 필요할 수 있어 보존
void utf8StringToBase64
