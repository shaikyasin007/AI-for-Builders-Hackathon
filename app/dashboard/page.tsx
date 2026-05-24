import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  // Fetch all dashboard data
  const [
    { data: repositories },
    { data: pullRequests },
    { data: reviews },
    { data: securityIssues },
    { data: performanceMetrics },
    { data: activityLog },
    { data: teamMembers },
    { data: profile }
  ] = await Promise.all([
    supabase.from("repositories").select("*").order("created_at", { ascending: false }),
    supabase.from("pull_requests").select("*, repository:repositories(*)").order("created_at", { ascending: false }).limit(10),
    supabase.from("reviews").select("*"),
    supabase.from("security_issues").select("*").eq("status", "open"),
    supabase.from("performance_metrics").select("*").order("recorded_at", { ascending: false }).limit(10),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("team_members").select("*, profile:profiles(*)"),
    supabase.from("profiles").select("*").eq("id", user.id).single()
  ])

  // Calculate metrics
  const metrics = {
    totalRepositories: repositories?.length ?? 0,
    pullRequestsReviewed: reviews?.length ?? 0,
    securityIssuesDetected: securityIssues?.length ?? 0,
    performanceIssuesDetected: performanceMetrics?.filter(m => (m.lighthouse_score ?? 100) < 80).length ?? 0,
    aiReviewsGenerated: reviews?.filter(r => (r.ai_suggestions && r.ai_suggestions.length > 0) || ((r.feedback || r.body)?.length ?? 0) > 20).length ?? 0,
    avgCodeQualityScore: performanceMetrics && performanceMetrics.length > 0 
      ? Math.round(performanceMetrics.reduce((acc, m) => acc + (m.test_coverage ?? 0), 0) / performanceMetrics.length)
      : 0
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent 
        metrics={metrics}
        repositories={repositories ?? []}
        pullRequests={pullRequests ?? []}
        activityLog={activityLog ?? []}
        teamMembers={teamMembers ?? []}
        profile={profile}
      />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-80 bg-muted rounded-lg" />
        <div className="h-80 bg-muted rounded-lg" />
      </div>
    </div>
  )
}
