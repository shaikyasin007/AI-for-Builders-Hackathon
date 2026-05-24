import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeContent, type AnalysisType } from '@/lib/ai/analyze'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type, content } = await request.json()

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Missing type or content' },
        { status: 400 }
      )
    }

    const analysis = await analyzeContent({
      type: type as AnalysisType,
      content,
    })

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('[AI] AI analysis error:', error)

    if (error instanceof Error) {
      console.error('[AI] Error message:', error.message)

      if (error.message.includes('GOOGLE_GENERATIVE_AI_API_KEY')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 500 }
        )
      }

      if (error.message.includes('API')) {
        return NextResponse.json(
          {
            error: 'AI service temporarily unavailable. Please add your GOOGLE_GENERATIVE_AI_API_KEY to environment variables.',
            fallback: true,
          },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    )
  }
}
