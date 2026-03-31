import { expect, test } from "@playwright/test";

test("redirects root to dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("renders new proposal form", async ({ page }) => {
  await page.goto("/proposals/new");
  await expect(page.getByRole("heading", { name: "New proposal" })).toBeVisible();
  await expect(page.getByText("Proposal intake form")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mock generate proposal" })).toBeVisible();
});

test("renders proposal detail route", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");
  await expect(page.getByRole("heading", { name: "Regional Proposal Workspace Modernization" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estimate summary" })).toBeVisible();
});

test("renders pricing settings route", async ({ page }) => {
  await page.goto("/settings/pricing");
  await expect(page.getByRole("heading", { name: "Pricing settings" })).toBeVisible();
  await expect(page.getByText("Project type baselines")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mock save changes" })).toBeVisible();
});
