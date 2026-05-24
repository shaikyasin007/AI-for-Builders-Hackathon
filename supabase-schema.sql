-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  github_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Repositories table
CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  open_issues INTEGER DEFAULT 0,
  health_score INTEGER DEFAULT 75,
  is_private BOOLEAN DEFAULT false,
  github_id INTEGER,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pull requests table
CREATE TABLE IF NOT EXISTS pull_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'merged', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  branch_from TEXT,
  branch_to TEXT NOT NULL,
  lines_added INTEGER DEFAULT 0,
  lines_removed INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  github_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pull_request_id UUID REFERENCES pull_requests(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'changes_requested', 'commented')),
  body TEXT,
  ai_suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security issues table
CREATE TABLE IF NOT EXISTS security_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  category TEXT,
  file_path TEXT,
  line_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES repositories(id) ON DELETE CASCADE,
  build_time_ms INTEGER,
  test_coverage NUMERIC(5, 2),
  bundle_size_kb INTEGER,
  lighthouse_score INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  repository_id UUID REFERENCES repositories(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  reviews_completed INTEGER DEFAULT 0,
  commits_count INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_repositories_user_id ON repositories(user_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_repository_id ON pull_requests(repository_id);
CREATE INDEX IF NOT EXISTS idx_pull_requests_user_id ON pull_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pull_request_id ON reviews(pull_request_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_security_issues_repository_id ON security_issues(repository_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_repository_id ON performance_metrics(repository_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_repository_id ON activity_logs(repository_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pull_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for repositories
CREATE POLICY "Users can view own repositories" ON repositories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own repositories" ON repositories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own repositories" ON repositories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own repositories" ON repositories FOR DELETE USING (auth.uid() = user_id);

-- Create policies for pull requests
CREATE POLICY "Users can view pull requests in own repositories" ON pull_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = pull_requests.repository_id AND repositories.user_id = auth.uid())
);
CREATE POLICY "Users can insert pull requests in own repositories" ON pull_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = pull_requests.repository_id AND repositories.user_id = auth.uid())
);
CREATE POLICY "Users can update pull requests in own repositories" ON pull_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = pull_requests.repository_id AND repositories.user_id = auth.uid())
);

-- Create policies for reviews
CREATE POLICY "Users can view reviews for own pull requests" ON reviews FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM pull_requests 
    JOIN repositories ON repositories.id = pull_requests.repository_id 
    WHERE pull_requests.id = reviews.pull_request_id AND repositories.user_id = auth.uid()
  )
);
CREATE POLICY "Users can insert reviews for own pull requests" ON reviews FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM pull_requests 
    JOIN repositories ON repositories.id = pull_requests.repository_id 
    WHERE pull_requests.id = reviews.pull_request_id AND repositories.user_id = auth.uid()
  )
);

-- Create policies for security issues
CREATE POLICY "Users can view security issues in own repositories" ON security_issues FOR SELECT USING (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = security_issues.repository_id AND repositories.user_id = auth.uid())
);
CREATE POLICY "Users can insert security issues in own repositories" ON security_issues FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = security_issues.repository_id AND repositories.user_id = auth.uid())
);
CREATE POLICY "Users can update security issues in own repositories" ON security_issues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = security_issues.repository_id AND repositories.user_id = auth.uid())
);

-- Create policies for performance metrics
CREATE POLICY "Users can view performance metrics in own repositories" ON performance_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = performance_metrics.repository_id AND repositories.user_id = auth.uid())
);
CREATE POLICY "Users can insert performance metrics in own repositories" ON performance_metrics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM repositories WHERE repositories.id = performance_metrics.repository_id AND repositories.user_id = auth.uid())
);

-- Create policies for activity logs
CREATE POLICY "Users can view own activity logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert activity logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for team members
CREATE POLICY "Users can view team members" ON team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert team members" ON team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team membership" ON team_members FOR UPDATE USING (auth.uid() = user_id);
