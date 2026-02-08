import { Page, Locator } from '@playwright/test'
import fs from 'fs'

export async function dragAndDropFiles(
	page: Page,
	selector: string | Locator,
	filePaths: string[]
): Promise<void> {
	const files = filePaths.map(filePath => ({
		name: filePath.split(/[\\/]/).pop() || 'file',
		data: fs.readFileSync(filePath).toString('base64')
	}))

	// 🧠 Resolve selector if Locator is passed
	const selectorString =
		typeof selector === 'string'
			? selector
			: await selector.evaluate(el => {
					return el instanceof HTMLElement
						? el.getAttribute('id')
							? `#${el.getAttribute('id')}`
							: el.tagName.toLowerCase()
						: ''
			  })

	await page.evaluate(
		async ({
			selector,
			files
		}: {
			selector: string
			files: { name: string; data: string }[]
		}) => {
			const dropTarget = document.querySelector(selector)
			if (!dropTarget) throw new Error(`Drop target not found: ${selector}`)

			const dt = new DataTransfer()
			for (const f of files) {
				const binary = atob(f.data)
				const bytes = new Uint8Array(binary.length)
				for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
				const blob = new Blob([bytes], { type: 'application/octet-stream' })
				const file = new File([blob], f.name)
				dt.items.add(file)
			}

			// Simulate full drag-drop lifecycle
			const fireEvent = (type: string) => {
				const event = new DragEvent(type, {
					bubbles: true,
					cancelable: true,
					dataTransfer: dt
				})
				dropTarget.dispatchEvent(event)
			}

			fireEvent('dragenter')
			fireEvent('dragover')
			fireEvent('drop')
		},
		{ selector: selectorString, files }
	)

	console.log(`✅ Drag and drop simulated for: ${filePaths.join(', ')}`)
}
