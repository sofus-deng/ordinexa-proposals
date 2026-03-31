import { expect, test } from "@playwright/test";

test("redirects root to dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("renders new proposal form", async ({ page }) => {
  await page.goto("/proposals/new");
  await expect(page.getByRole("heading", { name: "New proposal" })).toBeVisible();
  await expect(page.getByText("Estimation inputs")).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate estimate" })).toBeVisible();
});

test("renders proposal detail route", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");
  await expect(page.getByRole("heading", { name: "APAC Headquarters Office Fit-out" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();
});

test("renders pricing settings route", async ({ page }) => {
  await page.goto("/settings/pricing");
  await expect(page.getByRole("heading", { name: "Pricing settings" })).toBeVisible();
  await expect(page.getByText("Project type baselines")).toBeVisible();
  await expect(page.getByRole("button", { name: "Mock save changes" })).toBeVisible();
});

// ORDX-016A: Playwright coverage for new proposal estimation flow

test("estimation flow: generates estimate with default inputs", async ({ page }) => {
  await page.goto("/proposals/new");

  // Verify the form loads with expected elements
  await expect(page.getByRole("heading", { name: "New proposal" })).toBeVisible();
  await expect(page.getByText("Estimation inputs")).toBeVisible();

  // Trigger estimate generation
  await page.getByRole("button", { name: "Generate estimate" }).click();

  // Verify estimate results appear
  await expect(page.getByText("Estimated budget")).toBeVisible();
  await expect(page.getByText("Estimated timeline")).toBeVisible();

  // Verify configuration summary is visible
  await expect(page.getByText("Configuration")).toBeVisible();

  // Verify budget breakdown is visible
  await expect(page.getByText("Budget breakdown")).toBeVisible();

  // Verify timeline breakdown is visible
  await expect(page.getByText("Timeline breakdown")).toBeVisible();
});

test("estimation flow: generates estimate with modified inputs", async ({ page }) => {
  await page.goto("/proposals/new");

  // Modify project type using the select element
  const projectTypeSelect = page.locator("select").first();
  await projectTypeSelect.selectOption("commercial-showroom");

  // Modify style using the second select element
  const styleSelect = page.locator("select").nth(1);
  await styleSelect.selectOption("premium-executive");

  // Modify area using the number input
  const areaInput = page.locator('input[type="number"]').first();
  await areaInput.fill("200");

  // Modify meeting rooms
  const meetingRoomInput = page.locator('input[type="number"]').nth(1);
  await meetingRoomInput.fill("5");

  // Trigger estimate generation
  await page.getByRole("button", { name: "Generate estimate" }).click();

  // Verify estimate results appear
  await expect(page.getByText("Estimated budget")).toBeVisible();
  await expect(page.getByText("Estimated timeline")).toBeVisible();

  // Verify the configuration reflects the modified inputs
  await expect(page.getByText("200 ping")).toBeVisible();
});

test("estimation flow: includes scope options in estimate", async ({ page }) => {
  await page.goto("/proposals/new");

  // Toggle some scope options
  await page.getByRole("button", { name: /Reception area/ }).click();
  await page.getByRole("button", { name: /Pantry facilities/ }).click();
  await page.getByRole("button", { name: /Glass partitions/ }).click();

  // Trigger estimate generation
  await page.getByRole("button", { name: "Generate estimate" }).click();

  // Verify estimate results appear
  await expect(page.getByText("Estimated budget")).toBeVisible();

  // Verify selected options are shown in the result
  await expect(page.getByText("Selected options")).toBeVisible();

  // Verify options impact is shown in budget breakdown
  await expect(page.getByText("Options impact")).toBeVisible();
});

test("estimation flow: rush project affects timeline", async ({ page }) => {
  await page.goto("/proposals/new");

  // Enable rush project
  await page.getByRole("button", { name: /Rush project/ }).click();

  // Trigger estimate generation
  await page.getByRole("button", { name: "Generate estimate" }).click();

  // Verify estimate results appear
  await expect(page.getByText("Estimated budget")).toBeVisible();
  await expect(page.getByText("Estimated timeline")).toBeVisible();

  // Verify rush compression is shown in timeline breakdown
  await expect(page.getByText("Rush compression")).toBeVisible();
});

test("estimation flow: reset form clears estimate", async ({ page }) => {
  await page.goto("/proposals/new");

  // Generate an estimate first
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget")).toBeVisible();

  // Reset the form
  await page.getByRole("button", { name: "Reset form" }).click();

  // Verify estimate is cleared
  await expect(page.getByText("No estimate generated yet")).toBeVisible();
});


// ORDX-016B: Playwright coverage for calculated proposal detail page

test("proposal detail: loads existing proposal with calculated estimate", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify proposal title
  await expect(page.getByRole("heading", { name: "APAC Headquarters Office Fit-out" })).toBeVisible();

  // Verify executive summary card exists
  await expect(page.getByRole("heading", { name: "Executive proposal summary" })).toBeVisible();
});

test("proposal detail: displays budget estimate section", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify budget estimate card
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();

  // Verify baseline is shown (use exact to avoid strict mode)
  await expect(page.getByText("Baseline", { exact: true })).toBeVisible();

  // Verify area impact is shown
  await expect(page.getByText(/Area impact/)).toBeVisible();

  // Verify estimated budget total is shown
  await expect(page.getByText("Estimated budget")).toBeVisible();

  // Verify confidence indicator
  await expect(page.getByText(/Confidence:/)).toBeVisible();
});

test("proposal detail: displays timeline estimate section", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify timeline estimate card
  await expect(page.getByRole("heading", { name: "Timeline estimate" })).toBeVisible();

  // Verify estimated timeline total is shown (use exact to avoid strict mode)
  await expect(page.getByText("Estimated timeline", { exact: true })).toBeVisible();
});

test("proposal detail: displays fit-out options when selected", async ({ page }) => {
  // ordx-1001 has multiple fit-out options selected
  await page.goto("/proposals/ordx-1001");

  // Verify fit-out options card
  await expect(page.getByRole("heading", { name: "Fit-out options" })).toBeVisible();

  // Verify some options are displayed (ordx-1001 has reception, pantry, glass partitions, etc.)
  await expect(page.getByText("Reception Area", { exact: true })).toBeVisible();
  await expect(page.getByText("Glass partitions")).toBeVisible();
});

test("proposal detail: displays rush compression when applicable", async ({ page }) => {
  // ordx-1001 has rushProject: true
  await page.goto("/proposals/ordx-1001");

  // Verify rush compression is shown in timeline
  await expect(page.getByText("Rush compression")).toBeVisible();
});

test("proposal detail: displays options impact in budget when applicable", async ({ page }) => {
  // ordx-1001 has multiple options that should show impact
  await page.goto("/proposals/ordx-1001");

  // Verify options impact is shown
  await expect(page.getByText("Options impact")).toBeVisible();
});

test("proposal detail: handles proposal with minimal options", async ({ page }) => {
  // ordx-1003 has fewer options selected
  await page.goto("/proposals/ordx-1003");

  // Verify proposal loads
  await expect(page.getByRole("heading", { name: "Branch Office Workspace Refresh" })).toBeVisible();

  // Verify budget and timeline are still calculated
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline estimate" })).toBeVisible();
});

test("proposal detail: executive summary contains calculated values", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify executive summary card
  await expect(page.getByRole("heading", { name: "Executive proposal summary" })).toBeVisible();

  // Verify budget range is mentioned in summary (use first to avoid strict mode)
  const budgetRange = page.locator("text=/\\$[\\d,]+ – \\$[\\d,]+/").first();
  await expect(budgetRange).toBeVisible();

  // Verify timeline is mentioned in summary
  const timelineRange = page.locator("text=/\\d+ – \\d+ weeks/").first();
  await expect(timelineRange).toBeVisible();
});

test("proposal detail: 404 for non-existent proposal", async ({ page }) => {
  await page.goto("/proposals/non-existent-id");

  // Verify 404 page is shown
  await expect(page.getByText("404")).toBeVisible();
});
