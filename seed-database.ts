import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedDatabase() {
  console.log('Starting database seed...')

  // Get or create a test user (you'll need to sign up first in the app)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('No authenticated user found. Please sign up in the app first.')
    return
  }

  const userId = user.id
  console.log('Using user ID:', userId)

  // Create profile if it doesn't exist
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      full_name: 'Demo User',
      role: 'admin',
      github_username: 'demouser',
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
  }

  // Create repositories
  const repositories = [
    {
      user_id: userId,
      name: 'claude-plugins-official',
      full_name: 'anthropic/claude-plugins-official',
      description: 'Official, Anthropic-managed directory of high quality Claude Code Plugins',
      language: 'Python',
      stars: 1250,
      forks: 89,
      open_issues: 12,
      health_score: 85,
      is_private: false,
      github_id: 123456789,
      url: 'https://github.com/anthropic/claude-plugins-official',
    },
    {
      user_id: userId,
      name: 'my-website',
      full_name: 'demouser/my-website',
      description: 'Personal portfolio website built with Next.js',
      language: 'TypeScript',
      stars: 42,
      forks: 8,
      open_issues: 3,
      health_score: 72,
      is_private: false,
      github_id: 987654321,
      url: 'https://github.com/demouser/my-website',
    },
    {
      user_id: userId,
      name: 'api-server',
      full_name: 'demouser/api-server',
      description: 'RESTful API server with authentication',
      language: 'JavaScript',
      stars: 156,
      forks: 23,
      open_issues: 7,
      health_score: 68,
      is_private: false,
      github_id: 456789123,
      url: 'https://github.com/demouser/api-server',
    },
  ]

  const { data: repoData, error: repoError } = await supabase
    .from('repositories')
    .insert(repositories)
    .select()

  if (repoError) {
    console.error('Error creating repositories:', repoError)
  } else {
    console.log('Created repositories:', repoData?.length)
  }

  // Get repository IDs
  const repoIds = repoData?.map(r => r.id) || []

  // Create pull requests
  const pullRequests = [
    {
      repository_id: repoIds[0],
      user_id: userId,
      title: 'Add new plugin for code formatting',
      description: 'This PR adds a new plugin that automatically formats code according to project standards.',
      status: 'open',
      priority: 'high',
      branch_from: 'feature/code-formatter',
      branch_to: 'main',
      lines_added: 245,
      lines_removed: 89,
      files_changed: 12,
      github_number: 142,
    },
    {
      repository_id: repoIds[0],
      user_id: userId,
      title: 'Fix memory leak in plugin loader',
      description: 'Fixed a memory leak that occurred when loading and unloading plugins repeatedly.',
      status: 'merged',
      priority: 'critical',
      branch_from: 'fix/memory-leak',
      branch_to: 'main',
      lines_added: 34,
      lines_removed: 18,
      files_changed: 3,
      github_number: 138,
    },
    {
      repository_id: repoIds[1],
      user_id: userId,
      title: 'Update dependencies to latest versions',
      description: 'Updated all dependencies to their latest stable versions to fix security vulnerabilities.',
      status: 'open',
      priority: 'medium',
      branch_from: 'deps/update',
      branch_to: 'main',
      lines_added: 156,
      lines_removed: 203,
      files_changed: 8,
      github_number: 45,
    },
    {
      repository_id: repoIds[2],
      user_id: userId,
      title: 'Implement rate limiting middleware',
      description: 'Added rate limiting to prevent API abuse and improve performance.',
      status: 'open',
      priority: 'high',
      branch_from: 'feature/rate-limiting',
      branch_to: 'main',
      lines_added: 89,
      lines_removed: 12,
      files_changed: 5,
      github_number: 78,
    },
  ]

  const { data: prData, error: prError } = await supabase
    .from('pull_requests')
    .insert(pullRequests)
    .select()

  if (prError) {
    console.error('Error creating pull requests:', prError)
  } else {
    console.log('Created pull requests:', prData?.length)
  }

  // Create security issues
  const securityIssues = [
    {
      repository_id: repoIds[0],
      title: 'SQL Injection vulnerability in plugin loader',
      description: 'The plugin loader does not properly sanitize user input, allowing SQL injection attacks.',
      severity: 'critical',
      status: 'open',
      category: 'Injection',
      file_path: 'src/loader.ts',
      line_number: 45,
    },
    {
      repository_id: repoIds[0],
      title: 'Hardcoded API key in configuration',
      description: 'API key is hardcoded in the configuration file instead of using environment variables.',
      severity: 'high',
      status: 'open',
      category: 'Secrets Management',
      file_path: 'config/api.ts',
      line_number: 12,
    },
    {
      repository_id: repoIds[0],
      title: 'Missing input validation on user data',
      description: 'User input is not validated before processing, potentially leading to security issues.',
      severity: 'medium',
      status: 'open',
      category: 'Input Validation',
      file_path: 'src/handlers/user.ts',
      line_number: 78,
    },
    {
      repository_id: repoIds[1],
      title: 'Cross-site scripting (XSS) vulnerability',
      description: 'User-generated content is not properly escaped, allowing XSS attacks.',
      severity: 'high',
      status: 'open',
      category: 'XSS',
      file_path: 'components/Comment.tsx',
      line_number: 23,
    },
    {
      repository_id: repoIds[2],
      title: 'Insecure direct object reference',
      description: 'Users can access other users\' data by guessing IDs.',
      severity: 'critical',
      status: 'open',
      category: 'Access Control',
      file_path: 'routes/users.ts',
      line_number: 56,
    },
  ]

  const { data: securityData, error: securityError } = await supabase
    .from('security_issues')
    .insert(securityIssues)
    .select()

  if (securityError) {
    console.error('Error creating security issues:', securityError)
  } else {
    console.log('Created security issues:', securityData?.length)
  }

  // Create performance metrics
  const performanceMetrics = [
    {
      repository_id: repoIds[0],
      build_time_ms: 45000,
      test_coverage: 78.5,
      bundle_size_kb: 245,
      lighthouse_score: 72,
    },
    {
      repository_id: repoIds[1],
      build_time_ms: 32000,
      test_coverage: 92.3,
      bundle_size_kb: 180,
      lighthouse_score: 95,
    },
    {
      repository_id: repoIds[2],
      build_time_ms: 28000,
      test_coverage: 65.8,
      bundle_size_kb: 156,
      lighthouse_score: 68,
    },
  ]

  const { data: perfData, error: perfError } = await supabase
    .from('performance_metrics')
    .insert(performanceMetrics)
    .select()

  if (perfError) {
    console.error('Error creating performance metrics:', perfError)
  } else {
    console.log('Created performance metrics:', perfData?.length)
  }

  // Create reviews with AI suggestions
  const prIds = prData?.map(p => p.id) || []
  
  const reviews = [
    {
      pull_request_id: prIds[0],
      reviewer_id: userId,
      status: 'changes_requested',
      body: 'Good work on the plugin structure. A few suggestions for improvement.',
      ai_suggestions: [
        {
          type: 'improvement',
          message: 'Consider adding error handling for the case where the plugin fails to load',
          severity: 'warning',
        },
        {
          type: 'security',
          message: 'The plugin configuration should be validated before loading',
          severity: 'error',
        },
      ],
    },
    {
      pull_request_id: prIds[1],
      reviewer_id: userId,
      status: 'approved',
      body: 'Excellent fix for the memory leak. The solution is clean and efficient.',
      ai_suggestions: [
        {
          type: 'improvement',
          message: 'Consider adding unit tests for the memory cleanup logic',
          severity: 'info',
        },
      ],
    },
    {
      pull_request_id: prIds[2],
      reviewer_id: userId,
      status: 'pending',
      body: 'Please review the dependency changes carefully.',
      ai_suggestions: [
        {
          type: 'security',
          message: 'One of the updated dependencies has a known vulnerability (CVE-2024-1234)',
          severity: 'error',
        },
        {
          type: 'performance',
          message: 'The new version of react-dom has better performance, consider updating other React packages',
          severity: 'warning',
        },
      ],
    },
  ]

  const { data: reviewData, error: reviewError } = await supabase
    .from('reviews')
    .insert(reviews)
    .select()

  if (reviewError) {
    console.error('Error creating reviews:', reviewError)
  } else {
    console.log('Created reviews:', reviewData?.length)
  }

  // Create activity logs
  const activityLogs = [
    {
      user_id: userId,
      repository_id: repoIds[0],
      action: 'repository_added',
      description: 'Added repository anthropic/claude-plugins-official',
      metadata: { source: 'github_import' },
    },
    {
      user_id: userId,
      repository_id: repoIds[0],
      action: 'scan_completed',
      description: 'Completed security scan',
      metadata: { issues_found: 3 },
    },
    {
      user_id: userId,
      repository_id: repoIds[1],
      action: 'repository_added',
      description: 'Added repository demouser/my-website',
      metadata: { source: 'manual' },
    },
    {
      user_id: userId,
      pull_request_id: prIds[0],
      action: 'review_requested',
      description: 'Requested AI review for PR #142',
      metadata: { ai_enabled: true },
    },
  ]

  const { error: activityError } = await supabase
    .from('activity_log')
    .insert(activityLogs)

  if (activityError) {
    console.error('Error creating activity logs:', activityError)
  } else {
    console.log('Created activity logs')
  }

  // Create notifications
  const notifications = [
    {
      user_id: userId,
      title: 'Security scan completed',
      message: 'Found 3 security issues in anthropic/claude-plugins-official',
      type: 'warning',
      link: `/dashboard/repositories/${repoIds[0]}`,
    },
    {
      user_id: userId,
      title: 'PR Review Available',
      message: 'AI review is ready for PR #142',
      type: 'success',
      link: `/dashboard/pull-requests/${prIds[0]}`,
    },
    {
      user_id: userId,
      title: 'Performance Alert',
      message: 'Build time increased by 15% in demouser/api-server',
      type: 'error',
      link: `/dashboard/repositories/${repoIds[2]}`,
    },
  ]

  const { error: notificationError } = await supabase
    .from('notifications')
    .insert(notifications)

  if (notificationError) {
    console.error('Error creating notifications:', notificationError)
  } else {
    console.log('Created notifications')
  }

  console.log('Database seed completed successfully!')
}

seedDatabase().catch(console.error)
