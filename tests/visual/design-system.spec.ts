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
  await page.getByLabel("h1 — desktop").fill("72px");
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
});

test("Reset clears tweaks", async ({ page }) => {
  await page.getByLabel("h1 — desktop").fill("72px");
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
  await page.getByRole("button", { name: "Reset to baseline" }).click();
  await expect(page.getByText(/0 of \d+ tokens changed/)).toBeVisible();
});

test("Copy button output contains override", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByLabel("h1 — desktop").fill("72px");
  await page.getByRole("button", { name: /Copy @theme block/ }).click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("@theme {");
  expect(text).toContain("--text-h1-desktop: 72px;");
  expect(text).not.toContain("--text-h1-desktop: 80px;");
});

test("tweaks persist across reload", async ({ page }) => {
  await page.getByLabel("h1 — desktop").fill("72px");
  // Wait for the debounced save to actually hit localStorage (more robust than fixed timeout).
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("design-system-tweaks")))
    .toContain("72px");
  await page.reload();
  await expect(page.getByText(/1 of \d+ tokens changed/)).toBeVisible();
});
