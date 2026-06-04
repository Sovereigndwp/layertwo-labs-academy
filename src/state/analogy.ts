export interface AnalogyMapping {
  term: string
  element: string
}

export interface LessonAnalogy {
  world: string
  blurb: string
  mappings: AnalogyMapping[]
}

export interface AnalogyFinding {
  word: string
  where: string
}

export const WORLD_BANNED: Record<string, string[]> = {
  roads: [
    'parking', 'parked', 'floor', 'storey', 'staircase', 'elevator',
    'container', 'shelf', 'warehouse', 'building', 'rooftop',
  ],
}

export function auditAnalogy(
  analogy: LessonAnalogy,
  texts: { where: string; text: string }[],
): AnalogyFinding[] {
  const banned = WORLD_BANNED[analogy.world] ?? []
  if (banned.length === 0) return []
  const findings: AnalogyFinding[] = []
  for (const { where, text } of texts) {
    for (const word of banned) {
      const re = new RegExp(`\\b${word}\\b`, 'i')
      if (re.test(text)) findings.push({ word, where })
    }
  }
  return findings
}
