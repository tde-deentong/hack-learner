import pdf from 'pdf-parse'

export interface PDFMetadata {
  wordCount: number
  pageCount: number
  text: string
  title?: string
  author?: string
}

export async function extractPdfText(buffer: Buffer): Promise<PDFMetadata> {
  try {
    const data = await pdf(buffer)
    
    return {
      wordCount: data.text.split(/\s+/).length,
      pageCount: data.numpages,
      text: data.text,
      title: data.info?.Title,
      author: data.info?.Author
    }
  } catch (error) {
    console.error('Error extracting PDF text:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' }
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  return { valid: true }
}

export function getFileSizeDisplay(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
