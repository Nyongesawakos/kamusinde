// src/app/dashboard/calendar/page.tsx
import { isFeatureEnabled } from "@/lib/feature-flags"
import MaintenancePage from "@/components/dashboard/MaintenancePage"

export default function CalendarPage() {
  // Check if the feature is enabled
  if (!isFeatureEnabled("CALENDAR")) {
    return <MaintenancePage featureName="Calendar" />
  }

  // This code will only run if the feature is enabled
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">School Calendar</h2>
      </div>

      {/* Calendar implementation would go here */}
    </div>
  )
}
