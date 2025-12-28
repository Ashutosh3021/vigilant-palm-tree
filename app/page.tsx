"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { getUserPreferences } from "@/lib/storage"

export default function HomePage() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const prefs = getUserPreferences()
    if (!prefs || !prefs.hasCompletedOnboarding) {
      setShowOnboarding(true)
    } else {
      router.push("/dashboard")
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (showOnboarding) {
    return <OnboardingWizard onComplete={() => router.push("/dashboard")} />
  }

  return null
}
