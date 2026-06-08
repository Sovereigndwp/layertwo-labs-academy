import { lessonData, type LessonData } from './lessonData'
import { layersMapLesson } from './lessons/layers-map'

export const lessons: LessonData[] = [lessonData, layersMapLesson]

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
