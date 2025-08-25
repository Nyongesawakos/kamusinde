"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import {
  getStudentAttendance,
  getStudentAttendanceSummary,
} from "@/lib/action/attendance.actions";

interface AttendanceTabProps {
  studentId: string;
}

export default function AttendanceTab({ studentId }: AttendanceTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<Record<string, any[]>>({});
  const [stats, setStats] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch attendance records
        const attendanceResult = await getStudentAttendance(studentId);
        if (attendanceResult.success) {
          setAttendanceRecords(attendanceResult.data.records || []);
          setGroupedByDate(attendanceResult.data.groupedByDate || {});
          setStats(attendanceResult.data.stats || null);
        } else {
          setError(attendanceResult.message);
        }

        // Fetch attendance summary
        const summaryResult = await getStudentAttendanceSummary(studentId);
        if (summaryResult.success) {
          setSummary(summaryResult.data);
        } else {
          setError(summaryResult.message);
        }
      } catch (err) {
        setError("An error occurred while fetching attendance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Absent
          </Badge>
        );
      case "late":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Late
          </Badge>
        );
      case "excused":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Excused
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const hasAttendance = attendanceRecords.length > 0;
  const dates = Object.keys(groupedByDate).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Attendance Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Attendance Summary</CardTitle>
          <CardDescription>Current month attendance statistics</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAttendance ? (
            <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
              <Calendar className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                No attendance records found
              </p>
              <p className="text-xs text-muted-foreground">
                Attendance records will appear here once they are recorded.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Attendance Rate
                  </div>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold">
                    {summary?.currentMonth?.rate || 0}%
                  </div>
                </div>
                <Progress
                  value={summary?.currentMonth?.rate || 0}
                  className="mt-2 h-2"
                  indicatorClassName={
                    summary?.currentMonth?.rate &&
                    summary.currentMonth.rate >= 90
                      ? "bg-green-500"
                      : summary?.currentMonth?.rate &&
                        summary.currentMonth.rate >= 75
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }
                />
                {summary?.trend && (
                  <div className="mt-2 flex items-center text-xs">
                    {summary.trend === "improving" ? (
                      <span className="text-green-600">
                        Improving from last month
                      </span>
                    ) : summary.trend === "declining" ? (
                      <span className="text-red-600">
                        Declining from last month
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Stable from last month
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    This Month
                  </div>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  <div className="text-2xl font-bold">
                    {summary?.currentMonth?.total || 0}
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-green-600 font-medium">
                        {summary?.currentMonth?.present || 0}
                      </span>{" "}
                      <span className="text-muted-foreground">Present</span>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">
                        {summary?.currentMonth?.absent || 0}
                      </span>{" "}
                      <span className="text-muted-foreground">Absent</span>
                    </div>
                    <div>
                      <span className="text-amber-600 font-medium">
                        {summary?.currentMonth?.late || 0}
                      </span>{" "}
                      <span className="text-muted-foreground">Late</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Recent Absences
                  </div>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  <div className="text-2xl font-bold">
                    {summary?.recentAbsences?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    In the last 7 days
                  </div>
                  {summary?.recentAbsences?.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="text-red-600">
                        Last absence:{" "}
                        {new Date(
                          summary.recentAbsences[0].date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Records */}
      {hasAttendance ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Records</CardTitle>
            <CardDescription>Daily attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="byDate" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="byDate">By Date</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="byDate" className="space-y-4">
                {dates.map((date) => (
                  <div key={date} className="rounded-lg border">
                    <div className="border-b bg-muted/50 px-4 py-2">
                      <h4 className="font-medium">{formatDate(date)}</h4>
                    </div>
                    <div className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Class/Course
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Marked By
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedByDate[date].map((record, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50 dark:bg-gray-800/50"
                              }
                            >
                              <td className="px-4 py-2 text-sm">
                                {record.class?.name || "Unknown Class"}
                                {record.course && (
                                  <div className="text-xs text-muted-foreground">
                                    {record.course.name || "Unknown Course"}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {record.markedBy?.name || "Unknown"}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {record.remarks || (
                                  <span className="text-muted-foreground">
                                    No remarks
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="stats">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 text-lg font-medium">
                    Attendance Statistics
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Present:</span>
                        <span className="font-medium">
                          {stats?.present || 0}
                        </span>
                      </div>
                      <Progress
                        value={(stats?.present / stats?.total) * 100 || 0}
                        className="h-2 bg-gray-100"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Absent:</span>
                        <span className="font-medium">
                          {stats?.absent || 0}
                        </span>
                      </div>
                      <Progress
                        value={(stats?.absent / stats?.total) * 100 || 0}
                        className="h-2 bg-gray-100"
                        indicatorClassName="bg-red-500"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Late:</span>
                        <span className="font-medium">{stats?.late || 0}</span>
                      </div>
                      <Progress
                        value={(stats?.late / stats?.total) * 100 || 0}
                        className="h-2 bg-gray-100"
                        indicatorClassName="bg-amber-500"
                      />

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Excused:</span>
                        <span className="font-medium">
                          {stats?.excused || 0}
                        </span>
                      </div>
                      <Progress
                        value={(stats?.excused / stats?.total) * 100 || 0}
                        className="h-2 bg-gray-100"
                        indicatorClassName="bg-blue-500"
                      />
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                      <div className="mb-2 text-sm font-medium">
                        Overall Attendance Rate
                      </div>
                      <div className="text-3xl font-bold">
                        {stats?.attendanceRate || 0}%
                      </div>
                      <Progress
                        value={stats?.attendanceRate || 0}
                        className="mt-2 h-3 bg-gray-200"
                        indicatorClassName={
                          stats?.attendanceRate >= 90
                            ? "bg-green-500"
                            : stats?.attendanceRate >= 75
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }
                      />
                      <div className="mt-4 text-sm text-muted-foreground">
                        Based on {stats?.total || 0} total attendance records
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Records</CardTitle>
            <CardDescription>Daily attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-gray-800">
              <Clock className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-3 text-lg font-medium">
                No Attendance Records
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This student doesn't have any attendance records yet. Records
                will appear here once attendance is marked.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
