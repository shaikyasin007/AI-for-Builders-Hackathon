import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

export type AnalysisType =
  | 'code-review'
  | 'performance'
  | 'security'
  | 'architecture'

const DEFAULT_MODEL = 'gemini-2.5-flash-lite'
const MAX_RETRIES = 3

function getModelId() {
  return process.env.GEMINI_MODEL || DEFAULT_MODEL
}

function buildPrompt(type: AnalysisType, content: string): string {
  switch (type) {
    case 'code-review':
      return `You are an expert code reviewer. Analyze the following pull request and provide constructive feedback:\n\n${content}\n\nProvide your analysis in 2-3 sentences focusing on: code quality, performance, security, and best practices.`
    case 'performance':
      return `You are a performance optimization expert. Analyze these repository metrics and suggest improvements:\n\n${content}\n\nProvide 2-3 specific optimization recommendations.`
    case 'security':
      return `You are a security analyst. Review the following code for security vulnerabilities:\n\n${content}\n\nIdentify any security issues and suggest fixes.`
    case 'architecture':
      return `You are a software architect. Evaluate the following architecture and suggest improvements:\n\n${content}\n\nProvide 2-3 recommendations to improve scalability and maintainability.`
    default:
      return `Analyze the following and provide helpful insights:\n\n${content}`
  }
}

function getRetryDelayMs(error: unknown, attempt: number): number {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode === 429) {
      // Google often suggests ~20s; scale up on repeated attempts
      return 22_000 * (attempt + 1)
    }
  }
  return 2000 * (attempt + 1)
}

function isRateLimitError(error: unknown): boolean {
  return (
    error !== null &&
    typeof error === 'object' &&
    'statusCode' in error &&
    (error as { statusCode?: number }).statusCode === 429
  )
}

export async function analyzeContent({
  type,
  content,
}: {
  type: AnalysisType
  content: string
}): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error('AI service not configured: missing GOOGLE_GENERATIVE_AI_API_KEY')
  }

  const modelId = getModelId()
  const prompt = buildPrompt(type, content)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI] Calling Gemini API with model ${modelId}${attempt > 0 ? ` (retry ${attempt})` : ''}`)
      const { text } = await generateText({
        model: google(modelId),
        prompt,
      })
      console.log('[AI] Gemini API response received')
      return text
    } catch (error) {
      if (isRateLimitError(error) && attempt < MAX_RETRIES) {
        const delayMs = getRetryDelayMs(error, attempt)
        console.warn(`[AI] Rate limited (429), retrying in ${Math.round(delayMs / 1000)}s...`)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        continue
      }

      if (isRateLimitError(error)) {
        throw new Error(
          'Gemini API quota exceeded. Wait a few minutes, try again tomorrow, or enable billing at https://ai.google.dev/gemini-api/docs/rate-limits'
        )
      }

      throw error
    }
  }

  throw new Error('Failed to analyze content after retries')
}
