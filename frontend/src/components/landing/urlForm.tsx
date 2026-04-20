import { IconCheck, IconCopy } from '@tabler/icons-react'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { useCopyToClipboard } from '#/hooks/useCopyToClipboard'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from '../ui/input-group'

type FormData = {
	url: string
}

export default function URLForm() {
	const { copyToClipboard, isCopied } = useCopyToClipboard()
	const [shortenedURL, setShortenedURL] = useState(null)

	const baseApiUrl = import.meta.env.VITE_API_URL
	const baseUrl = import.meta.env.VITE_BASE_URL

	const form = useForm({
		defaultValues: { url: '' } as FormData,
		onSubmit: async ({ value }) => {
			console.log(value)
			const res = await fetch(`${baseApiUrl}/redirects/guest_redirect`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				body: JSON.stringify(value),
			})

			if (!res.ok) {
				console.log(res)
				throw new Error(`HTTP error: ${res.status}`)
			}

			const data = await res.json()
			setShortenedURL(data.alias)
			console.log(data)
		},
	})
	return (
		<form
			className="mb-6 min-w-10/12"
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
		>
			{shortenedURL ? (
				<InputGroup>
					<InputGroupInput placeholder={`${baseUrl}${shortenedURL}`} readOnly />
					<InputGroupAddon align="inline-end">
						<InputGroupButton
							aria-label="Copy"
							title="Copy"
							size="icon-xs"
							onClick={() => {
								copyToClipboard(`${baseUrl}${shortenedURL}`)
							}}
						>
							{isCopied ? <IconCheck /> : <IconCopy />}
						</InputGroupButton>
					</InputGroupAddon>
				</InputGroup>
			) : (
				<form.Field
					name="url"
					validators={{
						onChange: ({ value }) =>
							!value
								? 'URL is required'
								: !/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)$/.test(
											value,
										)
									? 'Enter a valid URL'
									: undefined,
					}}
					children={(field) => (
						<div className="space-y-1">
							<InputGroup>
								<InputGroupInput
									name={field.name}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									placeholder="Enter a url.."
									aria-invalid={field.state.meta.errors.length > 0}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton type="submit" variant="secondary">
										Shorten
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>

							{field.state.meta.errors[0] && (
								<p className="text-sm text-destructive">
									{field.state.meta.errors[0]}
								</p>
							)}
						</div>
					)}
				/>
			)}
		</form>
	)
}
