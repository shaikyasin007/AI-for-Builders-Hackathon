import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("integrations")
      .delete()
      .eq("user_id", user.id)
      .eq("provider", "GitHub")

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("GitHub disconnect error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to disconnect" },
      { status: 500 }
    )
  }
}
