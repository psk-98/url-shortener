'use client'

import * as React from 'react'

type UseCopyToClipboardOptions = {
	timeout?: number
}

type UseCopyToClipboardReturn = {
	copiedText: string | null
	isCopied: boolean
	copyToClipboard: (text: string) => Promise<boolean>
	reset: () => void
}

export function useCopyToClipboard(
	options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
	const { timeout = 2000 } = options

	const [copiedText, setCopiedText] = React.useState<string | null>(null)
	const [isCopied, setIsCopied] = React.useState(false)
	const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

	const reset = React.useCallback(() => {
		setCopiedText(null)
		setIsCopied(false)

		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
	}, [])

	const copyToClipboard = React.useCallback(
		async (text: string) => {
			if (!text) {
				reset()
				return false
			}

			try {
				await navigator.clipboard.writeText(text)

				setCopiedText(text)
				setIsCopied(true)

				if (timeoutRef.current) {
					clearTimeout(timeoutRef.current)
				}

				timeoutRef.current = setTimeout(() => {
					setIsCopied(false)
					timeoutRef.current = null
				}, timeout)

				return true
			} catch (error) {
				console.error('Failed to copy text to clipboard:', error)
				reset()
				return false
			}
		},
		[reset, timeout],
	)

	React.useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	return {
		copiedText,
		isCopied,
		copyToClipboard,
		reset,
	}
}
