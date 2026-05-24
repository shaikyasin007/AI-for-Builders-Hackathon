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

    const userId = user.id

    // Get existing repositories
    const { data: repositories, error: repoError } = await supabase
      .from('repositories')
      .select('*')
      .eq('user_id', userId)

    if (repoError) {
      return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 })
    }

    if (!repositories || repositories.length === 0) {
      return NextResponse.json({ error: 'No repositories found' }, { status: 404 })
    }

    // Create pull requests for existing repositories
    const pullRequests = []
    for (const repo of repositories) {
      const prs = [
        {
          repository_id: repo.id,
          user_id: userId,
          title: `Feature: Improve ${repo.name} performance`,
          description: 'This PR includes performance optimizations and code improvements.',
          status: 'open',
          priority: 'high',
          branch_from: 'feature/performance',
          branch_to: 'main',
          lines_added: Math.floor(Math.random() * 200) + 50,
          lines_removed: Math.floor(Math.random() * 50) + 10,
          files_changed: Math.floor(Math.random() * 15) + 5,
        },
        {
          repository_id: repo.id,
          user_id: userId,
          title: `Fix: Security vulnerability in ${repo.name}`,
          description: 'Fixed a security issue found in the authentication module.',
          status: 'open',
          priority: 'critical',
          branch_from: 'fix/security',
          branch_to: 'main',
          lines_added: Math.floor(Math.random() * 100) + 20,
          lines_removed: Math.floor(Math.random() * 30) + 5,
          files_changed: Math.floor(Math.random() * 8) + 2,
        },
      ]

      const { data: createdPRs } = await supabase
        .from('pull_requests')
        .insert(prs)
        .select()

      if (createdPRs) {
        pullRequests.push(...createdPRs)
      }
    }

    // Create security issues for repositories
    const securityIssues = []
    for (const repo of repositories) {
      const issues = [
        {
          repository_id: repo.id,
          title: 'SQL Injection vulnerability',
          description: 'User input not properly sanitized in database queries',
          severity: 'critical',
          status: 'open',
          category: 'Injection',
          file_path: 'src/database.ts',
          line_number: 45,
        },
        {
          repository_id: repo.id,
          title: 'Hardcoded API credentials',
          description: 'API keys found in source code',
          severity: 'high',
          status: 'open',
          category: 'Secrets',
          file_path: 'config/api.ts',
          line_number: 12,
        },
      ]

      const { data: createdIssues } = await supabase
        .from('security_issues')
        .insert(issues)
        .select()

      if (createdIssues) {
        securityIssues.push(...createdIssues)
      }
    }

    // Create performance metrics
    const performanceMetrics = []
    for (const repo of repositories) {
      const metrics = {
        repository_id: repo.id,
        build_time_ms: Math.floor(Math.random() * 60000) + 20000,
        test_coverage: Math.floor(Math.random() * 40) + 60,
        bundle_size_kb: Math.floor(Math.random() * 300) + 100,
        lighthouse_score: Math.floor(Math.random() * 30) + 60,
      }

      const { data: createdMetrics } = await supabase
        .from('performance_metrics')
        .insert(metrics)
        .select()

      if (createdMetrics) {
        performanceMetrics.push(...createdMetrics)
      }
    }

    // Trigger AI analysis for pull requests
    for (const pr of pullRequests) {
      try {
        const analysis = await analyzeContent({
          type: 'code-review',
          content: `Pull Request: ${pr.title}\nDescription: ${pr.description}\nBranch: ${pr.branch_from}`,
        })

        await insertAIReview(supabase, {
          pull_request_id: pr.id,
          repository_id: pr.repository_id,
          reviewer_id: userId,
          analysis: analysis || 'AI analysis completed',
        })
      } catch (aiError) {
        console.error('AI analysis error:', aiError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Created ${pullRequests.length} pull requests, ${securityIssues.length} security issues, and ${performanceMetrics.length} performance metrics for ${repositories.length} repositories`,
      pullRequests: pullRequests.length,
      securityIssues: securityIssues.length,
      performanceMetrics: performanceMetrics.length,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 })
  }
}
