"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ExamResultsStatsProps {
  statistics: {
    totalStudents: number
    totalSubmitted: number
    totalPassed: number
    totalFailed: number
    totalAbsent: number
    totalIncomplete: number
    highestMarks: number
    lowestMarks: number
    averageMarks: number
    passRate: number
  }
  totalMarks: number
}

export default function ExamResultsStats({ statistics, totalMarks }: ExamResultsStatsProps) {
  const {
    totalStudents,
    totalSubmitted,
    totalPassed,
    totalFailed,
    totalAbsent,
    totalIncomplete,
    highestMarks,
    lowestMarks,
    averageMarks,
    passRate,
  } = statistics

  const submissionRate = totalStudents > 0 ? (totalSubmitted / totalStudents) * 100 : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Results Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Submission Rate</span>
                <span>{submissionRate.toFixed(1)}%</span>
              </div>
              <Progress value={submissionRate} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>
                  {totalSubmitted} of {totalStudents} students
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-sm">
                <span>Pass Rate</span>
                <span>{passRate.toFixed(1)}%</span>
              </div>
              <Progress value={passRate} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>
                  {totalPassed} of {totalSubmitted} submissions
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-green-50 p-3 rounded-md">
                <div className="text-xs text-green-700 font-medium">Passed</div>
                <div className="text-2xl font-bold text-green-800">{totalPassed}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-md">
                <div className="text-xs text-red-700 font-medium">Failed</div>
                <div className="text-2xl font-bold text-red-800">{totalFailed}</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-md">
                <div className="text-xs text-orange-700 font-medium">Absent</div>
                <div className="text-2xl font-bold text-orange-800">{totalAbsent}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-xs text-blue-700 font-medium">Incomplete</div>
                <div className="text-2xl font-bold text-blue-800">{totalIncomplete}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Marks Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Highest Marks</div>
                <div className="text-2xl font-bold">
                  {highestMarks} <span className="text-sm font-normal text-muted-foreground">/ {totalMarks}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lowest Marks</div>
                <div className="text-2xl font-bold">
                  {lowestMarks} <span className="text-sm font-normal text-muted-foreground">/ {totalMarks}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Average Marks</div>
                <div className="text-2xl font-bold">
                  {averageMarks} <span className="text-sm font-normal text-muted-foreground">/ {totalMarks}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Class Average</div>
                <div className="text-2xl font-bold">
                  {totalMarks > 0 ? ((averageMarks / totalMarks) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-muted-foreground mb-1">Average Score</div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div
                  className="bg-primary h-4 rounded-full"
                  style={{ width: `${totalMarks > 0 ? (averageMarks / totalMarks) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>0</span>
                <span>{totalMarks}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
