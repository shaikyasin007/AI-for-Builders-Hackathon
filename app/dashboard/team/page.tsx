import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { TeamContent } from "@/components/dashboard/team-content"

export default async function TeamAnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const [
    { data: teamMembers },
    { data: activityLog }
  ] = await Promise.all([
    supabase.from("team_members").select("*, profile:profiles(*)"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(50)
  ])

  return (
    <TeamContent 
      teamMembers={teamMembers ?? []} 
      activityLog={activityLog ?? []}
      userId={user.id}
    />
  )
}
