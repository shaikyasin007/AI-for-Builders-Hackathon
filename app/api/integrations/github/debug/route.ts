import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
  const redirectUri = `${request.nextUrl.origin}/api/integrations/github/callback`
  const scope = 'repo user'
  
  const params = new URLSearchParams({
    client_id: clientId || 'NOT_SET',
    redirect_uri: redirectUri,
    scope: scope,
    allow_signup: 'true'
  })

  const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`

  return NextResponse.json({
    clientId,
    redirectUri,
    scope,
    authUrl,
    instructions: [
      '1. Copy the "redirectUri" value above',
      '2. Go to https://github.com/settings/developers',
      '3. Click "OAuth Apps" → Your App → Edit',
      '4. Set "Authorization callback URL" to the redirectUri value',
      '5. Save and try connecting again'
    ]
  })
}
