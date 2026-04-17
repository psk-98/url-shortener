"use client";

import { IconCheck, IconCopy } from "@tabler/icons-react";
import * as React from "react";
import { useCopyToClipboard } from "#/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

type LinkRow = {
	id: number;
	url: string;
	visits: number;
};

const dummyLinks: LinkRow[] = [
	{ id: 1, url: "https://short.ly/abc123", visits: 24 },
	{ id: 2, url: "https://short.ly/xyz789", visits: 11 },
	{ id: 3, url: "https://short.ly/qwe456", visits: 57 },
	{ id: 4, url: "https://short.ly/abc1233", visits: 24 },
	{ id: 5, url: "https://short.ly/xyz7893", visits: 11 },
	{ id: 6, url: "https://short.ly/qwe4563", visits: 57 },
	{ id: 7, url: "https://short.ly/abc1234", visits: 24 },
	{ id: 8, url: "https://short.ly/xyz7894", visits: 11 },
	{ id: 9, url: "https://short.ly/qwe4564", visits: 57 },
];

export default function LinksTable() {
	const { copyToClipboard, copiedText, isCopied } = useCopyToClipboard();

	const handleCopy = async (url: string) => {
		await copyToClipboard(url);
	};

	return (
		<div className="rounded-md border">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>URL Link</TableHead>
						<TableHead>Copy</TableHead>
						<TableHead className="text-right">Visit Count</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{dummyLinks.map((link) => {
						const rowCopied = isCopied && copiedText === link.url;

						return (
							<TableRow key={link.id}>
								<TableCell className="font-medium">
									<a
										href={link.url}
										target="_blank"
										rel="noopener noreferrer"
										className="underline underline-offset-4"
									>
										{link.url}
									</a>
								</TableCell>

								<TableCell>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() => handleCopy(link.url)}
									>
										{rowCopied ? <IconCheck /> : <IconCopy />}
									</Button>
								</TableCell>

								<TableCell className="text-right">{link.visits}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
