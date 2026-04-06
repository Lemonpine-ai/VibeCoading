import {
  buildWebRtcIceServers,
  isWebRtcTurnEnvComplete,
} from '@/lib/webrtc/buildWebRtcIceServers'

/**
 * `CameraLiveViewer`·`CameraBroadcastClient` 등 브라우저에서
 * `new RTCPeerConnection({ iceServers })` 에 전달할 ICE 서버 목록.
 *
 * - STUN: 항상 포함 (Google 5개 + Cloudflare 1개)
 * - TURN: WEBRTC_TURN_* 또는 NEXT_PUBLIC_WEBRTC_TURN_* 세 항목이 모두 있을 때만 추가
 */
export function getWebRtcIceServersForPeerConnection(): RTCIceServer[] {
  return buildWebRtcIceServers()
}

function buildRtcConfigurationWithIceServers(iceServers: RTCIceServer[]): RTCConfiguration {
  return {
    iceServers,
    bundlePolicy: 'balanced',
    rtcpMuxPolicy: 'require',
  }
}

/** 로컬·폴백용 RTCConfiguration (ICE + 기본 정책) */
export function getWebRtcPeerConnectionConfiguration(): RTCConfiguration {
  return buildRtcConfigurationWithIceServers(buildWebRtcIceServers())
}

export type ResolvedWebRtcPeerConnectionConfiguration = {
  rtcConfiguration: RTCConfiguration
  /** TURN 릴레이 항목이 ICE 목록에 포함되었는지 */
  turnRelayConfigured: boolean
}

/**
 * 서버 `/api/webrtc/ice-config` 에서 최신 TURN 설정을 반영한 ICE 목록을 가져온다.
 * 실패 시(오프라인 등) 클라이언트 번들의 buildWebRtcIceServers() 로 폴백한다.
 */
export async function resolveWebRtcPeerConnectionConfiguration(): Promise<ResolvedWebRtcPeerConnectionConfiguration> {
  if (typeof window === 'undefined') {
    const env = process.env
    return {
      rtcConfiguration: buildRtcConfigurationWithIceServers(buildWebRtcIceServers(env)),
      turnRelayConfigured: isWebRtcTurnEnvComplete(env),
    }
  }

  try {
    const response = await fetch('/api/webrtc/ice-config', {
      cache: 'no-store',
      credentials: 'same-origin',
    })
    if (!response.ok) throw new Error(`ice-config ${response.status}`)

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      throw new Error('ice-config 응답이 JSON이 아닙니다.')
    }

    const payload = (await response.json()) as {
      iceServers?: RTCIceServer[]
      turnRelayConfigured?: boolean
    }

    const iceServers = payload.iceServers ?? buildWebRtcIceServers()
    return {
      rtcConfiguration: buildRtcConfigurationWithIceServers(iceServers),
      turnRelayConfigured: Boolean(payload.turnRelayConfigured),
    }
  } catch {
    // 네트워크 오류 등 → 클라이언트 번들 기반 폴백
    return {
      rtcConfiguration: getWebRtcPeerConnectionConfiguration(),
      turnRelayConfigured: isWebRtcTurnEnvComplete(),
    }
  }
}
