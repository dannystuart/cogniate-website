import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/design-system");
  // localStorage is per-origin; clear before each test
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("controls and preview render", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Design System" })).toBeVisible();
  // Both ControlGroup button and PreviewSection h2 carry these labels — use .first()
  await expect(page.getByText("Colors", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Typography", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Gradients", { exact: true }).first()).toBeVisible();
});

test("change counter updates when token changes", async ({ page }) => {
  await expect(page.getByText(/0 of \d+ tokens changed/)).toBeVisible();
  // Find the h1 desktop input by its visible label
  const label = page.getByText("h1 — desktop").locator("..");
  const textInput = label.locator('input[type="text"]');
  await textInput.fill("72px");
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
});

test("Reset clears tweaks", async ({ page }) => {
  const label = page.getByText("h1 — desktop").locator("..");
  await label.locator('input[type="text"]').fill("72px");
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
  await page.getByRole("button", { name: "Reset to baseline" }).click();
  await expect(page.getByText(/0 of \d+ tokens changed/)).toBeVisible();
});

test("Copy button output contains override", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const label = page.getByText("h1 — desktop").locator("..");
  await label.locator('input[type="text"]').fill("72px");
  await page.getByRole("button", { name: /Copy @theme block/ }).click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("@theme {");
  expect(text).toContain("--text-h1-desktop: 72px;");
  expect(text).not.toContain("--text-h1-desktop: 80px;");
});

test("tweaks persist across reload", async ({ page }) => {
  const label = page.getByText("h1 — desktop").locator("..");
  await label.locator('input[type="text"]').fill("72px");
  await page.waitForTimeout(300); // let the debounced save fire
  await page.reload();
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
});
