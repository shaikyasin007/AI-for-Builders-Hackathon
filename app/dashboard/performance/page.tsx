import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PerformanceContent } from "@/components/dashboard/performance-content"

export default async function PerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const [
    { data: performanceMetrics },
    { data: repositories }
  ] = await Promise.all([
    supabase.from("performance_metrics").select("*, repository:repositories(*)").order("recorded_at", { ascending: false }),
    supabase.from("repositories").select("*")
  ])

  return (
    <PerformanceContent 
      performanceMetrics={performanceMetrics ?? []} 
      repositories={repositories ?? []}
    />
  )
}
