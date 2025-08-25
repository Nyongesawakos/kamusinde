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
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  DollarSign,
  Receipt,
  AlertTriangle,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { getStudentFees, getStudentFeeSummary } from "@/lib/action/fee.actions";

interface FeesTabProps {
  studentId: string;
}

export default function FeesTab({ studentId }: FeesTabProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeRecords, setFeeRecords] = useState<any[]>([]);
  const [groupedFees, setGroupedFees] = useState<
    Record<string, Record<string, any[]>>
  >({});
  const [stats, setStats] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [upcomingFees, setUpcomingFees] = useState<any[]>([]);
  const [overdueFees, setOverdueFees] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch fee records
        const feesResult = await getStudentFees(studentId);
        if (feesResult.success) {
          setFeeRecords(feesResult.data.records || []);
          setGroupedFees(feesResult.data.groupedFees || {});
          setStats(feesResult.data.stats || null);
          setPaymentHistory(feesResult.data.paymentHistory || []);
          setUpcomingFees(feesResult.data.upcomingFees || []);
          setOverdueFees(feesResult.data.overdueFees || []);
        } else {
          setError(feesResult.message);
        }

        // Fetch fee summary
        const summaryResult = await getStudentFeeSummary(studentId);
        if (summaryResult.success) {
          setSummary(summaryResult.data);
        } else {
          setError(summaryResult.message);
        }
      } catch (err) {
        setError("An error occurred while fetching fee data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Paid
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Partial
          </Badge>
        );
      case "unpaid":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Unpaid
          </Badge>
        );
      case "waived":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Waived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Paid
          </Badge>
        );
      case "current":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Calendar className="mr-1 h-3 w-3" /> Current
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <AlertTriangle className="mr-1 h-3 w-3" /> Overdue
          </Badge>
        );
      case "critical":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertTriangle className="mr-1 h-3 w-3" /> Critical
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

  const hasFees = feeRecords.length > 0;
  const academicYears = Object.keys(groupedFees).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Fee Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fee Summary</CardTitle>
          <CardDescription>
            {summary?.currentTerm?.academicYear && summary?.currentTerm?.term
              ? `Current fee status for ${summary.currentTerm.academicYear}, ${summary.currentTerm.term}`
              : "No current fee records"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasFees ? (
            <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
              <CreditCard className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-sm font-medium">No fee records found</p>
              <p className="text-xs text-muted-foreground">
                Fee records will appear here once they are added.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Payment Status
                  </div>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2">
                  {getPaymentStatusBadge(summary?.paymentStatus || "current")}
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Payment Progress</span>
                    <span>
                      {summary?.currentTerm?.paymentPercentage
                        ? Math.round(summary.currentTerm.paymentPercentage) +
                          "%"
                        : "0%"}
                    </span>
                  </div>
                  <Progress
                    value={summary?.currentTerm?.paymentPercentage || 0}
                    className="mt-1 h-2"
                    indicatorClassName={
                      summary?.currentTerm?.paymentPercentage >= 90
                        ? "bg-green-500"
                        : summary?.currentTerm?.paymentPercentage >= 50
                        ? "bg-amber-500"
                        : "bg-red-500"
                    }
                  />
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    Current Term
                  </div>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  <div className="text-xl font-bold">
                    {formatCurrency(summary?.currentTerm?.totalAmount || 0)}
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <span className="text-muted-foreground">Paid: </span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(summary?.currentTerm?.totalPaid || 0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Balance: </span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(
                          summary?.currentTerm?.totalBalance || 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    {summary?.overduePayment
                      ? "Overdue Payment"
                      : "Next Payment"}
                  </div>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-1">
                  {summary?.overduePayment ? (
                    <>
                      <div className="text-xl font-bold text-red-600">
                        {formatCurrency(summary.overduePayment.balance || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due date: {formatDate(summary.overduePayment.dueDate)}
                      </div>
                      <div className="mt-1 text-xs text-red-600">
                        {summary.overduePayment.feeType} - Overdue
                      </div>
                    </>
                  ) : summary?.upcomingPayment ? (
                    <>
                      <div className="text-xl font-bold">
                        {formatCurrency(summary.upcomingPayment.balance || 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due date: {formatDate(summary.upcomingPayment.dueDate)}
                      </div>
                      <div className="mt-1 text-xs">
                        {summary.upcomingPayment.feeType}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm">No upcoming payments</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Records */}
      {hasFees ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fee Records</CardTitle>
            <CardDescription>
              Fee payment history and upcoming payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="records" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="records">Fee Records</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="records" className="space-y-4">
                {academicYears.map((year) => (
                  <div key={year} className="rounded-lg border">
                    <div className="border-b bg-muted/50 px-4 py-2">
                      <h4 className="font-medium">{year}</h4>
                    </div>
                    <div className="p-0">
                      {Object.keys(groupedFees[year])
                        .sort()
                        .reverse()
                        .map((term) => (
                          <div
                            key={`${year}-${term}`}
                            className="border-b last:border-b-0"
                          >
                            <div className="bg-gray-50 px-4 py-1 dark:bg-gray-800/50">
                              <h5 className="text-sm font-medium">{term}</h5>
                            </div>
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    Fee Type
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    Amount
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    Paid
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    Balance
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    Status
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    Due Date
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {groupedFees[year][term].map((fee, index) => (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50 dark:bg-gray-800/50"
                                    }
                                  >
                                    <td className="px-4 py-2 text-sm">
                                      {fee.feeType}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatCurrency(fee.amount)}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatCurrency(fee.paidAmount)}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatCurrency(fee.balance)}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {getStatusBadge(fee.status)}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatDate(fee.dueDate)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="payments">
                {paymentHistory.length > 0 ? (
                  <div className="rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left text-sm font-medium">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium">
                            Fee Type
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium">
                            Amount
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium">
                            Method
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium">
                            Receipt
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((payment, index) => (
                          <tr
                            key={index}
                            className={
                              index % 2 === 0
                                ? "bg-white"
                                : "bg-gray-50 dark:bg-gray-800/50"
                            }
                          >
                            <td className="px-4 py-2 text-sm">
                              {formatDate(payment.paymentDate)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {payment.feeType}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {formatCurrency(payment.paidAmount)}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {payment.paymentMethod || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-sm">
                              {payment.receiptNumber || "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <Receipt className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm font-medium">
                      No payment history found
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming">
                {upcomingFees.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Fee Type
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Due Date
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Amount
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Balance
                            </th>
                            <th className="px-4 py-2 text-left text-sm font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingFees.map((fee, index) => (
                            <tr
                              key={index}
                              className={
                                index % 2 === 0
                                  ? "bg-white"
                                  : "bg-gray-50 dark:bg-gray-800/50"
                              }
                            >
                              <td className="px-4 py-2 text-sm">
                                {fee.feeType}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {formatDate(fee.dueDate)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {formatCurrency(fee.amount)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                {formatCurrency(fee.balance)}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                >
                                  Record Payment
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {overdueFees.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-red-600">
                          Overdue Payments
                        </h3>
                        <div className="rounded-lg border border-red-200">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Fee Type
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Due Date
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Days Overdue
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Balance
                                </th>
                                <th className="px-4 py-2 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {overdueFees.map((fee, index) => {
                                const dueDate = new Date(fee.dueDate);
                                const today = new Date();
                                const daysOverdue = Math.floor(
                                  (today.getTime() - dueDate.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                );

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
                                      {fee.feeType}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatDate(fee.dueDate)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-red-600">
                                      {daysOverdue} days
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {formatCurrency(fee.balance)}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs"
                                      >
                                        Record Payment
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-800">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm font-medium">
                      No upcoming payments
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fee Records</CardTitle>
            <CardDescription>
              Fee payment history and upcoming payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-gray-50 p-6 text-center dark:bg-gray-800">
              <DollarSign className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-3 text-lg font-medium">No Fee Records</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This student doesn't have any fee records yet. Records will
                appear here once fees are added.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
