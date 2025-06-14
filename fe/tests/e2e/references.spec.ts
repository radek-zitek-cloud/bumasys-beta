import { expect, test } from '@playwright/test'

test('references page loads', async ({ page }) => {
  await page.goto('/references')
  
  // Check if the main heading is visible
  await expect(page.locator('text=Reference Data Management')).toBeVisible()
  
  // Check if all three sections are present
  await expect(page.locator('text=Status')).toBeVisible()
  await expect(page.locator('text=Priority')).toBeVisible()
  await expect(page.locator('text=Complexity')).toBeVisible()
  
  // Check if add buttons are present
  await expect(page.locator('button:has-text("Add Status")')).toBeVisible()
  await expect(page.locator('button:has-text("Add Priority")')).toBeVisible()
  await expect(page.locator('button:has-text("Add Complexity")')).toBeVisible()
})

test('references page search functionality', async ({ page }) => {
  await page.goto('/references')
  
  // Check if search fields are present
  await expect(page.locator('input[placeholder*="Search statuses"]')).toBeVisible()
  await expect(page.locator('input[placeholder*="Search priorities"]')).toBeVisible()
  await expect(page.locator('input[placeholder*="Search complexities"]')).toBeVisible()
})