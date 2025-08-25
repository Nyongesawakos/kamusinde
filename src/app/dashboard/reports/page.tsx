// src/app/dashboard/reports/page.tsx
import { isFeatureEnabled } from "@/lib/feature-flags"
import MaintenancePage from "@/components/dashboard/MaintenancePage"

export default function ReportsPage() {
  // Check if the feature is enabled
  if (!isFeatureEnabled("REPORTS")) {
    return <MaintenancePage featureName="Reports" />
  }

  // This code will only run if the feature is enabled
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>

      {/* Reports implementation would go here */}
    </div>
  )
}
