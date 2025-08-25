"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Printer } from "lucide-react"
import { generateGradeReport, getGradeFormData } from "@/lib/action/grade.actions"

interface GradeReportProps {
  classId?: string
}

export default function GradeReport({ classId: initialClassId }: GradeReportProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formDataLoading, setFormDataLoading] = useState(true)
  const [formData, setFormData] = useState<any>({
    classes: [],
    terms: [],
    currentAcademicYear: "",
  })
  const [classId, setClassId] = useState<string>(initialClassId || "")
  const [term, setTerm] = useState<string>("")
  const [academicYear, setAcademicYear] = useState<string>("")
  const [report, setReport] = useState<any>(null)

  // Load form data
  useEffect(() => {
    const loadFormData = async () => {
      setFormDataLoading(true)
      try {
        const result = await getGradeFormData()
        if (result.success) {
          setFormData(result.data)

          // Set default values
          if (!academicYear) {
            setAcademicYear(result.data.currentAcademicYear)
          }
          if (!term && result.data.terms.length > 0) {
            setTerm(result.data.terms[0])
          }
        } else {
          console.error("Failed to load form data:", result.message)
        }
      } catch (err) {
        console.error("Error loading form data:", err)
      } finally {
        setFormDataLoading(false)
      }
    }

    loadFormData()
  }, [academicYear, term])

  // Function to get grade color based on grade letter
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800 border-green-200"
      case "B+":
      case "B":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "C+":
      case "C":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "D+":
      case "D":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Generate report
  const handleGenerateReport = async () => {
    if (!classId || !term || !academicYear) {
      return
    }

    setLoading(true)
    setReport(null)

    try {
      const result = await generateGradeReport(classId, term, academicYear)
      if (result.success) {
        setReport(result.data)
      } else {
        console.error("Failed to generate report:", result.message)
      }
    } catch (err) {
      console.error("Error generating report:", err)
    } finally {
      setLoading(false)
    }
  }

  // Print report
  const handlePrint = () => {
    window.print()
  }

  // Export as CSV
  const handleExportCSV = () => {
    if (!report) return

    // Prepare CSV data
    const headers = ["Student Name", "Registration Number", "Rank"]

    // Add course names to headers
    report.courses.forEach((course: any) => {
      headers.push(course.name)
    })

    headers.push("Average", "Overall Grade")

    // Prepare rows
    const rows = report.students.map((student: any) => {
      const row: any[] = [
        `${student.student.firstName} ${student.student.lastName}`,
        student.student.registrationNumber,
        student.rank,
      ]

      // Add course grades
      report.courses.forEach((course: any) => {
        const courseGrade = student.courses[course._id.toString()]
        row.push(courseGrade?.grade || "N/A")
      })

      // Add average and overall grade
      row.push(student.averagePercentage.toFixed(2))
      row.push(student.overallGrade)

      return row
    })

    // Convert to CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${report.classDetails.name}_${report.term}_${report.academicYear}_Report.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (formDataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Report</CardTitle>
        <CardDescription>Generate comprehensive grade reports for classes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">Class</label>
            <Select value={classId} onValueChange={setClassId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {formData.classes.map((cls: any) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name} ({cls.academicYear})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Term</label>
            <Select value={term} onValueChange={setTerm} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {formData.terms.map((t: string) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Academic Year</label>
            <Select value={academicYear} onValueChange={setAcademicYear} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formData.currentAcademicYear}>{formData.currentAcademicYear}</SelectItem>
                <SelectItem
                  value={`${Number.parseInt(formData.currentAcademicYear.split("-")[0]) - 1}-${Number.parseInt(formData.currentAcademicYear.split("-")[1]) - 1}`}
                >
                  {`${Number.parseInt(formData.currentAcademicYear.split("-")[0]) - 1}-${Number.parseInt(formData.currentAcademicYear.split("-")[1]) - 1}`}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <Button onClick={handleGenerateReport} disabled={!classId || !term || !academicYear || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Report
          </Button>
        </div>

        {report && (
          <div className="print:block">
            <div className="flex justify-between items-center mb-4 print:hidden">
              <h3 className="text-lg font-semibold">
                Report: {report.classDetails.name} - {report.term} - {report.academicYear}
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="print:mb-4">
              <div className="text-center mb-6 print:mb-4">
                <h2 className="text-xl font-bold print:text-2xl">Kamusinde Boys High School</h2>
                <h3 className="text-lg font-semibold print:text-xl">
                  {report.term} - {report.academicYear} Academic Report
                </h3>
                <p className="text-muted-foreground">Class: {report.classDetails.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
                <div className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">Class Average</h4>
                  <p className="text-2xl font-bold">{report.classStats.classAverage.toFixed(1)}%</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">Pass Rate</h4>
                  <p className="text-2xl font-bold">{report.classStats.passRate.toFixed(1)}%</p>
                </div>
                <div className="border rounded-md p-3">
                  <h4 className="font-medium text-sm">Total Students</h4>
                  <p className="text-2xl font-bold">{report.students.length}</p>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto print:text-xs">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Rank</TableHead>
                      <TableHead className="w-[200px]">Student</TableHead>
                      {report.courses.map((course: any) => (
                        <TableHead key={course._id} className="text-center">
                          {course.courseCode}
                        </TableHead>
                      ))}
                      <TableHead className="text-center">Average</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.students.map((student: any) => (
                      <TableRow key={student.student._id}>
                        <TableCell className="font-medium text-center">{student.rank}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {student.student.firstName} {student.student.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{student.student.registrationNumber}</div>
                        </TableCell>

                        {report.courses.map((course: any) => {
                          const courseGrade = student.courses[course._id.toString()]
                          return (
                            <TableCell key={course._id} className="text-center">
                              {courseGrade ? (
                                <>
                                  <Badge variant="outline" className={getGradeColor(courseGrade.grade)}>
                                    {courseGrade.grade}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {courseGrade.percentage.toFixed(1)}%
                                  </div>
                                </>
                              ) : (
                                <span className="text-muted-foreground text-xs">N/A</span>
                              )}
                            </TableCell>
                          )
                        })}

                        <TableCell className="text-center">
                          <div className="font-medium">{student.averagePercentage.toFixed(1)}%</div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant="outline" className={getGradeColor(student.overallGrade)}>
                            {student.overallGrade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-6 text-sm print:mt-4">
                <p className="font-medium">Grade Key:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    A+ (90-100%)
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    A (80-89%)
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    B+ (75-79%)
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    B (70-74%)
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    C+ (65-69%)
                  </Badge>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                    C (60-64%)
                  </Badge>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    D+ (55-59%)
                  </Badge>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    D (50-54%)
                  </Badge>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                    F (0-49%)
                  </Badge>
                </div>
              </div>

              <div className="mt-6 text-right text-sm text-muted-foreground print:mt-4">
                Generated on: {new Date(report.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
