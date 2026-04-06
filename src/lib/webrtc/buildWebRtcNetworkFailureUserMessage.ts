import { isWebRtcTurnEnvComplete } from '@/lib/webrtc/buildWebRtcIceServers'

export type BuildWebRtcNetworkFailureUserMessageOptions = {
  /** `/api/webrtc/ice-config` 기준으로 TURN이 구성된 경우 true */
  turnRelayConfigured?: boolean
  env?: NodeJS.ProcessEnv
}

/**
 * iceConnectionState / connectionState 가 failed 일 때 사용자에게 보여줄 문구.
 * TURN 미설정이면 모바일·크로스 네트워크 실패 원인을 짚어 안내한다.
 */
export function buildWebRtcNetworkFailureUserMessage(
  options: BuildWebRtcNetworkFailureUserMessageOptions = {}
): string {
  const env = options.env ?? process.env
  const relayOk =
    options.turnRelayConfigured !== undefined
      ? options.turnRelayConfigured
      : isWebRtcTurnEnvComplete(env)

  if (!relayOk) {
    return (
      '영상 연결에 실패했어요. PC와 휴대폰이 다른 네트워크(예: LTE·5G)일 때는 ' +
      'TURN(릴레이) 서버가 필요합니다. .env.local에 WEBRTC_TURN_URLS·WEBRTC_TURN_USERNAME·' +
      'WEBRTC_TURN_CREDENTIAL 세 가지를 넣고 재시작해 주세요. (.env.local.example 참고)'
    )
  }
  return '영상 연결에 실패했어요. 네트워크를 확인하거나 잠시 후 다시 시도해 주세요.'
}
