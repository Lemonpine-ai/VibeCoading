/** http:// → https:// 승격 (localhost 제외) */
export function ensureHttpsApiUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed.toLowerCase().startsWith('http://')) return trimmed
  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '[::1]') return trimmed
    parsed.protocol = 'https:'
    return parsed.href
  } catch {
    return trimmed.replace(/^http:\/\//i, 'https://')
  }
}
