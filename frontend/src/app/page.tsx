import { Suspense } from "react"
import RedirectsTable from "@/components/home/redirects-table/redirects-table"
import RedirectsTableSkeleton from "@/components/home/redirects-table/redirects-table-skeleton"
import URLForm from "@/components/home/url-form"

export default async function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="mt-16 text-4xl text-center w-full">
          {"Shorten Your Loooong Links:)"}
        </h1>
        <p className="my-4 text-center">
          Linkly is an efficient and easy-to-use URL shortening service that
          streamlines your online experience
        </p>

        <div className="w-full flex justify-center">
          <URLForm />
        </div>

        {/* <div className="space-y-2">
				<div className="flex items-center space-x-2">
					<Switch
						id="airplane-mode"
						checked={isAutoCopyUrl}
						onCheckedChange={setIsAutoCopyUrl}
					/>
					<Label htmlFor="airplane-mode">Auto Copy To Clipboard</Label>
				</div>
			</div> */}
        <Suspense fallback={<RedirectsTableSkeleton />}>
          <RedirectsTable />
        </Suspense>
      </main>
    </div>
  )
}
