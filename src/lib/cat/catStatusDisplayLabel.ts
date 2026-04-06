export const CAT_STATUS_DB_VALUES = ['꿀잠', '배변', '그루밍', '식사', '우다다'] as const

export type CatStatusDbValue = (typeof CAT_STATUS_DB_VALUES)[number]

export const STATUS_DISPLAY_LABEL: Record<CatStatusDbValue, string> = {
  꿀잠: '꿈나라 여행 🌙',
  배변: '감자 캐기 🥔',
  그루밍: '그루밍 ✨',
  식사: '맘마 먹기 🍚',
  우다다: '우다다 🏃',
}

export function toDisplayLabel(dbValue: string | null | undefined): string {
  if (!dbValue) return ''
  return STATUS_DISPLAY_LABEL[dbValue as CatStatusDbValue] ?? dbValue
}
