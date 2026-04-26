import { Skeleton } from "@/components/ui/skeleton"

export default function RedirectsTableSkeleton() {
  return (
    <div className="flex flex-col justify-center gaps-2 min-w-8/12 my-8">
      {Array.from({ length: 7 }).map((_, index) => (
        <div className="flex gap-4" key={index}>
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}
