import { test, expect, Page } from '@playwright/test'

// Define the assumed base URL
const SOURCING_OVERVIEW_URL = 'https://qa.truevaluehub.com/home/overview'

test.describe('Sourcing Overview: Filters and Validations', () => {
	test.beforeEach(async ({ page }) => {
		// Navigate to the dashboard page
		//await page.goto(SOURCING_OVERING_OVERVIEW_URL)
		// Wait for the main heading to confirm the page has loaded
		await page.waitForSelector('h2:has-text("Sourcing Overview")')
	})

	// --- 1. Filter Validation Tests ---
	test('should verify all top-level filters are present and have default selections', async ({
		page
	}) => {
		const filterNames = [
			'Owner',
			'Site',
			'Supplier Name',
			'Status',
			'Manufacturing Country',
			'Delivery Country'
		]

		for (const name of filterNames) {
			// Check if the filter label is visible
			const filterLabel = page.locator(`:text("${name}")`).first()
			await expect(filterLabel).toBeVisible()

			// Check if the dropdown control (which holds the selected value) is visible
			// The structure is assumed to be the label element, and the actual dropdown control is nearby.
			const filterDropdown = page.locator(
				`.filter-bar :text("${name}") + div.dropdown-container`
			)
			await expect(filterDropdown).toBeVisible()
		}

		// Specific default value validation
		await expect(
			page
				.locator('div.filter-bar :text("Owner")')
				.locator('..')
				.locator('div.dropdown-control')
		).toHaveText('Arvinthan TS')
		await expect(
			page
				.locator('div.filter-bar :text("Site")')
				.locator('..')
				.locator('div.dropdown-control')
		).toHaveText('All')
		// Add more 'All' checks for other filters (Supplier Name, Status, etc.)
	})

	// --- 2. Data Grid (Costing Overview) Validation Tests ---
	test('should validate the structure and initial data points of the Costing Overview table', async ({
		page
	}) => {
		const costingOverview = page.locator('text=Costing Overview').locator('..')

		// Verify key columns in the header
		await expect(
			costingOverview.locator('th:has-text("Projects")')
		).toBeVisible()
		await expect(
			costingOverview.locator('th:has-text("Spend (USD)")')
		).toBeVisible()
		await expect(
			costingOverview.locator('th:has-text("Savings (USD)")')
		).toBeVisible()

		// Verify 'Draft' row data
		const draftRow = page.locator('tr', { hasText: 'Draft' })
		await expect(draftRow).toBeVisible()
		await expect(draftRow.locator('td').nth(1)).toHaveText('3') // Check 'Projects' count for Draft

		// Verify 'Costing' row data
		const costingRow = page.locator('tr', { hasText: 'Costing' })
		await expect(costingRow).toBeVisible()
		await expect(costingRow.locator('td').nth(1)).toHaveText('20') // Check 'Projects' count for Costing

		// Check for the "Blank" placeholders, which implies data loading is pending or not available
		await expect(costingRow.locator('td').nth(2)).toHaveText('(Blank)') // Spend (USD)
	})

	// --- 3. Chart and Trend Validation Tests ---
	test('should verify the presence of the ESG overview, charts, and trend lines', async ({
		page
	}) => {
		// Verify 'ESG Overview' section
		await expect(page.locator('text=ESG Overview')).toBeVisible()

		// Verify 'Projects per Commodity' title and the donut chart itself
		await expect(page.locator('text=Projects per Commodity')).toBeVisible()
		// Check for a specific legend item to confirm the chart area is populated
		await expect(page.locator('text=Casting')).toBeVisible()

		// Verify '4-Week Trend' visuals (e.g., a dot or line)
		const costingTrendDot = page.locator(
			'tr:has-text("Costing") .4-week-trend-indicator'
		) // Use a more specific selector if available
		await expect(costingTrendDot).toBeVisible()

		// Verify the main line chart (Historic Trend) is visible
		await expect(
			page
				.locator('text=Historic Trend by Owner')
				.locator('..')
				.locator('canvas')
		).toBeVisible()
	})

	// --- 4. Interaction (Historic Trend Controls) Validation Tests ---
	test('should validate and interact with the Historic Trend date and toggle controls', async ({
		page
	}) => {
		const historicTrendSection = page
			.locator('text=Historic Trend by Owner')
			.locator('..')

		// Verify default selected toggle is 'Owner'
		const ownerToggle = historicTrendSection.locator('button:has-text("Owner")')
		await expect(ownerToggle).toBeVisible()
		// Assert the 'Owner' button is active (assuming 'active' class is applied)
		// await expect(ownerToggle).toHaveClass(/active/);

		// Interact with the 'Commodity' toggle
		const commodityToggle = historicTrendSection.locator(
			'button:has-text("Commodity")'
		)
		await expect(commodityToggle).toBeVisible()
		await commodityToggle.click()
		// Assert 'Commodity' is now active (assuming 'active' class is applied)
		// await expect(commodityToggle).toHaveClass(/active/);

		// Verify the default date range inputs
		await expect(
			historicTrendSection.locator('input[value="10/1/2023"]')
		).toBeVisible()
		await expect(
			historicTrendSection.locator('input[value="10/22/2025"]')
		).toBeVisible()

		// Test interaction with the date range slider (if possible, otherwise test input field change)
		// const endDateInput = historicTrendSection.locator('input[value="10/22/2025"]');
		// await endDateInput.fill('10/30/2025');
		// await expect(endDateInput).toHaveValue('10/30/2025');
	})
})
