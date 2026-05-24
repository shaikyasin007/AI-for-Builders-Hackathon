import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PullRequestsContent } from "@/components/dashboard/pull-requests-content"

export default async function PullRequestsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const { data: pullRequests } = await supabase
    .from("pull_requests")
    .select("*, repository:repositories(*)")
    .order("created_at", { ascending: false })

  const { data: repositories } = await supabase
    .from("repositories")
    .select("id, name")

  return (
    <PullRequestsContent 
      pullRequests={pullRequests ?? []} 
      repositories={repositories ?? []}
      userId={user.id} 
    />
  )
}
