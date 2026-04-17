import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import LinksTable from "#/components/landing/linksTable";
import URLForm from "#/components/landing/urlForm";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";

export const Route = createFileRoute("/landing")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isAutoCopyUrl, setIsAutoCopyUrl] = useState(false);
	return (
		<div className="min-h-screen flex flex-col items-center mx-10">
			<h1 className="mt-16 text-4xl">{"Shorten Your Loooong Links:)"}</h1>
			<p className="my-4">
				Linkly is an effecient and easy-to-use URL shortening service that
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

			<LinksTable />
		</div>
	);
}
