import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SecurityContent } from "@/components/dashboard/security-content"

export default async function SecurityCenterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const [
    { data: securityIssues },
    { data: repositories }
  ] = await Promise.all([
    supabase.from("security_issues").select("*, repository:repositories(*)").order("created_at", { ascending: false }),
    supabase.from("repositories").select("*")
  ])

  return (
    <SecurityContent 
      securityIssues={securityIssues ?? []} 
      repositories={repositories ?? []}
      userId={user.id}
    />
  )
}
