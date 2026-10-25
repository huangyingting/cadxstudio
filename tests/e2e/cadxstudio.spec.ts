import { test, expect } from '@playwright/test';

test.describe('CadxStudio Production Replica E2E Verification', () => {
  test('renders Marketing Homepage, 2D Drawing Landing, Enterprise, API, Pricing, Docs/Courses, and Blog', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Engineering-Grade Parametric CAD');

    // Verify Courses & Documentation (/docs) with all 12 modules and 13 FAQs
    await page.goto('/docs');
    await expect(page.locator('h1')).toContainText('Getting Started with CadxStudio');
    await expect(page.getByText('Parametric Modeling')).toBeVisible();

    // Verify Blog Index & Article Detail
    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Insights on AI CAD');
    await page.goto('/blog/how-to-write-text-to-cad-prompts-that-actually-work');
    await expect(page.locator('h1')).toContainText('How to Write Text-to-CAD Prompts That Actually Work');

    // Verify Pricing, Enterprise, and API pages
    await page.goto('/pricing');
    await expect(page.locator('h1')).toContainText('Scale from Single Brackets');

    await page.goto('/enterprise');
    await expect(page.locator('h1')).toContainText('Dedicated AI CAD Infrastructure');

    await page.goto('/api');
    await expect(page.locator('h1')).toContainText('Programmatic Text-to-STEP');
  });

  test('enforces Invite-Only Registration on /register and rejects invalid invitation codes', async ({
    page,
  }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Invite-Only Registration');

    await page.fill('input[placeholder="CADX-XXXX-XXXX"]', 'CADX-INVALID-0000');
    await page.click('button:has-text("Verify")');
    await expect(page.getByText(/Invalid invitation code/i)).toBeVisible();
  });

  test('renders 3D Parametric CAD Workbench (/engine) and compiles live parameter changes & exports', async ({
    page,
  }) => {
    await page.goto('/engine');
    await expect(page.getByText('B-Rep Solid Watertight')).toBeVisible();

    // Switch between left inspector tabs (PARAMS, CODE, TREE, PARTS, CHAT)
    await page.click('button:has-text("CODE")');
    await expect(page.locator('textarea[aria-label="CAD Code Editor"]')).toBeVisible();

    await page.click('button:has-text("TREE")');
    await expect(page.getByText('2D Sketches')).toBeVisible();

    await page.click('button:has-text("PARTS")');
    await expect(page.getByText('Assembly Components')).toBeVisible();

    // Switch to Studio Render Inspector mode
    await page.click('button:has-text("Render")');
    await expect(page.getByText('Studio Render Inspector')).toBeVisible();
  });

  test('renders 2D Engineering Drawing Generator (/engine/drawing) with ISO/ASME HLR views and export tools', async ({
    page,
  }) => {
    await page.goto('/engine/drawing');
    await expect(page.getByText('Drawing Sheet Configuration')).toBeVisible();
    await expect(page.getByText('Export DXF')).toBeVisible();
    await expect(page.getByText('Export SVG')).toBeVisible();
    await expect(page.getByText('Export PDF')).toBeVisible();
  });
});
