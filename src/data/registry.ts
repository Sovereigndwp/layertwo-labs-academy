import { lessonData, type LessonData } from './lessonData'

export const lessons: LessonData[] = [lessonData]

export const lessonsById: Record<string, LessonData> = Object.fromEntries(
  lessons.map((l) => [l.id, l]),
)

export function getPrerequisiteGaps(
  lessonId: string,
  completed: Set<string>,
): string[] {
  const lesson = lessonsById[lessonId]
  if (!lesson) return []
  return lesson.prerequisites.filter((p) => !completed.has(p))
}
