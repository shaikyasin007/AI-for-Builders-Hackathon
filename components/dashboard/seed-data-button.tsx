"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Database } from "lucide-react"

export function SeedDataButton() {
  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeedData = async () => {
    setIsSeeding(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please log in first")
        setIsSeeding(false)
        return
      }

      const response = await fetch("/api/seed-existing", {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to seed data")
      }

      const data = await response.json()
      toast.success("Data seeded successfully!", {
        description: data.message
      })

      // Refresh the page to show new data
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      console.error("Seed error:", error)
      toast.error("Failed to seed data", {
        description: error instanceof Error ? error.message : "Unknown error"
      })
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <Button
      onClick={handleSeedData}
      disabled={isSeeding}
      variant="outline"
      className="gap-2"
    >
      {isSeeding ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Database className="w-4 h-4" />
      )}
      {isSeeding ? "Seeding..." : "Seed Demo Data"}
    </Button>
  )
}
