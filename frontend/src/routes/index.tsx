import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import LinksTable from "#/components/landing/linksTable";
import URLForm from "#/components/landing/urlForm";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";

type RedirectTopItem = {
	id: number;
	alias: string;
	url: string;
	visit_count: number;
};

async function getTopRedirects(): Promise<RedirectTopItem[]> {
	const res = await fetch("http://127.0.0.1:8000/api/v1/redirects/top");

	if (!res.ok) {
		throw new Error("Failed to fetch top redirects");
	}

	return res.json();
}

const topRedirectsQueryOptions = () =>
	queryOptions({
		queryKey: ["top-redirects", { limit: 20 }],
		queryFn: getTopRedirects,
		staleTime: 1000 * 60 * 5,
	});
export const Route = createFileRoute("/")({
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(topRedirectsQueryOptions());
	},
	component: RouteComponent,
});

function RouteComponent() {
	const [isAutoCopyUrl, setIsAutoCopyUrl] = useState(false);
	const { data } = useSuspenseQuery(topRedirectsQueryOptions());

	return (
		<div className="min-h-screen flex flex-col items-center mx-10">
			<h1 className="mt-16 text-4xl text-center">
				{"Shorten Your Loooong Links:)"}
			</h1>
			<p className="my-4 text-center">
				Linkly is an efficient and easy-to-use URL shortening service that
				streamlines your online experience
			</p>

			<URLForm />

			<div className="space-y-2">
				<div className="flex items-center space-x-2">
					<Switch
						id="airplane-mode"
						checked={isAutoCopyUrl}
						onCheckedChange={setIsAutoCopyUrl}
					/>
					<Label htmlFor="airplane-mode">Auto Copy From Clipboard</Label>
				</div>
			</div>

			<LinksTable redirects={data} />
		</div>
	);
}
