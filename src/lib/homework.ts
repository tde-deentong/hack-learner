import { GradeLevel } from '@prisma/client'
import { gradeToBaseMinutesPerQuestion } from './grade'

export interface HomeworkQuestion {
  index: number
  prompt: string
  difficulty?: 'easy' | 'medium' | 'hard'
  estMinutes: number
}

export function estimateHomeworkMinutes(questions: HomeworkQuestion[], grade: GradeLevel): number {
  const baseMinutes = gradeToBaseMinutesPerQuestion(grade)
  
  return questions.reduce((total, question) => {
    const difficultyMultiplier = getDifficultyMultiplier(question.difficulty)
    return total + (baseMinutes * difficultyMultiplier)
  }, 0)
}

function getDifficultyMultiplier(difficulty?: string): number {
  switch (difficulty) {
    case 'easy': return 1.0
    case 'medium': return 1.3
    case 'hard': return 1.6
    default: return 1.2 // Default to medium-hard
  }
}

export function detectQuestions(text: string): HomeworkQuestion[] {
  const questions: HomeworkQuestion[] = []
  
  // Common question patterns
  const patterns = [
    /^(\d+)[\.\)]\s*(.+?)(?=\n\d+[\.\)]|\n\n|$)/gms,
    /^(\d+)[\.\)]\s*(.+?)(?=\n\d+[\.\)]|\n\n|$)/gms,
    /Question\s*(\d+)[:\.]\s*(.+?)(?=Question\s*\d+[:\.]|\n\n|$)/gms,
    /^(\d+)\s*[\.\)]\s*(.+?)(?=\n\d+\s*[\.\)]|\n\n|$)/gms
  ]
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const index = parseInt(match[1])
      const prompt = match[2].trim()
      
      if (prompt.length > 10) { // Filter out very short matches
        questions.push({
          index,
          prompt,
          difficulty: estimateDifficulty(prompt),
          estMinutes: 3 // Default estimate
        })
      }
    }
  }
  
  // If no numbered questions found, try to find question-like sentences
  if (questions.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const questionSentences = sentences.filter(s => 
      s.includes('?') || 
      s.toLowerCase().includes('what') ||
      s.toLowerCase().includes('how') ||
      s.toLowerCase().includes('why') ||
      s.toLowerCase().includes('explain') ||
      s.toLowerCase().includes('describe')
    )
    
    questionSentences.forEach((sentence, index) => {
      questions.push({
        index: index + 1,
        prompt: sentence.trim(),
        difficulty: estimateDifficulty(sentence),
        estMinutes: 3
      })
    })
  }
  
  return questions
}

function estimateDifficulty(text: string): 'easy' | 'medium' | 'hard' {
  const lowerText = text.toLowerCase()
  
  // Simple heuristics for difficulty
  if (lowerText.includes('explain') || lowerText.includes('analyze') || lowerText.includes('compare')) {
    return 'hard'
  }
  if (lowerText.includes('what is') || lowerText.includes('define') || lowerText.includes('list')) {
    return 'easy'
  }
  return 'medium'
}

export function calculateHomeworkProgress(completedQuestions: number, totalQuestions: number): number {
  return Math.round((completedQuestions / totalQuestions) * 100)
}

export function estimateTimeRemaining(
  completedQuestions: number,
  questions: HomeworkQuestion[]
): number {
  return questions
    .slice(completedQuestions)
    .reduce((total, question) => total + question.estMinutes, 0)
}
