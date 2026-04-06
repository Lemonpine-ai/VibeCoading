import {
  buildWebRtcIceServers,
  isWebRtcTurnEnvComplete,
} from '@/lib/webrtc/buildWebRtcIceServers'

export const dynamic = 'force-dynamic'

/**
 * 브라우저가 RTCPeerConnection에 쓸 ICE 목록을 서버 process.env 기준으로 내려준다.
 * WEBRTC_TURN_* 는 NEXT_PUBLIC_ 없이도 런타임에 읽히므로,
 * Vercel 환경변수만 바꾼 뒤 재배포하면 재빌드 없이 반영된다.
 */
export async function GET() {
  const env = process.env
  const iceServers = buildWebRtcIceServers(env)
  const turnRelayConfigured = isWebRtcTurnEnvComplete(env)

  return Response.json(
    { iceServers, turnRelayConfigured },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  )
}
