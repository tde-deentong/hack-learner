import { GradeLevel } from '@prisma/client'
import { ReadingChunk } from '../reading'
import { HomeworkQuestion } from '../homework'

export interface AISummary {
  summary: string
  vocabulary: string[]
  keyConcepts: string[]
}

export interface AIBreakdown {
  steps: string[]
  hints: string[]
  estimatedTime: number
}

export class AIProvider {
  private apiKey: string
  private provider: string
  private baseUrl?: string

  constructor(apiKey: string, provider: string = 'openai', baseUrl?: string) {
    this.apiKey = apiKey
    this.provider = provider
    this.baseUrl = baseUrl
  }

  async summarizeMaterial(text: string, grade: GradeLevel): Promise<AISummary> {
    try {
      const prompt = this.buildSummaryPrompt(text, grade)
      const response = await this.callAI(prompt)
      return this.parseSummaryResponse(response)
    } catch (error) {
      console.error('AI summary failed, using fallback:', error)
      return this.getFallbackSummary(text, grade)
    }
  }

  async chunkReading(text: string, grade: GradeLevel): Promise<ReadingChunk[]> {
    try {
      const prompt = this.buildChunkingPrompt(text, grade)
      const response = await this.callAI(prompt)
      return this.parseChunkingResponse(response)
    } catch (error) {
      console.error('AI chunking failed, using fallback:', error)
      return this.getFallbackChunks(text, grade)
    }
  }

  async detectQuestions(text: string): Promise<HomeworkQuestion[]> {
    try {
      const prompt = this.buildQuestionDetectionPrompt(text)
      const response = await this.callAI(prompt)
      return this.parseQuestionResponse(response)
    } catch (error) {
      console.error('AI question detection failed, using fallback:', error)
      return this.getFallbackQuestions(text)
    }
  }

  async breakdownHomework(questions: HomeworkQuestion[], grade: GradeLevel): Promise<AIBreakdown> {
    try {
      const prompt = this.buildBreakdownPrompt(questions, grade)
      const response = await this.callAI(prompt)
      return this.parseBreakdownResponse(response)
    } catch (error) {
      console.error('AI breakdown failed, using fallback:', error)
      return this.getFallbackBreakdown(questions, grade)
    }
  }

  private async callAI(prompt: string): Promise<string> {
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    }

    const body = {
      model: this.getModel(),
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    }

    const url = this.baseUrl || this.getDefaultUrl()
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private getModel(): string {
    switch (this.provider) {
      case 'openai': return 'gpt-3.5-turbo'
      case 'anthropic': return 'claude-3-sonnet-20240229'
      case 'azure': return 'gpt-35-turbo'
      default: return 'gpt-3.5-turbo'
    }
  }

  private getDefaultUrl(): string {
    switch (this.provider) {
      case 'openai': return 'https://api.openai.com/v1/chat/completions'
      case 'anthropic': return 'https://api.anthropic.com/v1/messages'
      case 'azure': return 'https://your-resource.openai.azure.com/openai/deployments/your-deployment/chat/completions?api-version=2023-12-01-preview'
      default: return 'https://api.openai.com/v1/chat/completions'
    }
  }

  private buildSummaryPrompt(text: string, grade: GradeLevel): string {
    const gradeName = grade === 'K' ? 'Kindergarten' : `Grade ${grade.slice(1)}`
    return `Summarize this educational material for ${gradeName} students. Provide:
1. A brief summary (2-3 sentences)
2. Key vocabulary words (5-10 words)
3. Main concepts (3-5 concepts)

Text: ${text.substring(0, 2000)}...`
  }

  private buildChunkingPrompt(text: string, grade: GradeLevel): string {
    const gradeName = grade === 'K' ? 'Kindergarten' : `Grade ${grade.slice(1)}`
    return `Break this text into reading chunks suitable for ${gradeName} students. Each chunk should be 2-3 minutes of reading. Return as JSON array with: {heading?, chunkText, estMinutes, wordCount}`
  }

  private buildQuestionDetectionPrompt(text: string): string {
    return `Find all questions in this text. Return as JSON array with: {index, prompt, difficulty, estMinutes}`
  }

  private buildBreakdownPrompt(questions: HomeworkQuestion[], grade: GradeLevel): string {
    const gradeName = grade === 'K' ? 'Kindergarten' : `Grade ${grade.slice(1)}`
    return `Create a study guide for these ${gradeName} homework questions. Provide steps and hints for each question.`
  }

  private parseSummaryResponse(response: string): AISummary {
    // Simple parsing - in production, use more robust JSON parsing
    return {
      summary: response.split('\n')[0] || 'Summary not available',
      vocabulary: ['key', 'terms', 'here'],
      keyConcepts: ['concept1', 'concept2', 'concept3']
    }
  }

  private parseChunkingResponse(response: string): ReadingChunk[] {
    try {
      return JSON.parse(response)
    } catch {
      return this.getFallbackChunks('', 'G5')
    }
  }

  private parseQuestionResponse(response: string): HomeworkQuestion[] {
    try {
      return JSON.parse(response)
    } catch {
      return this.getFallbackQuestions('')
    }
  }

  private parseBreakdownResponse(response: string): AIBreakdown {
    return {
      steps: ['Step 1', 'Step 2', 'Step 3'],
      hints: ['Hint 1', 'Hint 2'],
      estimatedTime: 30
    }
  }

  // Fallback methods
  private getFallbackSummary(text: string, grade: GradeLevel): AISummary {
    return {
      summary: `This material contains ${text.split(' ').length} words and covers important topics for ${grade === 'K' ? 'Kindergarten' : `Grade ${grade.slice(1)}`} students.`,
      vocabulary: ['important', 'words', 'here'],
      keyConcepts: ['main', 'concepts', 'covered']
    }
  }

  private getFallbackChunks(text: string, grade: GradeLevel): ReadingChunk[] {
    const words = text.split(' ')
    const chunkSize = grade === 'K' || grade.startsWith('G1') || grade.startsWith('G2') ? 200 : 400
    const chunks: ReadingChunk[] = []
    
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunkWords = words.slice(i, i + chunkSize)
      chunks.push({
        chunkText: chunkWords.join(' '),
        estMinutes: Math.ceil(chunkWords.length / 150),
        wordCount: chunkWords.length
      })
    }
    
    return chunks
  }

  private getFallbackQuestions(text: string): HomeworkQuestion[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    return sentences.slice(0, 5).map((sentence, index) => ({
      index: index + 1,
      prompt: sentence.trim(),
      difficulty: 'medium' as const,
      estMinutes: 3
    }))
  }

  private getFallbackBreakdown(questions: HomeworkQuestion[], grade: GradeLevel): AIBreakdown {
    return {
      steps: ['Read the question carefully', 'Think about what you know', 'Write your answer'],
      hints: ['Take your time', 'Ask for help if needed'],
      estimatedTime: questions.length * 5
    }
  }
}

// Factory function
export function createAIProvider(): AIProvider | null {
  const apiKey = process.env.AI_API_KEY
  const provider = process.env.AI_PROVIDER || 'openai'
  
  if (!apiKey) {
    console.warn('No AI API key provided, using fallback mode')
    return null
  }
  
  return new AIProvider(apiKey, provider)
}
