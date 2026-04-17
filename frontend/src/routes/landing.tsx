import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import URLForm from "#/components/landing/urlForm";

export const Route = createFileRoute("/landing")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isAutoCopyUrl, setIsAutoCopyUrl] = useState(false);
	return (
		<div className="min-h-screen text-center mx-10">
			<h1 className="mt-16 text-4xl">{"Shorten Your Loooong Links:)"}</h1>
			<p className="my-4">
				Linkly is an effecient and easy-to-use URL shortening service that
				streamlines your online experience
			</p>

			<URLForm />
		</div>
	);
}
