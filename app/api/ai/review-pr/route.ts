import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeContent } from '@/lib/ai/analyze'
import { insertAIReview } from '@/lib/reviews/insert-ai-review'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pullRequestId } = await request.json()
    if (!pullRequestId) {
      return NextResponse.json({ error: 'Missing pullRequestId' }, { status: 400 })
    }

    const { data: pr, error: prError } = await supabase
      .from('pull_requests')
      .select('*')
      .eq('id', pullRequestId)
      .single()

    if (prError || !pr) {
      return NextResponse.json({ error: 'Pull request not found' }, { status: 404 })
    }

    const content = `Pull Request: ${pr.title}\nDescription: ${pr.description || 'No description'}\nBranch: ${pr.branch_from || 'unknown'}`
    const analysis = await analyzeContent({ type: 'code-review', content })

    const { error: insertError } = await insertAIReview(supabase, {
      pull_request_id: pr.id,
      repository_id: pr.repository_id,
      reviewer_id: user.id,
      analysis,
    })

    if (insertError) {
      console.error('[AI] Review insert error:', insertError)
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
    }

    return NextResponse.json({ success: true, analysis })
  } catch (error) {
    console.error('[AI] review-pr error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze pull request' },
      { status: 500 },
    )
  }
}
