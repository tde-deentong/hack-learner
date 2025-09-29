import { GradeLevel } from '@prisma/client'

export const GRADE_LEVELS: GradeLevel[] = [
  'K', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10', 'G11', 'G12'
]

export function gradeToWPM(grade: GradeLevel): number {
  const gradeIndex = GRADE_LEVELS.indexOf(grade)
  
  if (gradeIndex <= 2) return 100 // K-G2: 90-110, use 100
  if (gradeIndex <= 5) return 140 // G3-G5: 130-150, use 140
  if (gradeIndex <= 8) return 165 // G6-G8: 160-170, use 165
  return 190 // G9-G12: 180-200, use 190
}

export function gradeToBaseMinutesPerQuestion(grade: GradeLevel): number {
  const gradeIndex = GRADE_LEVELS.indexOf(grade)
  
  if (gradeIndex <= 2) return 2 // K-G2
  if (gradeIndex <= 5) return 3 // G3-G5
  if (gradeIndex <= 8) return 4 // G6-G8
  return 5 // G9-G12
}

export function getGradeDisplayName(grade: GradeLevel): string {
  if (grade === 'K') return 'Kindergarten'
  return `Grade ${grade.slice(1)}`
}

export function isPrimaryGrade(grade: GradeLevel): boolean {
  const gradeIndex = GRADE_LEVELS.indexOf(grade)
  return gradeIndex <= 5 // K-G5
}

export function getTargetChunkSize(grade: GradeLevel): number {
  return isPrimaryGrade(grade) ? 300 : 500 // Primary: 250-350, Secondary: 400-600
}
