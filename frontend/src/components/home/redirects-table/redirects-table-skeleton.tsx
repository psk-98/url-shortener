import { Skeleton } from "@/components/ui/skeleton"

export default function RedirectsTableSkeleton() {
  return (
    <div className="flex flex-col justify-center gaps-2 min-w-8/12 my-8">
      {Array.from({ length: 7 }).map((_, index) => (
        <div className="grid grid-cols-12 gap-2 space-y-3" key={index}>
          <div className="col-span-6">
            <Skeleton className="h-5 w-full rounded-md" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-5 w-full rounded-md" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-5 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
