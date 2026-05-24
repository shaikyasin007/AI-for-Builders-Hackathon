import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?tab=integrations&error=no_code", request.url)
    )
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      throw new Error("GitHub OAuth credentials not configured")
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      throw new Error(tokenData.error_description || "Failed to get access token")
    }

    const accessToken = tokenData.access_token

    // Get GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Accept": "application/vnd.github.v3+json"
      }
    })

    const githubUser = await userResponse.json()

    // Save integration to database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      )
    }

    const { error } = await supabase
      .from("integrations")
      .upsert({
        user_id: user.id,
        provider: "GitHub",
        status: "connected",
        access_token: accessToken,
        provider_user_id: githubUser.login,
        connected_at: new Date().toISOString(),
        metadata: {
          name: githubUser.name,
          avatar_url: githubUser.avatar_url,
          github_id: githubUser.id
        }
      }, {
        onConflict: "user_id,provider"
      })

    if (error) {
      throw error
    }

    return NextResponse.redirect(
      new URL("/dashboard/settings?tab=integrations&success=connected", request.url)
    )
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(
      new URL(`/dashboard/settings?tab=integrations&error=${error instanceof Error ? error.message : "unknown"}`, request.url)
    )
  }
}
