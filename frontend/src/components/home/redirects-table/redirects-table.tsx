import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Redirect } from "@/lib/types"
import CopyRedirect from "./copy-redirect"

export default async function RedirectsTable() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const redirects: Redirect[] = await getRedirects()

  return (
    <div className="w-full flex justify-center">
      <div className="w-full lg:w-8/12">
        <Table className="w-full">
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
  const res = await fetch(`${process.env.API_URL}/redirects/top`)

  if (!res.ok) {
    throw new Error("Failed to fetch top redirects")
  }

  return res.json()
}
