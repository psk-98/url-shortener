import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CopyRedirect from "./copy-redirect"

type Redirect = {
  id: number
  url: string
  visit_count: number
  alias: string
}

export default async function RedirectsTable() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const redirects: Redirect[] = await getRedirects()

  return (
    <div className="my-8 flex justify-center w-full">
      <div className="rounded-md border min-w-8/12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL Link</TableHead>
              <TableHead>Copy</TableHead>
              <TableHead className="text-right">Visit Count</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {redirects.map((redirect) => {
              return (
                <TableRow key={redirect.id}>
                  <TableCell className="font-medium">
                    <a
                      href={`${baseUrl}${redirect.alias}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-4"
                    >
                      {`${baseUrl}${redirect.alias}`}
                    </a>
                  </TableCell>

                  <TableCell>
                    <CopyRedirect alias={redirect.alias} url={redirect.url} />
                  </TableCell>

                  <TableCell className="text-right">
                    {redirect.visit_count}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
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
