import type { SupabaseClient } from '@supabase/supabase-js'

type InsertAIReviewParams = {
  pull_request_id: string
  repository_id: string
  reviewer_id: string
  analysis: string
  status?: 'pending' | 'approved' | 'changes_requested' | 'commented'
}

function isMissingColumnError(error: { code?: string; message?: string } | null) {
  return (
    error?.code === 'PGRST204' ||
    Boolean(error?.message?.includes('Could not find the'))
  )
}

/** Inserts an AI review, adapting to the Supabase reviews table shape. */
export async function insertAIReview(
  supabase: SupabaseClient,
  { pull_request_id, repository_id, reviewer_id, analysis, status = 'commented' }: InsertAIReviewParams,
) {
  // This project's Supabase table uses: pull_request_id, repository_id, user_id, feedback, rating
  const projectSchema = {
    pull_request_id,
    repository_id,
    user_id: reviewer_id,
    feedback: analysis,
    rating: 4,
  }

  const first = await supabase.from('reviews').insert(projectSchema).select('id').single()
  if (!first.error) return first

  // Template schema from supabase-schema.sql
  const templateSchema = {
    pull_request_id,
    reviewer_id,
    status,
    body: analysis,
    ai_suggestions: [
      {
        type: 'improvement',
        message: analysis,
        severity: 'info',
      },
    ],
  }

  const second = await supabase.from('reviews').insert(templateSchema).select('id').single()
  if (!second.error) return second

  if (isMissingColumnError(second.error)) {
    return supabase.from('reviews').insert({
      pull_request_id,
      reviewer_id,
      status,
      body: analysis,
    }).select('id').single()
  }

  return first.error ? first : second
}

/** Read review text regardless of which column the database uses. */
export function getReviewText(review: {
  feedback?: string | null
  body?: string | null
  ai_suggestions?: Array<{ message?: string; content?: string }> | null
} | null): string {
  if (!review) return ''
  if (review.feedback) return review.feedback
  if (review.body) return review.body
  const suggestion = review.ai_suggestions?.[0]
  return suggestion?.message || suggestion?.content || ''
}

export function hasReviewContent(review: Parameters<typeof getReviewText>[0]): boolean {
  return getReviewText(review).length > 20
}
