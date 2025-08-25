import { notFound } from "next/navigation"
import { getExamById } from "@/lib/action/exam.actions"
import ExamForm from "@/components/dashboard/exams/ExamForm"

interface EditExamPageProps {
  params: {
    id: string
  }
}

export default async function EditExamPage({ params }: EditExamPageProps) {
  const { id } = params
  const { success, exam, error } = await getExamById(id)

  if (!success || !exam) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Exam</h1>
      <ExamForm examId={id} />
    </div>
  )
}
