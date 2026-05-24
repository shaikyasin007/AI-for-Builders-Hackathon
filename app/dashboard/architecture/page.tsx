"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Box, 
  GitBranch, 
  Database, 
  Server, 
  Cloud, 
  Shield, 
  Zap, 
  Layers, 
  Globe, 
  Lock,
  ArrowRight,
  CheckCircle2,
  Circle,
  Network
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const architectureLayers = [
  {
    name: "Presentation Layer",
    icon: Globe,
    color: "bg-blue-500",
    components: [
      { name: "Web Dashboard", status: "healthy" },
      { name: "API Gateway", status: "healthy" },
      { name: "CLI Tools", status: "healthy" },
    ],
  },
  {
    name: "Application Layer",
    icon: Layers,
    color: "bg-emerald-500",
    components: [
      { name: "Review Engine", status: "healthy" },
      { name: "Analysis Service", status: "healthy" },
      { name: "Notification Service", status: "warning" },
    ],
  },
  {
    name: "AI/ML Layer",
    icon: Zap,
    color: "bg-orange-500",
    components: [
      { name: "Code Understanding Model", status: "healthy" },
      { name: "Security Scanner", status: "healthy" },
      { name: "Performance Analyzer", status: "healthy" },
    ],
  },
  {
    name: "Data Layer",
    icon: Database,
    color: "bg-purple-500",
    components: [
      { name: "PostgreSQL (Primary)", status: "healthy" },
      { name: "Redis (Cache)", status: "healthy" },
      { name: "S3 (Object Storage)", status: "healthy" },
    ],
  },
]

const integrations = [
  { name: "GitHub", status: "connected", description: "Pull request integration" },
  { name: "GitLab", status: "available", description: "Merge request integration" },
  { name: "Bitbucket", status: "available", description: "Pull request integration" },
  { name: "Slack", status: "connected", description: "Notifications and alerts" },
  { name: "Jira", status: "available", description: "Issue tracking" },
  { name: "PagerDuty", status: "available", description: "Incident management" },
]

const systemMetrics = [
  { label: "API Uptime", value: "99.99%", trend: "stable" },
  { label: "Avg Response Time", value: "45ms", trend: "improving" },
  { label: "Active Connections", value: "1,247", trend: "stable" },
  { label: "Queue Depth", value: "23", trend: "stable" },
]

export default function ArchitecturePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Architecture</h1>
        <p className="text-muted-foreground">Overview of the CodeReview AI platform architecture and integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {systemMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <Badge variant="secondary" className="mt-2">
                  {metric.trend}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="layers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="layers">System Layers</TabsTrigger>
          <TabsTrigger value="flow">Data Flow</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="layers" className="space-y-6">
          <div className="grid gap-6">
            {architectureLayers.map((layer, layerIndex) => {
              const Icon = layer.icon
              return (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: layerIndex * 0.1 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", layer.color)}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{layer.name}</CardTitle>
                          <CardDescription>{layer.components.length} components</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-3">
                        {layer.components.map((component) => (
                          <div
                            key={component.name}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            {component.status === "healthy" ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{component.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{component.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Review Data Flow</CardTitle>
              <CardDescription>How code flows through the review system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 1, title: "Pull Request Created", description: "Developer opens a PR in the connected repository" },
                  { step: 2, title: "Webhook Received", description: "GitHub/GitLab sends a webhook to our API Gateway" },
                  { step: 3, title: "Code Fetched", description: "Review service fetches the code diff and context" },
                  { step: 4, title: "AI Analysis", description: "Code understanding model analyzes the changes" },
                  { step: 5, title: "Security Scan", description: "Security scanner checks for vulnerabilities" },
                  { step: 6, title: "Review Generated", description: "AI generates detailed code review comments" },
                  { step: 7, title: "Review Posted", description: "Comments are posted back to the PR" },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {item.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {index < 6 && (
                      <ArrowRight className="mt-2 h-4 w-4 text-muted-foreground rotate-90 sm:rotate-0" />
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Flow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>TLS 1.3 encryption in transit</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>AES-256 encryption at rest</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>OAuth 2.0 authentication</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <span>Role-based access control</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Cloud className="h-4 w-4 text-muted-foreground" />
                  <span>Multi-region deployment (US, EU, APAC)</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span>Auto-scaling Kubernetes clusters</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span>PostgreSQL with read replicas</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span>Edge caching with CDN</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
              <CardDescription>Connect your tools and services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {integrations.map((integration, index) => (
                  <motion.div
                    key={integration.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{integration.name}</p>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                    <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                      {integration.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
