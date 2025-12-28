"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Target, ChevronRight, ChevronLeft } from "lucide-react"
import { saveUserPreferences, type UserPreferences } from "@/lib/storage"

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<UserPreferences>>({
    name: "",
    goal: "personal",
    workingHours: { start: "09:00", end: "17:00" },
    dayResetTime: "04:00",
  })

  const totalSteps = 4

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleComplete = () => {
    const prefs: UserPreferences = {
      name: formData.name || "User",
      goal: formData.goal || "personal",
      workingHours: formData.workingHours || { start: "09:00", end: "17:00" },
      dayResetTime: formData.dayResetTime || "04:00",
      hasCompletedOnboarding: true,
    }
    saveUserPreferences(prefs)
    onComplete()
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.name.length > 0
      case 2:
        return formData.goal && formData.goal.length > 0
      case 3:
        return formData.workingHours?.start && formData.workingHours?.end
      case 4:
        return formData.dayResetTime && formData.dayResetTime.length > 0
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Target className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">Welcome to MomentumTracker</h1>
            <p className="text-muted-foreground">Let's personalize your experience</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round((step / totalSteps) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Card with Steps */}
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "What should we call you?"}
                {step === 2 && "What's your main goal?"}
                {step === 3 && "When do you typically work?"}
                {step === 4 && "When should we reset your daily tasks?"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Let's start with your name so we can personalize your experience."}
                {step === 2 && "This helps us tailor the experience to your needs."}
                {step === 3 && "We'll help you stay focused during your productive hours."}
                {step === 4 && "Choose when your new day begins - perfect for night owls!"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Name */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Goal */}
              {step === 2 && (
                <div className="space-y-4">
                  <RadioGroup
                    value={formData.goal}
                    onValueChange={(value) => setFormData({ ...formData, goal: value })}
                  >
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="personal" id="personal" />
                      <Label htmlFor="personal" className="flex-1 cursor-pointer">
                        <div className="font-medium">Personal Productivity</div>
                        <div className="text-sm text-muted-foreground">Track personal tasks and habits</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="flex-1 cursor-pointer">
                        <div className="font-medium">Professional Work</div>
                        <div className="text-sm text-muted-foreground">Manage work tasks and projects</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="flex-1 cursor-pointer">
                        <div className="font-medium">Both</div>
                        <div className="text-sm text-muted-foreground">Balance work and personal life</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Step 3: Working Hours */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-time">Start Time</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={formData.workingHours?.start}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingHours: { ...formData.workingHours!, start: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-time">End Time</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={formData.workingHours?.end}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            workingHours: { ...formData.workingHours!, end: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll use this to show you relevant insights during your peak hours.
                  </p>
                </div>
              )}

              {/* Step 4: Day Reset Time */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-time">Daily Reset Time</Label>
                    <Input
                      id="reset-time"
                      type="time"
                      value={formData.dayResetTime}
                      onChange={(e) => setFormData({ ...formData, dayResetTime: e.target.value })}
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your tasks will reset at <strong>{formData.dayResetTime}</strong>. This is perfect if you work
                      late nights or have an unconventional schedule.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext} disabled={!canProceed()}>
                  {step === totalSteps ? "Get Started" : "Next"}
                  {step < totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
