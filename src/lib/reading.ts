import { GradeLevel } from '@prisma/client'
import { gradeToWPM, getTargetChunkSize } from './grade'

export interface ReadingChunk {
  heading?: string
  chunkText: string
  estMinutes: number
  wordCount: number
}

export function estimateReadingMinutes(
  wordCount: number, 
  grade: GradeLevel, 
  compFactor: number = 1.15
): number {
  const wpm = gradeToWPM(grade)
  return Math.ceil((wordCount / wpm) * compFactor)
}

export function chunkText(text: string, targetWords: number): ReadingChunk[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const chunks: ReadingChunk[] = []
  let currentChunk = ''
  let currentWordCount = 0
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim()
    if (!trimmedSentence) continue
    
    const sentenceWordCount = trimmedSentence.split(/\s+/).length
    const newWordCount = currentWordCount + sentenceWordCount
    
    // If adding this sentence would exceed target, start a new chunk
    if (newWordCount > targetWords && currentChunk.trim()) {
      chunks.push({
        chunkText: currentChunk.trim(),
        estMinutes: Math.ceil(currentWordCount / 150), // Rough estimate
        wordCount: currentWordCount
      })
      currentChunk = trimmedSentence + '.'
      currentWordCount = sentenceWordCount
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence + '.'
      currentWordCount = newWordCount
    }
  }
  
  // Add the last chunk if it has content
  if (currentChunk.trim()) {
    chunks.push({
      chunkText: currentChunk.trim(),
      estMinutes: Math.ceil(currentWordCount / 150),
      wordCount: currentWordCount
    })
  }
  
  return chunks
}

export function chunkReadingForGrade(text: string, grade: GradeLevel): ReadingChunk[] {
  const targetWords = getTargetChunkSize(grade)
  return chunkText(text, targetWords)
}

export function calculateReadingProgress(currentChunk: number, totalChunks: number): number {
  return Math.round((currentChunk / totalChunks) * 100)
}

export function estimateTimeRemaining(
  currentChunk: number, 
  totalChunks: number, 
  chunks: ReadingChunk[]
): number {
  const remainingChunks = totalChunks - currentChunk
  return chunks
    .slice(currentChunk)
    .reduce((total, chunk) => total + chunk.estMinutes, 0)
}
