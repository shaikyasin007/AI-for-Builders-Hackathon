"use client"

import { MessageSquare, Plus, Star, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Review {
  id: string
  body?: string | null
  feedback?: string | null
  status?: string
  ai_suggestions?: any[] | null
  created_at: string
  pull_request?: {
    id: string
    title: string
    status: string
    repository?: {
      id: string
      name: string
    }
  }
}

interface PullRequest {
  id: string
  title: string
  status: string
  created_at: string
  repository?: {
    id: string
    name: string
  }
}

export function ReviewsContent({
  reviews,
  pullRequests,
}: {
  reviews: Review[]
  pullRequests: PullRequest[]
}) {
  const getText = (r: Review) => r.feedback || r.body || ''
  const reviewsWithAI = reviews.filter(
    (r) => (r.ai_suggestions && r.ai_suggestions.length > 0) || getText(r).length > 20,
  )
  const averageSuggestions = reviews.length > 0
    ? (reviewsWithAI.reduce((sum, r) => sum + (r.ai_suggestions?.length || 0), 0) / reviews.length).toFixed(1)
    : "0.0"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Reviews</h1>
          <p className="text-muted-foreground">View all AI code reviews and feedback</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{reviews.length}</div>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{averageSuggestions}</div>
              <div className="flex gap-1">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Avg AI Suggestions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pullRequests.length}</div>
            <p className="text-xs text-muted-foreground">Pull Requests</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Select defaultValue="all">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="needs-work">Needs Work</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No reviews yet</h3>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Submit a pull request to get started with AI code reviews
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {review.pull_request?.repository?.name || "Repository"}
                      </h3>
                      <Badge variant="outline">{review.status || "pending"}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">{review.pull_request?.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{getText(review) || "No review comments"}</p>
                    {review.ai_suggestions && review.ai_suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">AI Suggestions:</p>
                        {review.ai_suggestions.map((suggestion: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-muted rounded">
                            <span className="font-medium">{suggestion.type}:</span>{' '}
                            {suggestion.message || suggestion.content}
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
