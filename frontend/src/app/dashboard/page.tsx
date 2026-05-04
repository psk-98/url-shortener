import { Suspense } from "react"
import URLForm from "@/components/home/url-form"
import Redirects from "@/components/user/redirects/redirects"
import RedirectsTableSkeleton from "@/components/user/redirects/redirects-table-skeleton"

export default async function Dashboard() {
  return (
    <main className="flex flex-1 w-full flex-col px-10 md:px-16 lg:px-24 pb-16">
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
        <Redirects />
      </Suspense>
    </main>
  )
}
