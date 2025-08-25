import ExamForm from "@/components/dashboard/exams/ExamForm"

export const metadata = {
  title: "Create New Exam",
  description: "Create a new exam for your course",
}

export default function NewExamPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create New Exam</h1>
      <ExamForm />
    </div>
  )
}
