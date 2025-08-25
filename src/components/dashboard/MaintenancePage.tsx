// src/components/dashboard/MaintenancePage.tsx
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MaintenancePage({ featureName }: { featureName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
      <h1 className="text-2xl font-bold mb-2">Feature Coming Soon</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        The {featureName} feature is currently under development and will be available soon.
      </p>
      <p className="text-sm text-gray-500 mb-6">We're working hard to bring you the best experience possible.</p>
      <Button asChild>
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
