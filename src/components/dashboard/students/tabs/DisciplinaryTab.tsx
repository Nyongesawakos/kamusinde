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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileWarning,
  ShieldAlert,
} from "lucide-react";
import {
  getStudentDisciplinaryRecords,
  getStudentDisciplinarySummary,
} from "@/lib/action/disciplinary.actions";

interface DisciplinaryTabProps {
  studentId: string;
}

export default function DisciplinaryTab({ studentId }: DisciplinaryTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [pendingRecords, setPendingRecords] = useState<any[]>([]);
  const [inProgressRecords, setInProgressRecords] = useState<any[]>([]);
  const [resolvedRecords, setResolvedRecords] = useState<any[]>([]);
  const [groupedByYear, setGroupedByYear] = useState<Record<string, any[]>>({});
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch disciplinary records
        const recordsResult = await getStudentDisciplinaryRecords(studentId);
        if (recordsResult.success) {
          setRecords(recordsResult.data.records || []);
          setPendingRecords(recordsResult.data.pendingRecords || []);
          setInProgressRecords(recordsResult.data.inProgressRecords || []);
          setResolvedRecords(recordsResult.data.resolvedRecords || []);
          setGroupedByYear(recordsResult.data.groupedByYear || {});
        } else {
          setError(recordsResult.message);
        }

        // Fetch disciplinary summary
        const summaryResult = await getStudentDisciplinarySummary(studentId);
        if (summaryResult.success) {
          setSummary(summaryResult.data);
        } else {
          setError(summaryResult.message);
        }
      } catch (err) {
        setError("An error occurred while fetching disciplinary data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Pending
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get behavior status badge
  const getBehaviorStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Good Standing
          </Badge>
        );
      case "improved":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Improved
          </Badge>
        );
      case "attention":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertCircle className="mr-1 h-3 w-3" /> Needs Attention
          </Badge>
        );
      case "concerning":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            <ShieldAlert className="mr-1 h-3 w-3" /> Concerning
          </Badge>
        );
      case "serious":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <ShieldAlert className="mr-1 h-3 w-3" /> Serious Issues
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

  const hasRecords = records.length > 0;
  const academicYears = Object.keys(groupedByYear).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Disciplinary Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Disciplinary Summary</CardTitle>
          <CardDescription>
            Overview of student's disciplinary status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasRecords ? (
            <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
              <p className="mt-2 text-sm font-medium">
                No disciplinary records found
              </p>
              <p className="text-xs text-muted-foreground">
                This student has a clean disciplinary record.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Behavior Status
                  </div>
                  <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  {getBehaviorStatusBadge(summary?.behaviorStatus || "good")}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Based on {summary?.totalRecords || 0} total records and{" "}
                  {summary?.activeRecords || 0} active cases
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Current Academic Year
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  <div className="text-2xl font-bold">
                    {summary?.currentYearRecords || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Disciplinary incidents this year
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                  <div>
                    <span className="font-medium text-amber-600">
                      {pendingRecords.length}
                    </span>{" "}
                    <span className="text-muted-foreground">Pending</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">
                      {inProgressRecords.length}
                    </span>{" "}
                    <span className="text-muted-foreground">In Progress</span>
                  </div>
                  <div>
                    <span className="font-medium text-green-600">
                      {resolvedRecords.length}
                    </span>{" "}
                    <span className="text-muted-foreground">Resolved</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Most Recent
                  </div>
                  <FileWarning className="h-4 w-4 text-muted-foreground" />
                </div>
                {summary?.mostRecentRecord ? (
                  <div className="mt-1">
                    <div className="text-sm font-medium">
                      {summary.mostRecentRecord.incidentType}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(summary.mostRecentRecord.date)}
                    </div>
                    <div className="mt-1 text-xs">
                      {getStatusBadge(summary.mostRecentRecord.status)}
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm">No recent incidents</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Disciplinary Records */}
      {hasRecords ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disciplinary Records</CardTitle>
            <CardDescription>
              History of disciplinary incidents and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Records</TabsTrigger>
                <TabsTrigger value="active">Active Cases</TabsTrigger>
                <TabsTrigger value="byYear">By Academic Year</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Incident Type
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Action
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-sm font-medium">
                          Reported By
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50 dark:bg-gray-800/50"
                          }
                        >
                          <td className="px-4 py-2 text-sm">
                            {formatDate(record.date)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {record.incidentType}
                          </td>
                          <td className="px-4 py-2 text-sm">{record.action}</td>
                          <td className="px-4 py-2 text-sm">
                            {getStatusBadge(record.status)}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {record.reportedBy?.name || "Unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {pendingRecords.length > 0 || inProgressRecords.length > 0 ? (
                  <>
                    {pendingRecords.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium">
                          Pending Cases
                        </h3>
                        <div className="rounded-lg border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Date
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Incident Type
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Action
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Description
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {pendingRecords.map((record, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-white"
                                      : "bg-gray-50 dark:bg-gray-800/50"
                                  }
                                >
                                  <td className="px-4 py-2 text-sm">
                                    {formatDate(record.date)}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.incidentType}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.action}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.description.length > 50
                                      ? `${record.description.substring(
                                          0,
                                          50
                                        )}...`
                                      : record.description}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                    >
                                      Update Status
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {inProgressRecords.length > 0 && (
                      <div className="mt-4">
                        <h3 className="mb-2 text-sm font-medium">
                          In Progress Cases
                        </h3>
                        <div className="rounded-lg border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Date
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Incident Type
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Action
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Description
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {inProgressRecords.map((record, index) => (
                                <tr
                                  key={index}
                                  className={
                                    index % 2 === 0
                                      ? "bg-white"
                                      : "bg-gray-50 dark:bg-gray-800/50"
                                  }
                                >
                                  <td className="px-4 py-2 text-sm">
                                    {formatDate(record.date)}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.incidentType}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.action}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.description.length > 50
                                      ? `${record.description.substring(
                                          0,
                                          50
                                        )}...`
                                      : record.description}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs"
                                    >
                                      Resolve Case
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
                    <p className="mt-2 text-sm font-medium">
                      No active disciplinary cases
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="byYear" className="space-y-4">
                {academicYears.map((year) => (
                  <div key={year} className="rounded-lg border">
                    <div className="border-b bg-muted/50 px-4 py-2">
                      <h4 className="font-medium">{year}</h4>
                    </div>
                    <div className="p-0">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Date
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Incident Type
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Action
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Reported By
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedByYear[year].map((record, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50 dark:bg-gray-800/50"
                              }
                            >
                              <td className="px-4 py-2 text-sm">
                                {formatDate(record.date)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {record.incidentType}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {record.action}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {getStatusBadge(record.status)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {record.reportedBy?.name || "Unknown"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Disciplinary Records</CardTitle>
            <CardDescription>
              History of disciplinary incidents and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-gray-800">
              <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
              <h3 className="mt-3 text-lg font-medium">
                Clean Disciplinary Record
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This student has no disciplinary incidents on record. Keep up
                the good behavior!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
