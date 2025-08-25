"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { getAttendanceStatistics } from "@/lib/action/attendance.actions"

interface DateRange {
  from: Date
  to: Date
}

interface AttendanceStatsProps {
  classes?: { _id: string; name: string }[]
  defaultClassId?: string
}

export default function AttendanceStats({ classes = [], defaultClassId }: AttendanceStatsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState(defaultClassId || "")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })
  const [stats, setStats] = useState<any>(null)
  const [dateView, setDateView] = useState<"thisMonth" | "lastMonth" | "last7Days" | "last30Days" | "custom">(
    "thisMonth",
  )

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)

      try {
        const result = await getAttendanceStatistics(
          selectedClass || undefined,
          dateRange.from.toISOString(),
          dateRange.to.toISOString(),
        )

        if (result.success) {
          setStats(result.data)
        } else {
          toast.error("Error", {
            description: result.message,
          })
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to fetch attendance statistics",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [selectedClass, dateRange, toast])

  const handleDateViewChange = (view: string) => {
    const today = new Date()

    switch (view) {
      case "thisMonth":
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        })
        break
      case "lastMonth":
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1)
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        })
        break
      case "last7Days":
        setDateRange({
          from: subDays(today, 7),
          to: today,
        })
        break
      case "last30Days":
        setDateRange({
          from: subDays(today, 30),
          to: today,
        })
        break
      default:
        return
    }

    setDateView(view as any)
  }

  const formatChartData = (data: any[]) => {
    return data.map((item) => ({
      date: format(new Date(item.date), "MMM dd"),
      Present: item.present,
      Absent: item.absent,
      Late: item.late,
      Excused: item.excused,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Class</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 space-y-1">
          <label className="text-sm font-medium">Date Range</label>
          <Select value={dateView} onValueChange={handleDateViewChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last7Days">Last 7 Days</SelectItem>
              <SelectItem value="last30Days">Last 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dateView === "custom" && (
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Custom Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              {/* <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange as any}
                  numberOfMonths={2}
                />
              </PopoverContent> */}
            </Popover>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : stats ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.total}</div>
              <p className="text-xs text-muted-foreground">
                {format(dateRange.from, "MMM d, yyyy")} - {format(dateRange.to, "MMM d, yyyy")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.present}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overall.total > 0
                  ? `${Math.round((stats.overall.present / stats.overall.total) * 100)}% of total`
                  : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overall.absent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overall.total > 0
                  ? `${Math.round((stats.overall.absent / stats.overall.total) * 100)}% of total`
                  : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.overall.total > 0 ? `${Math.round(stats.overall.attendanceRate)}%` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Overall attendance rate</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Daily Attendance</CardTitle>
              <CardDescription>Attendance records by day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats.daily.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatChartData(stats.daily)}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Present" stackId="a" fill="#4ade80" />
                      <Bar dataKey="Absent" stackId="a" fill="#f87171" />
                      <Bar dataKey="Late" stackId="a" fill="#fbbf24" />
                      <Bar dataKey="Excused" stackId="a" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground">No attendance data available for this period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {stats.class && (
            <Card className="md:col-span-2 lg:col-span-4">
              <CardHeader>
                <CardTitle>{stats.class.details.name}</CardTitle>
                <CardDescription>
                  Class Teacher:{" "}
                  {stats.class.details.classTeacher
                    ? `${stats.class.details.classTeacher.firstName} ${stats.class.details.classTeacher.lastName}`
                    : "Not assigned"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Total Students</div>
                    <div className="mt-1 text-2xl font-bold">{stats.class.studentCount}</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Attendance Rate</div>
                    <div className="mt-1 text-2xl font-bold">{Math.round(stats.class.attendanceRate)}%</div>
                  </div>
                  <div className="rounded-lg border p-3">
                    <div className="text-sm font-medium text-muted-foreground">Days in Period</div>
                    <div className="mt-1 text-2xl font-bold">{stats.daily.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>There is no attendance data for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground">Try selecting a different date range or class.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
