import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RepositoriesContent } from "@/components/dashboard/repositories-content"

export default async function RepositoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const { data: repositories } = await supabase
    .from("repositories")
    .select("*")
    .order("created_at", { ascending: false })

  return <RepositoriesContent repositories={repositories ?? []} userId={user.id} />
}
