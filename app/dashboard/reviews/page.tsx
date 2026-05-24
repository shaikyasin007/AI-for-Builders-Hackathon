import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ReviewsContent } from "@/components/dashboard/reviews-content"

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  const [
    { data: reviews },
    { data: pullRequests }
  ] = await Promise.all([
    supabase.from("reviews").select("*, pull_request:pull_requests(*, repository:repositories(*))").order("created_at", { ascending: false }),
    supabase.from("pull_requests").select("*, repository:repositories(*)").order("created_at", { ascending: false }).limit(10)
  ])

  return (
    <ReviewsContent 
      reviews={reviews ?? []} 
      pullRequests={pullRequests ?? []}
    />
  )
}
