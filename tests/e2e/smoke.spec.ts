import { expect, test } from "@playwright/test";

test("renders demo entry page at root", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Ordinexa Proposals" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open workspace" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View sample proposal" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Export" })).toBeVisible();
});

test("renders new proposal form", async ({ page }) => {
  await page.goto("/proposals/new");
  await expect(page.getByRole("heading", { name: "Create proposal" })).toBeVisible();
  await expect(page.getByText("Project details")).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate estimate" })).toBeVisible();
});

test("renders proposal detail route", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();
});

test("renders pricing settings route", async ({ page }) => {
  await page.goto("/settings/pricing");
  await expect(page.getByRole("heading", { name: "Pricing settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project type baselines" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
});

// ORDX-016A: Playwright coverage for new proposal estimation flow

test("estimation flow: generates estimate with default inputs", async ({ page }) => {
  await page.goto("/proposals/new");

  // Verify the form loads with expected elements
  await expect(page.getByRole("heading", { name: "Create proposal" })).toBeVisible();
  await expect(page.getByText("Project details")).toBeVisible();

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

  // Modify project type using the first combobox
  const projectTypeSelect = page.getByRole("combobox").nth(0);
  await projectTypeSelect.selectOption("customer-experience-program");

  // Modify style using the second combobox
  const styleSelect = page.getByRole("combobox").nth(1);
  await styleSelect.selectOption("standard-delivery");

  // Modify scope size using the first spinbutton
  await page.getByRole("spinbutton").nth(0).fill("200");

  // Modify complexity level using the second spinbutton
  await page.getByRole("spinbutton").nth(1).fill("5");

  // Trigger estimate generation
  await page.getByRole("button", { name: "Generate estimate" }).click();

  // Verify estimate results appear
  await expect(page.getByText("Estimated budget")).toBeVisible();
  await expect(page.getByText("Estimated timeline")).toBeVisible();

  // Verify the configuration reflects the modified inputs
  await expect(page.getByText("200", { exact: true }).last()).toBeVisible();
});

test("estimation flow: includes scope options in estimate", async ({ page }) => {
  await page.goto("/proposals/new");

  // Toggle some scope options
  await page.getByRole("button", { name: /Discovery workshop/ }).click();
  await page.getByRole("button", { name: /Training and enablement/ }).click();
  await page.getByRole("button", { name: /Implementation support/ }).click();

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

  // Enable expedited delivery
  await page.getByRole("button", { name: /Expedited delivery/ }).click();

  // Trigger estimate generation
  await page.getByRole("button", { name: "Generate estimate" }).click();

  // Verify estimate results appear
  await expect(page.getByText("Estimated budget")).toBeVisible();
  await expect(page.getByText("Estimated timeline")).toBeVisible();

  // Verify expedited compression is shown in timeline breakdown
  await expect(page.getByText("Expedited compression")).toBeVisible();
});

test("estimation flow: reset form clears estimate", async ({ page }) => {
  await page.goto("/proposals/new");

  // Generate an estimate first
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget")).toBeVisible();

  // Reset the form
  await page.getByRole("button", { name: "Start over" }).click();

  // Verify estimate is cleared
  await expect(page.getByText("Configure your engagement to generate an estimate")).toBeVisible();
});


// ORDX-016B: Playwright coverage for calculated proposal detail page

test("proposal detail: loads existing proposal with calculated estimate", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify proposal title
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Verify executive summary card exists
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();
});

test("proposal detail: displays budget estimate section", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify budget estimate card
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();

  // Verify baseline is shown (use exact to avoid strict mode)
  await expect(page.getByText("Baseline", { exact: true })).toBeVisible();

  // Verify scope-size impact is shown
  await expect(page.getByText(/Scope-size impact/)).toBeVisible();

  // Verify estimated budget total is shown - use .first() to avoid strict mode
  await expect(page.getByText("Estimated budget").first()).toBeVisible();

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

test("proposal detail: displays selected options when present", async ({ page }) => {
  // ordx-1001 has multiple selected options
  await page.goto("/proposals/ordx-1001");

  // Verify included modules section
  await expect(page.getByText("Included modules")).toBeVisible();

  // Verify some modules are displayed for ordx-1001
  await expect(page.getByText("Discovery Workshop", { exact: true })).toBeVisible();
  await expect(page.getByText("Implementation Support", { exact: true })).toBeVisible();
});

test("proposal detail: displays expedited compression when applicable", async ({ page }) => {
  // ordx-1001 has rushProject: true
  await page.goto("/proposals/ordx-1001");

  // Verify expedited compression is shown in timeline
  await expect(page.getByText("Expedited compression")).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Operational Improvement Engagement" })).toBeVisible();

  // Verify budget and timeline are still calculated
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline estimate" })).toBeVisible();
});

test("proposal detail: executive summary contains calculated values", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify executive summary card
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();

  // Verify budget range is mentioned in summary (use first to avoid strict mode)
  const budgetRange = page.locator("text=/NT\\$[\\d,]+K-[\\d,]+K budget range/").first();
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


// ORDX-021A: Playwright coverage for AI generation on new proposal page

test("AI generation flow: generates proposal preview with default provider", async ({ page }) => {
  await page.goto("/proposals/new");

  // Verify the form loads
  await expect(page.getByRole("heading", { name: "Create proposal" })).toBeVisible();

  // First generate an estimate (required before proposal preview is available)
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget").first()).toBeVisible();

  // Trigger AI proposal generation with default provider (Gemini-first with mock fallback)
  await page.getByRole("button", { name: "Generate proposal preview" }).click();

  // Wait for generation to complete and verify AI preview content appears
  await expect(page.getByRole("heading", { name: "Executive summary" })).toBeVisible({ timeout: 15000 });

  // Verify visible section headings
  await expect(page.getByRole("heading", { name: "Proposed approach" })).toBeVisible();
});

test("AI generation flow: generates proposal preview with mock provider", async ({ page }) => {
  await page.goto("/proposals/new");

  // Verify the form loads
  await expect(page.getByRole("heading", { name: "Create proposal" })).toBeVisible();

  // Select mock provider for deterministic results
  await page.getByRole("button", { name: /Demo generation/ }).click();

  // First generate an estimate (required before proposal preview is available)
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget").first()).toBeVisible();

  // Trigger AI proposal generation
  await page.getByRole("button", { name: "Generate proposal preview" }).click();

  // Wait for generation to complete and verify structured AI preview sections appear
  await expect(page.getByRole("heading", { name: "Executive summary" })).toBeVisible({ timeout: 15000 });

  // Verify multiple distinct AI-generated sections are present
  await expect(page.getByRole("heading", { name: "Project understanding" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proposed approach" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scope recommendations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Budget narrative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline narrative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Risks and assumptions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended next steps" })).toBeVisible();
});

test("AI generation flow: executive summary contains key sections", async ({ page }) => {
  await page.goto("/proposals/new");

  // Select mock provider for deterministic results
  await page.getByRole("button", { name: /Demo generation/ }).click();

  // First generate an estimate (required before proposal preview is available)
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget").first()).toBeVisible();

  // Trigger AI proposal generation
  await page.getByRole("button", { name: "Generate proposal preview" }).click();

  // Wait for executive summary section
  await expect(page.getByRole("heading", { name: "Executive summary" })).toBeVisible({ timeout: 15000 });

  // Verify executive summary has descriptive content - use .first() to avoid strict mode
  const executiveSection = page.locator("section").filter({ hasText: "Executive summary" }).first();
  await expect(executiveSection).toBeVisible();
});

test("AI generation flow: proposed approach includes workstreams and delivery approach", async ({ page }) => {
  await page.goto("/proposals/new");

  // Select mock provider for deterministic results
  await page.getByRole("button", { name: /Demo generation/ }).click();

  // First generate an estimate (required before proposal preview is available)
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget").first()).toBeVisible();

  // Trigger AI proposal generation
  await page.getByRole("button", { name: "Generate proposal preview" }).click();

  // Wait for proposed approach section
  await expect(page.getByRole("heading", { name: "Proposed approach" })).toBeVisible({ timeout: 15000 });

  // Expand the proposed approach accordion to see subsections
  await page.getByRole("button", { name: "Proposed approach" }).click();

  // Verify proposed approach has subsections - use .first() to avoid strict mode
  await expect(page.getByText("Workstreams").first()).toBeVisible();
  await expect(page.getByText("Delivery approach").first()).toBeVisible();
});

test("AI generation flow: estimate remains visible after proposal generation", async ({ page }) => {
  await page.goto("/proposals/new");

  // First generate an estimate
  await page.getByRole("button", { name: "Generate estimate" }).click();
  await expect(page.getByText("Estimated budget").first()).toBeVisible();

  // Then generate proposal preview
  await page.getByRole("button", { name: /Demo generation/ }).click();
  await page.getByRole("button", { name: "Generate proposal preview" }).click();

  // Wait for AI content
  await expect(page.getByRole("heading", { name: "Executive summary" })).toBeVisible({ timeout: 15000 });

  // Verify estimate content is still visible (AI complements, not replaces)
  await expect(page.getByText("Estimated budget").first()).toBeVisible();
  await expect(page.getByText("Estimated timeline").first()).toBeVisible();
});


// ORDX-021B: Playwright coverage for AI content rendering on detail page

test("AI detail page: loads proposal with AI-generated content sections", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify proposal title
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Verify executive summary is visible
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();

  // Verify AI-generated project understanding is visible
  await expect(page.getByRole("heading", { name: "Project Understanding" })).toBeVisible();

  // Verify AI-generated proposed approach is visible
  await expect(page.getByRole("heading", { name: "Proposed Approach" })).toBeVisible();
});

test("AI detail page: AI content sections are distinct and complete", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Wait for page to load
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Verify multiple AI content sections are visible
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Project Understanding" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proposed Approach" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Scope Recommendations" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Budget Narrative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline Narrative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Risks & Assumptions" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended Next Steps" })).toBeVisible();
});

test("AI detail page: deterministic estimate sections remain visible", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Wait for page to load
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Verify deterministic budget estimate is visible
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();

  // Verify deterministic timeline estimate is visible
  await expect(page.getByRole("heading", { name: "Timeline estimate" })).toBeVisible();

  // Verify baseline is shown in budget
  await expect(page.getByText("Baseline", { exact: true }).first()).toBeVisible();

  // Verify estimated budget total is shown - use .first() to avoid strict mode
  await expect(page.getByText("Estimated budget").first()).toBeVisible();
});

test("AI detail page: AI content complements estimate content", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Wait for page to load
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Verify AI-generated budget narrative exists alongside deterministic budget
  await expect(page.getByRole("heading", { name: "Budget Narrative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();

  // Verify AI-generated timeline narrative exists alongside deterministic timeline
  await expect(page.getByRole("heading", { name: "Timeline Narrative" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline estimate" })).toBeVisible();

  // Verify both AI and deterministic content are visible simultaneously
  await expect(page.getByText("Cost Breakdown")).toBeVisible();
  await expect(page.getByText("Scope-size impact")).toBeVisible();
});

test("AI detail page: executive summary contains overview and value proposition", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Wait for AI executive summary
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();

  // Verify executive summary subsections - use .first() to avoid strict mode violations
  await expect(page.getByRole("heading", { name: "Overview" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Value Proposition" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommendation" }).first()).toBeVisible();
});

test("AI detail page: project details are displayed", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Wait for page to load
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Verify project details card
  await expect(page.getByRole("heading", { name: "Engagement details" })).toBeVisible();

  // Verify project details fields are shown
  await expect(page.getByText("Created")).toBeVisible();
  await expect(page.getByText("Last updated")).toBeVisible();
  await expect(page.getByText("Industry:")).toBeVisible();
});

test("AI detail page: handles proposal with minimal options", async ({ page }) => {
  // ordx-1003 has fewer options selected
  await page.goto("/proposals/ordx-1003");

  // Verify proposal loads with AI content
  await expect(page.getByRole("heading", { name: "Operational Improvement Engagement" })).toBeVisible();

  // Verify AI content still renders
  await expect(page.getByRole("heading", { name: "Executive Summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proposed Approach" })).toBeVisible();

  // Verify deterministic estimates are still shown
  await expect(page.getByRole("heading", { name: "Budget estimate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline estimate" })).toBeVisible();
});


// ORDX-026B: Playwright coverage for export route and export access flow

test("export route: loads for existing proposal", async ({ page }) => {
  await page.goto("/proposals/ordx-1001/export");

  // Verify the export route loads successfully
  await expect(page).toHaveURL(/\/proposals\/ordx-1001\/export$/);
});

test("export route: displays client-facing sections", async ({ page }) => {
  await page.goto("/proposals/ordx-1001/export");

  // Verify key client-facing sections are visible - use .first() to avoid strict mode
  await expect(page.getByText("Executive Summary").first()).toBeVisible();
  await expect(page.getByText("Project Understanding").first()).toBeVisible();
  await expect(page.getByText("Proposed Approach").first()).toBeVisible();
  await expect(page.getByText("Scope Recommendations").first()).toBeVisible();
  await expect(page.getByText("Budget & Timeline").first()).toBeVisible();
});

test("export route: displays print/save actions", async ({ page }) => {
  await page.goto("/proposals/ordx-1001/export");

  // Verify print action is visible
  await expect(page.getByRole("button", { name: /Print/ })).toBeVisible();
});

test("export route: includes proposal narrative content", async ({ page }) => {
  await page.goto("/proposals/ordx-1001/export");

  // Verify proposal narrative sections are present
  await expect(page.getByText("Strategic overview")).toBeVisible();
  await expect(page.getByText("Project context")).toBeVisible();
  await expect(page.getByText("Recommended approach", { exact: true })).toBeVisible();
});

test("export route: includes estimate summary content", async ({ page }) => {
  await page.goto("/proposals/ordx-1001/export");

  // Verify estimate summary is present
  await expect(page.getByText("Cost and schedule overview")).toBeVisible();
  await expect(page.getByText("Budget & Timeline")).toBeVisible();
});

test("export route: 404 for non-existent proposal", async ({ page }) => {
  await page.goto("/proposals/non-existent-id/export");

  // Verify 404 page is shown
  await expect(page.getByText("404")).toBeVisible();
});

test("export access flow: from detail page to export view", async ({ page }) => {
  await page.goto("/proposals/ordx-1001");

  // Verify detail page loads
  await expect(page.getByRole("heading", { name: "Regional Transformation Initiative" })).toBeVisible();

  // Click the export button
  await page.getByRole("link", { name: "Export" }).click();

  // Verify export route loads
  await expect(page).toHaveURL(/\/proposals\/ordx-1001\/export$/);
  await expect(page.getByText("Executive Summary").first()).toBeVisible();
});
