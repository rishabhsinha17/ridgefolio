import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function downloadedText(page, name) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name }).click();
  return readFile(await (await pending).path(), "utf8");
}
test("find a service, request a correction, approve and take the matching receipt", async ({
  page,
}) => {
  await page.goto("/demos/finder/");
  await page.getByRole("searchbox").fill("not-a-service");
  await expect(page.getByRole("status")).toContainText("No matching");
  await page.getByRole("searchbox").fill("permit");
  await page.getByText("Community event permit", { exact: true }).click();
  await page.getByRole("link", { name: "Try the permit application" }).click();
  await page.getByLabel("Event name").fill("Neighborhood art fair");
  await page.getByRole("button", { name: "Submit application" }).click();
  await page.getByLabel("Correction to request").fill("Name the entrance");
  await page.getByRole("button", { name: "Request correction" }).click();
  await expect(
    page.getByText("Reviewer note: Name the entrance"),
  ).toBeVisible();
  await page.getByLabel("Event location").fill("Harbor Square, east entrance");
  await page.getByRole("button", { name: "Resubmit correction" }).click();
  await page.getByRole("button", { name: "Approve permit" }).click();
  const receipt = await downloadedText(page, "Download receipt");
  for (const expected of [
    "Neighborhood art fair",
    "east entrance",
    "Name the entrance",
    "Staff approved",
  ])
    expect(receipt).toContain(expected);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByLabel("Event name")).toHaveValue("Harbor market");
});
test("ledger export matches the displayed district and totals", async ({
  page,
}) => {
  await page.goto("/demos/service-ledger/");
  await page.getByLabel("District", { exact: true }).selectOption("South");
  await expect(page.getByRole("status")).toHaveText(
    "2 records · 10 service hours",
  );
  const file = await downloadedText(page, "Download filtered CSV");
  const data = file
    .trim()
    .split("\r\n")
    .slice(1)
    .map((line) => line.split(","));
  expect(data.map((row) => row[1])).toEqual(["South", "South"]);
  expect(data.reduce((total, row) => total + Number(row[3]), 0)).toBe(10);
});
test("search, prepare a brief and download a marked checklist", async ({
  page,
}) => {
  await page.goto("/search/?q=brief");
  await page
    .locator("#site-results")
    .getByRole("link", { name: "Project brief builder", exact: true })
    .click();
  await page.getByLabel("Project name").fill("Library service directory");
  await page
    .getByLabel("Acceptance", { exact: true })
    .fill("Find the branch hours on mobile");
  await page.reload();
  expect(await downloadedText(page, "Download my brief")).toContain(
    "Find the branch hours on mobile",
  );
  await page.getByRole("button", { name: "Clear brief" }).click();
  await page.reload();
  await expect(page.getByLabel("Project name")).toHaveValue("");
  await page.goto("/resources/launch-checklist/");
  await page.getByRole("checkbox").first().check();
  await expect(page.getByRole("status")).toHaveText("1 of 6 checked");
  await page.reload();
  const file = await downloadedText(page, "Download checklist");
  expect(file).toContain("[x] Content and redirects");
  expect(file).toContain("[ ] Resident tasks");
  await page.getByRole("button", { name: "Clear checklist" }).click();
  await page.reload();
  await expect(page.getByRole("status")).toHaveText("0 of 6 checked");
});

test("the case study filters the historical map and identifies individual parks", async ({ page }) => {
  await page.goto("/work/industrial-parks/");
  const status = page.getByLabel("Filter by status");
  const park = page.getByLabel("Inspect a park");
  const summary = page.locator(".atlas-result");
  await expect(summary).toHaveText("141 of 141 parks shown");
  await status.selectOption("Operational");
  await expect(summary).toHaveText("84 of 141 parks shown");
  await expect(park.locator("option")).toHaveCount(85);
  await status.selectOption("Unclear");
  await expect(park.locator("option")).toHaveCount(5);
  await park.selectOption({ index: 1 });
  const selected = await park.inputValue();
  await expect(summary).toContainText(selected);
  await expect(summary).toContainText("Unclear");
  await expect(summary).toContainText("°E");
  await status.selectOption("");
  await expect(park).toHaveValue("");
  await expect(summary).toHaveText("141 of 141 parks shown");
  await page.getByRole("navigation", {name:"In this case study"}).getByRole("link",{name:"Outcome"}).click();
  await expect(page).toHaveURL(/#outcome$/);
  await expect(page.getByRole("link", {name:/Read the website credit/})).toHaveAttribute("href",/about\.html#L170$/);
});

test("the research map retains its image and sources without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({javaScriptEnabled:false,baseURL});
  try {
    const page = await context.newPage();
    await page.goto("/work/industrial-parks/");
    await expect(page.locator(".atlas-map img")).toBeVisible();
    await expect(page.getByLabel("Filter by status")).toBeHidden();
    await expect(page.getByRole("link", { name:/CGS status file/ })).toBeVisible();
  } finally {
    await context.close();
  }
});
