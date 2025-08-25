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
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BookOpen,
  GraduationCap,
  LineChart,
} from "lucide-react";
import {
  getStudentGrades,
  getStudentAcademicSummary,
} from "@/lib/action/grade.actions";

interface AcademicTabProps {
  studentId: string;
}

export default function AcademicTab({ studentId }: AcademicTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [groupedGrades, setGroupedGrades] = useState<
    Record<string, Record<string, any[]>>
  >({});
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch grades
        const gradesResult = await getStudentGrades(studentId);
        if (gradesResult.success) {
          setGrades(gradesResult.data.grades || []);
          setGroupedGrades(gradesResult.data.groupedGrades || {});
        } else {
          setError(gradesResult.message);
        }

        // Fetch academic summary
        const summaryResult = await getStudentAcademicSummary(studentId);
        if (summaryResult.success) {
          setSummary(summaryResult.data);
        } else {
          setError(summaryResult.message);
        }
      } catch (err) {
        setError("An error occurred while fetching academic data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Helper function to get grade letter from percentage
  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  // Helper function to get color class based on grade
  const getGradeColorClass = (percentage: number): string => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 70) return "text-emerald-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 50) return "text-amber-600";
    return "text-red-600";
  };

  // Helper function to get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRight className="h-4 w-4 text-gray-500" />;
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

  const hasGrades = grades.length > 0;
  const academicYears = Object.keys(groupedGrades).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Academic Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Academic Summary</CardTitle>
          <CardDescription>
            {summary?.currentAcademicYear && summary?.currentTerm
              ? `Current performance for ${summary.currentAcademicYear}, ${summary.currentTerm}`
              : "No current academic records"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasGrades ? (
            <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
              <GraduationCap className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                No academic records found
              </p>
              <p className="text-xs text-muted-foreground">
                Academic records will appear here once grades are entered.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Average Score
                  </div>
                  <LineChart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold">
                    {summary?.averageScore || 0}%
                  </div>
                  <div className="ml-1 text-sm font-medium text-muted-foreground">
                    {summary?.averageScore
                      ? getGradeLetter(summary.averageScore)
                      : "N/A"}
                  </div>
                </div>
                <Progress
                  value={summary?.averageScore || 0}
                  className="mt-2 h-2"
                  indicatorClassName={
                    summary?.averageScore && summary.averageScore >= 70
                      ? "bg-green-500"
                      : summary?.averageScore && summary.averageScore >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }
                />
                {summary?.performanceTrend && (
                  <div className="mt-2 flex items-center text-xs">
                    {getTrendIcon(summary.performanceTrend)}
                    <span className="ml-1 capitalize">
                      {summary.performanceTrend} trend
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Courses
                  </div>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  <div className="text-2xl font-bold">
                    {summary?.totalCourses || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Enrolled courses
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Current Term
                  </div>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  <div className="text-xl font-bold">
                    {summary?.currentTerm || "N/A"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {summary?.currentAcademicYear || ""}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Academic Records */}
      {hasGrades ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Records</CardTitle>
            <CardDescription>
              Grades and performance by academic year and term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue={academicYears[0] || "no-data"}
              className="w-full"
            >
              <TabsList className="mb-4 w-full justify-start overflow-auto">
                {academicYears.map((year) => (
                  <TabsTrigger
                    key={year}
                    value={year}
                    className="min-w-[120px]"
                  >
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>

              {academicYears.map((year) => (
                <TabsContent key={year} value={year} className="space-y-4">
                  {Object.keys(groupedGrades[year])
                    .sort()
                    .reverse()
                    .map((term) => (
                      <div
                        key={`${year}-${term}`}
                        className="rounded-lg border"
                      >
                        <div className="border-b bg-muted/50 px-4 py-2">
                          <h4 className="font-medium">{term}</h4>
                        </div>
                        <div className="p-0">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Course
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Exam Type
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Score
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Grade
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupedGrades[year][term].map((grade, index) => {
                                const percentage =
                                  (grade.score / grade.maxScore) * 100;
                                const gradeLetter = getGradeLetter(percentage);
                                const colorClass =
                                  getGradeColorClass(percentage);

                                return (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50 dark:bg-gray-800/50"
                                    }
                                  >
                                    <td className="px-4 py-2 text-sm">
                                      {grade.course?.name || "Unknown Course"}
                                      <div className="text-xs text-muted-foreground">
                                        {grade.course?.courseCode || ""}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {grade.examType}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {grade.score}/{grade.maxScore}
                                      <div className="text-xs text-muted-foreground">
                                        {percentage.toFixed(1)}%
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <Badge
                                        variant="outline"
                                        className={`font-bold ${colorClass} border-current`}
                                      >
                                        {gradeLetter}
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Academic Records</CardTitle>
            <CardDescription>
              Grades and performance by academic year and term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-gray-800">
              <BookOpen className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-3 text-lg font-medium">No Academic Records</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This student doesn't have any academic records yet. Records will
                appear here once grades are entered.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
