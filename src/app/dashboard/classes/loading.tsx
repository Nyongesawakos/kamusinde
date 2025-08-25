import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ClassesLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[150px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-[180px]" />
                <Skeleton className="h-4 w-[130px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-[220px]" />
                <Skeleton className="h-4 w-[160px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-5 w-[190px]" />
                <Skeleton className="h-4 w-[140px]" />
              </div>
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full space-x-2">
            <Skeleton className="h-8 w-[100px]" />
            <Skeleton className="h-8 w-[70px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
