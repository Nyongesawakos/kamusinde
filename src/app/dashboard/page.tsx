// src/app/dashboard/page.tsx
import { getServerSession } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRole } from "@/types" // Import from types file instead of database model
import { isFeatureEnabled } from "@/lib/feature-flags"
import MaintenancePage from "@/components/dashboard/MaintenancePage"
import { BarChart3, BookOpen, Calendar, GraduationCap, LayoutDashboard, TrendingUp, Users } from "lucide-react"
import { connectToDatabase } from "@/lib/mongoose"
import StudentModel from "@/database/models/Student.model"
import UserModel from "@/database/models/User.model"
import TeacherModel from "@/database/models/Teacher.model"
import RecentActivityList from "@/components/dashboard/RecentActivityList"
import StatsCard from "@/components/dashboard/StatsCard"
import UpcomingEventsList from "@/components/dashboard/UpcomingEventsList"

async function getStats() {
  try {
    await connectToDatabase()

    const totalStudents = await StudentModel.countDocuments()
    const totalTeachers = await TeacherModel.countDocuments()
    const totalUsers = await UserModel.countDocuments()

    // You would add more stats as needed

    return {
      totalStudents,
      totalTeachers,
      totalUsers,
      // Add more stats here
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalStudents: 0,
      totalTeachers: 0,
      totalUsers: 0,
    }
  }
}

export default async function DashboardPage() {
  const session = await getServerSession()
  const stats = await getStats()

  const userRole = session?.user?.role as UserRole

  // Define what stats to show based on user role
  const isAdmin = userRole === UserRole.ADMIN
  const isTeacher = userRole === UserRole.TEACHER
  const isStaff = userRole === UserRole.STAFF

  // Check feature flags
  const isAnalyticsEnabled = isFeatureEnabled("REPORTS")
  const isCalendarEnabled = isFeatureEnabled("CALENDAR")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}!</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          {(isAdmin || isStaff) && (
            <TabsTrigger value="analytics" className="flex items-center gap-2" disabled={!isAnalyticsEnabled}>
              <BarChart3 className="h-4 w-4" />
              Analytics
              {!isAnalyticsEnabled && (
                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="calendar" className="flex items-center gap-2" disabled={!isCalendarEnabled}>
            <Calendar className="h-4 w-4" />
            Calendar
            {!isCalendarEnabled && (
              <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">Soon</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Students"
              value={stats.totalStudents.toString()}
              description="Active students in the system"
              icon={<Users className="h-5 w-5 text-blue-600" />}
              trend="up"
              trendValue="12%"
            />

            <StatsCard
              title="Total Teachers"
              value={stats.totalTeachers.toString()}
              description="Active teaching staff"
              icon={<GraduationCap className="h-5 w-5 text-green-600" />}
              trend="up"
              trendValue="4%"
            />

            <StatsCard
              title="Courses"
              value="24"
              description="Active courses this term"
              icon={<BookOpen className="h-5 w-5 text-purple-600" />}
              trend="same"
              trendValue="0%"
            />

            <StatsCard
              title="Attendance Rate"
              value="94%"
              description="Average attendance this week"
              icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
              trend="up"
              trendValue="2%"
            />
          </div>

          {/* Recent Activity and Upcoming Events */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivityList />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
                <CardDescription>Events in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <UpcomingEventsList />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          {isAnalyticsEnabled ? (
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>School performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analytics dashboard will be implemented here with charts and detailed statistics.
                </p>
              </CardContent>
            </Card>
          ) : (
            <MaintenancePage featureName="Analytics" />
          )}
        </TabsContent>

        <TabsContent value="calendar">
          {isCalendarEnabled ? (
            <Card>
              <CardHeader>
                <CardTitle>School Calendar</CardTitle>
                <CardDescription>Upcoming events and schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Calendar view will be implemented here with events, class schedules, and exams.
                </p>
              </CardContent>
            </Card>
          ) : (
            <MaintenancePage featureName="Calendar" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
