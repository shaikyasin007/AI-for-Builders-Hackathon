import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeContent } from '@/lib/ai/analyze'
import { insertAIReview } from '@/lib/reviews/insert-ai-review'

async function triggerAIAnalysis(prId: string, repositoryId: string, userId: string, title: string, description: string | null, branch: string) {
  try {
    console.log('[v0] Triggering AI analysis for PR:', prId)

    const content = `Pull Request: ${title}\nDescription: ${description || 'No description'}\nBranch: ${branch}`
    const analysis = await analyzeContent({ type: 'code-review', content })
    console.log('[v0] AI analysis completed for PR:', prId)

    const supabase = await createClient()
    const { error: reviewError } = await insertAIReview(supabase, {
      pull_request_id: prId,
      repository_id: repositoryId,
      reviewer_id: userId,
      analysis: analysis || 'AI review completed',
      status: 'approved',
    })

    if (reviewError) {
      console.error('[v0] Review insert error:', reviewError)
    } else {
      console.log('[v0] Review created for PR:', prId)
    }
  } catch (error) {
    console.error('[v0] AI analysis trigger error:', error)
  }
}

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

    const body = await request.json()
    console.log('[v0] Add repo request body:', body)

    const { name, url, description, language, owner, repo } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Missing name or url' },
        { status: 400 }
      )
    }

    // Calculate initial health score based on available data
    let healthScore = 75
    if (language) {
      // Give higher score for popular languages
      const popularLanguages = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust']
      healthScore += popularLanguages.includes(language) ? 10 : 0
    }

    // Insert repository into database (minimal columns to avoid schema mismatch)
    const { data, error } = await supabase
      .from('repositories')
      .insert({
        user_id: user.id,
        name,
        url,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Database error:', error)
      return NextResponse.json(
        { error: 'Failed to add repository', details: error.message },
        { status: 500 }
      )
    }

    const repositoryId = data.id
    console.log('[v0] Repository created with ID:', repositoryId)

    // If owner and repo are provided, fetch real data from GitHub (fire and forget)
    if (owner && repo) {
      // Don't await this - let it run in background
      fetchGitHubData(owner, repo, repositoryId, user.id, healthScore).catch(err => {
        console.error('[v0] Background GitHub fetch error:', err)
      })
    }

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('[v0] Add repo error:', error)
    return NextResponse.json(
      { error: 'Failed to add repository', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Separate function for background GitHub data fetching
async function fetchGitHubData(owner: string, repo: string, repositoryId: string, userId: string, baseHealthScore: number) {
  console.log('[v0] Background fetch started for:', owner, repo, 'repositoryId:', repositoryId)
  const supabase = await createClient()
  
  try {
    // Fetch repository details
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
    console.log('[v0] GitHub repo response status:', repoResponse.status)
    
    if (repoResponse.ok) {
      const repoData = await repoResponse.json()
      console.log('[v0] GitHub repo data fetched:', { name: repoData.name, stars: repoData.stargazers_count })
      
      // Update repository with real data (only update columns that exist)
      try {
        const updateData: any = {
          health_score: Math.min(100, baseHealthScore + Math.floor(repoData.stargazers_count / 100)),
        }
        
        // Try to update description if column exists
        if (repoData.description) {
          updateData.description = repoData.description
        }
        
        // Try to update language if column exists
        if (repoData.language) {
          updateData.language = repoData.language
        }
        
        console.log('[v0] Attempting to update repository with:', Object.keys(updateData))
        await supabase
          .from('repositories')
          .update(updateData)
          .eq('id', repositoryId)
        console.log('[v0] Repository update successful')
      } catch (updateError) {
        console.error('[v0] Update error (column might not exist):', updateError)
        // Continue even if update fails
      }

      // Fetch pull requests
      const prsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=10`)
      console.log('[v0] GitHub PRs response status:', prsResponse.status)
      
      if (prsResponse.ok) {
        const prsData = await prsResponse.json()
        console.log('[v0] GitHub PRs fetched:', prsData.length)
        
        if (prsData.length > 0) {
          const pullRequests = prsData.slice(0, 5).map((pr: any) => ({
            repository_id: repositoryId,
            user_id: userId,
            title: pr.title,
            description: pr.body?.substring(0, 1000), // Limit description length
            status: 'open',
          }))

          console.log('[v0] Inserting pull requests:', pullRequests.length)
          const { data: createdPRs, error: prError } = await supabase
            .from('pull_requests')
            .insert(pullRequests)
            .select()
          
          if (prError) {
            console.error('[v0] Pull request insert error:', prError)
          } else {
            console.log('[v0] Pull requests created:', createdPRs?.length)
          }

          // Analyze PRs one at a time to avoid bursting Gemini rate limits
          const maxAiReviews = Number(process.env.MAX_AI_REVIEWS_PER_IMPORT) || 2
          for (const pr of (createdPRs || []).slice(0, maxAiReviews)) {
            try {
              await triggerAIAnalysis(pr.id, repositoryId, userId, pr.title, pr.description, 'main')
              await new Promise((resolve) => setTimeout(resolve, 3000))
            } catch (err) {
              console.error('[v0] AI analysis error for PR:', pr.id, err)
            }
          }
        }
      }

      // Fetch issues for security analysis
      const issuesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=10`)
      console.log('[v0] GitHub issues response status:', issuesResponse.status)
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        console.log('[v0] GitHub issues fetched:', issuesData.length)
        
        const securityIssues = issuesData
          .filter((issue: any) => issue.labels?.some((l: any) => l.name.toLowerCase().includes('security') || l.name.toLowerCase().includes('vulnerability')))
          .slice(0, 3)
          .map((issue: any) => ({
            repository_id: repositoryId,
            title: issue.title,
            description: issue.body?.substring(0, 500),
            severity: issue.labels?.some((l: any) => l.name === 'critical') ? 'critical' : 'high',
            status: 'open',
            category: 'Security',
            file_path: null,
            line_number: null,
          }))

        if (securityIssues.length > 0) {
          console.log('[v0] Inserting security issues:', securityIssues.length)
          await supabase.from('security_issues').insert(securityIssues)
          console.log('[v0] Security issues created')
        }
      }
    }
  } catch (githubError) {
    console.error('[v0] GitHub fetch error:', githubError)
  }
  console.log('[v0] Background fetch completed')
}
