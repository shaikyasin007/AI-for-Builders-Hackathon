"use client"

import { useState } from "react"
import { Github, GitlabIcon, Slack, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface Integration {
  id: string
  provider: string
  status: "connected" | "disconnected"
  connected_at?: string
  provider_user_id?: string
}

const INTEGRATIONS = [
  {
    name: "GitHub",
    icon: Github,
    description: "Connect to manage repositories and code reviews",
    color: "bg-black"
  },
  {
    name: "GitLab",
    icon: GitlabIcon,
    description: "Sync with GitLab projects",
    color: "bg-orange-500"
  },
  {
    name: "Slack",
    icon: Slack,
    description: "Get notifications in Slack",
    color: "bg-purple-600"
  },
  {
    name: "Bitbucket",
    icon: Radio,
    description: "Connect Bitbucket repositories",
    color: "bg-blue-600"
  },
  {
    name: "Jira",
    icon: Radio,
    description: "Integrate with Jira for issue tracking",
    color: "bg-blue-700"
  }
]

export function IntegrationsContent({ integrations }: { integrations: Integration[] }) {
  const [connecting, setConnecting] = useState<string | null>(null)

  const getIntegrationStatus = (provider: string) => {
    return integrations.find(
      int => int.provider.toLowerCase() === provider.toLowerCase()
    )
  }

  const handleConnect = async (provider: string) => {
    setConnecting(provider)

    if (provider === "GitHub") {
      // Generate OAuth URL
      const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
      if (!clientId) {
        alert("GitHub integration not configured. Please set NEXT_PUBLIC_GITHUB_CLIENT_ID environment variable.")
        setConnecting(null)
        return
      }

      const redirectUri = `${window.location.origin}/api/integrations/github/callback`
      const scope = "repo read:user"

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scope
      })

      const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`
      console.log("[v0] Redirecting to GitHub OAuth:", authUrl)
      window.location.href = authUrl
    } else {
      alert(`${provider} integration coming soon!`)
      setConnecting(null)
    }
  }

  const handleDisconnect = async (provider: string) => {
    setConnecting(provider)
    try {
      const response = await fetch(`/api/integrations/${provider.toLowerCase()}/disconnect`, {
        method: "POST"
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert("Failed to disconnect integration")
      }
    } catch (error) {
      alert("Error disconnecting integration")
    } finally {
      setConnecting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Connected Services</h3>
        <p className="text-sm text-muted-foreground">Manage your connected Git providers and services</p>
      </div>

      <div className="space-y-4">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon
          const status = getIntegrationStatus(integration.name)
          const isConnected = status?.status === "connected"

          return (
            <Card key={integration.name}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg text-white ${integration.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{integration.name}</h3>
                      <Badge variant={isConnected ? "default" : "secondary"}>
                        {isConnected ? "connected" : "disconnected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    {isConnected && status?.provider_user_id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {status.provider_user_id}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  {isConnected ? (
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(integration.name)}
                      disabled={connecting === integration.name}
                    >
                      {connecting === integration.name ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleConnect(integration.name)}
                      disabled={connecting === integration.name}
                    >
                      {connecting === integration.name ? "Connecting..." : "Connect"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Separator />

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Need help?</CardTitle>
          <CardDescription>
            Learn how to connect and manage your integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm">
            View documentation
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
