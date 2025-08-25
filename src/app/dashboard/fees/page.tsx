// src/app/dashboard/fees/page.tsx
import { isFeatureEnabled } from "@/lib/feature-flags"
import MaintenancePage from "@/components/dashboard/MaintenancePage"

export default function FeesPage() {
  // Check if the feature is enabled
  if (!isFeatureEnabled("FEES_MANAGEMENT")) {
    return <MaintenancePage featureName="Fee Management" />
  }

  // This code will only run if the feature is enabled
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Fee Management</h2>
      </div>

      {/* Fee management implementation would go here */}
    </div>
  )
}
