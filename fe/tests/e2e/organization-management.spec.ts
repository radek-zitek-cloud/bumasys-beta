/**
 * @fileoverview E2E tests for the Organization Management page
 *
 * These tests verify the user interface and functionality of the organization
 * management features including organizations, departments, and staff management.
 */

import { expect, test } from '@playwright/test'

test('organization management page loads correctly', async ({ page }) => {
  await page.goto('/people')

  // Check if the main heading is visible
  await expect(page.locator('text=Organization Management')).toBeVisible()

  // Check if the subtitle is present
  await expect(page.locator('text=Manage organizations, departments, and staff members')).toBeVisible()

  // Check if all three sections are present
  await expect(page.locator('text=Organizations')).toBeVisible()
  await expect(page.locator('text=Departments')).toBeVisible()
  await expect(page.locator('text=Staff Members')).toBeVisible()
})

test('organization management page has add buttons', async ({ page }) => {
  await page.goto('/people')

  // Check if add buttons are present for each section
  await expect(page.locator('button:has-text("Add Organization")')).toBeVisible()
  await expect(page.locator('button:has-text("Add Department")')).toBeVisible()
  await expect(page.locator('button:has-text("Add Staff Member")')).toBeVisible()
})

test('organization management page has search functionality', async ({ page }) => {
  await page.goto('/people')

  // Check if search fields are present for each table
  await expect(page.locator('input[label*="Search organizations"]')).toBeVisible()
  await expect(page.locator('input[label*="Search departments"]')).toBeVisible()
  await expect(page.locator('input[label*="Search staff"]')).toBeVisible()
})

test('organization tables display correctly', async ({ page }) => {
  await page.goto('/people')

  // Check if data tables are present
  await expect(page.locator('[data-v-data-table]').first()).toBeVisible()

  // Check for table headers in the first organization table
  await expect(page.locator('text=Name').first()).toBeVisible()
  await expect(page.locator('text=Description').first()).toBeVisible()
  await expect(page.locator('text=Actions').first()).toBeVisible()
})

test('organization dialogs can be opened', async ({ page }) => {
  await page.goto('/people')

  // Test opening the create organization dialog
  await page.click('button:has-text("Add Organization")')

  // Check if the dialog appeared
  await expect(page.locator('text=Create New Organization')).toBeVisible()

  // Check for form fields
  await expect(page.locator('input[label*="Organization Name"]')).toBeVisible()
  await expect(page.locator('textarea[label*="Description"]')).toBeVisible()

  // Check for dialog buttons
  await expect(page.locator('button:has-text("Cancel")')).toBeVisible()
  await expect(page.locator('button:has-text("Create Organization")')).toBeVisible()

  // Close the dialog
  await page.click('button:has-text("Cancel")')
  await expect(page.locator('text=Create New Organization')).not.toBeVisible()
})

test('organization form validation works', async ({ page }) => {
  await page.goto('/people')

  // Open create organization dialog
  await page.click('button:has-text("Add Organization")')

  // Try to submit empty form
  await page.click('button:has-text("Create Organization")')

  // Form should still be visible (validation prevents submission)
  await expect(page.locator('text=Create New Organization')).toBeVisible()

  // Cancel the dialog
  await page.click('button:has-text("Cancel")')
})

test('department management buttons are present', async ({ page }) => {
  await page.goto('/people')

  // Test opening the create department dialog
  await page.click('button:has-text("Add Department")')

  // Check if the dialog appeared
  await expect(page.locator('text=Create New Department')).toBeVisible()

  // Check for form fields specific to departments
  await expect(page.locator('input[label*="Department Name"]')).toBeVisible()
  await expect(page.locator('[role="combobox"]')).toBeVisible() // Organization dropdown

  // Close the dialog
  await page.click('button:has-text("Cancel")')
})

test('staff management buttons are present', async ({ page }) => {
  await page.goto('/people')

  // Test opening the create staff dialog
  await page.click('button:has-text("Add Staff Member")')

  // Check if the dialog appeared
  await expect(page.locator('text=Create New Staff Member')).toBeVisible()

  // Check for form fields specific to staff
  await expect(page.locator('input[label*="First Name"]')).toBeVisible()
  await expect(page.locator('input[label*="Last Name"]')).toBeVisible()
  await expect(page.locator('input[label*="Email"]')).toBeVisible()
  await expect(page.locator('input[label*="Role"]')).toBeVisible()

  // Close the dialog
  await page.click('button:has-text("Cancel")')
})
