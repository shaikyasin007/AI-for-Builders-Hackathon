// Database types matching Supabase schema
export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: string
  github_username: string | null
  created_at: string
  updated_at: string
}

export interface Repository {
  id: string
  user_id: string
  name: string
  description: string | null
  language: string | null
  health_score: number
  is_private: boolean
  url: string | null
  created_at: string
  updated_at: string
}

export interface PullRequest {
  id: string
  repository_id: string
  user_id: string
  title: string
  description: string | null
  status: 'open' | 'merged' | 'closed'
  priority: 'critical' | 'high' | 'medium' | 'low'
  branch_from: string | null
  branch_to: string
  lines_added: number
  lines_removed: number
  files_changed: number
  github_number: number | null
  created_at: string
  updated_at: string
  repository?: Repository
}

export interface Review {
  id: string
  pull_request_id: string
  repository_id?: string
  reviewer_id?: string
  user_id?: string
  status?: 'pending' | 'approved' | 'changes_requested' | 'commented'
  body?: string | null
  feedback?: string | null
  rating?: number | null
  ai_suggestions?: AISuggestion[] | null
  created_at: string
  updated_at: string
  pull_request?: PullRequest
}

export interface AISuggestion {
  type: 'improvement' | 'security' | 'performance' | 'style'
  message: string
  line?: number
  file?: string
  severity: 'info' | 'warning' | 'error'
}

export interface SecurityIssue {
  id: string
  repository_id: string
  title: string
  description: string | null
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed'
  category: string | null
  file_path: string | null
  line_number: number | null
  created_at: string
  resolved_at: string | null
  repository?: Repository
}

export interface PerformanceMetric {
  id: string
  repository_id: string
  build_time_ms: number | null
  test_coverage: number | null
  bundle_size_kb: number | null
  lighthouse_score: number | null
  recorded_at: string
  repository?: Repository
}

export interface ActivityLog {
  id: string
  user_id: string | null
  repository_id: string | null
  action: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  repository?: Repository
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string | null
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  link: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  user_id: string
  team_name: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  reviews_completed: number
  commits_count: number
  joined_at: string
  profile?: Profile
}

// Dashboard metrics
export interface DashboardMetrics {
  totalReviews: number
  openIssues: number
  securityVulnerabilities: number
  avgCodeCoverage: number
  repositoryCount: number
  pullRequestCount: number
}
