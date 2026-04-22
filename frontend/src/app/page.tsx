import RedirectsTable from "@/components/home/redirectsTable"
import URLForm from "@/components/home/urlForm"

export default async function Home() {
  const redirects = await getRedirects()
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {console.log(redirects)}
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="mt-16 text-4xl text-center">
          {"Shorten Your Loooong Links:)"}
        </h1>
        <p className="my-4 text-center">
          Linkly is an efficient and easy-to-use URL shortening service that
          streamlines your online experience
        </p>

        <URLForm />

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

        <RedirectsTable redirects={redirects} />
      </main>
    </div>
  )
}

const getRedirects = async () => {
  const res = await fetch("http://127.0.0.1:8000/api/v1/redirects/top")

  if (!res.ok) {
    throw new Error("Failed to fetch top redirects")
  }

  return res.json()
}
