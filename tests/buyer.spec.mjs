import { test, expect } from "./browser.mjs";
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
  await page.getByRole("searchbox", {name: "Search services"}).fill("not-a-service");
  await expect(page.getByRole("status")).toContainText("No matching");
  await page.getByRole("searchbox", {name: "Search services"}).fill("permit event");
  await expect(page.locator("#match-count")).toHaveText("1 matching service");
  await page.getByText("Community event permit", { exact: true }).click();
  await page.getByRole("link", { name: "Try the permit application" }).click();
  await page.getByLabel("Event name").fill("Neighborhood art fair");
  await page.getByRole("button", { name: "Submit application" }).click();
  await page.getByLabel("Correction to request").fill("Name the entrance");
  await page.getByRole("button", { name: "Request correction" }).click();
  await expect(
    page.getByText("Reviewer note: Name the entrance"),
  ).toBeVisible();
  const resubmit = page.getByRole("button", { name: "Resubmit correction" });
  await resubmit.click();
  await expect(page.locator("#desk-status")).toHaveText("Correction requested");
  await expect(page.locator("#desk-correction-error")).toBeVisible();
  await expect(page.getByLabel("Event name")).toBeFocused();
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
  await expect(page.locator("#desk-heading")).toBeFocused();
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
  const projectName = page.getByLabel("Project name");
  await projectName.fill("   ");
  await page.getByRole("button", { name: "Download my brief" }).click();
  await expect(projectName).toBeFocused();
  expect(await projectName.evaluate(field => field.validity.customError)).toBe(true);
  await projectName.fill("Library service directory");
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

test("worksheet edits survive a refresh before the shared script arrives", async ({ page }) => {
  async function editBeforeReady(path, edit) {
    // Keep the original document parsed and editable while the shared bundle is in flight.
    const script = "**/assets/site.js";
    let intercepted;
    const waiting = new Promise(resolve => { intercepted = resolve; });
    await page.route(script, route => { intercepted(route); }, { times: 1 });
    await page.goto(path, { waitUntil: "commit" });
    const pending = await waiting;
    await edit();
    await pending.abort();
    await page.reload();
  }

  const brief = "/resources/project-brief/";
  const project = page.getByLabel("Project name");
  const acceptance = page.getByLabel("Acceptance", { exact: true });
  await editBeforeReady(brief, async () => {
    await project.fill("Library directory");
    await acceptance.fill("Visitors can find branch hours");
    await expect(page.getByRole("button", {name:"Download my brief"})).toBeDisabled();
  });
  await expect(project).toHaveValue("Library directory");
  await editBeforeReady(brief, async () => {
    await expect(project).toHaveValue("Library directory");
    await expect(acceptance).toHaveValue("Visitors can find branch hours");
    await project.fill("Branch directory");
  });
  const downloaded = await downloadedText(page, "Download my brief");
  expect(downloaded).toContain("Branch directory");
  expect(downloaded).toContain("Visitors can find branch hours");

  const checklist = "/resources/launch-checklist/";
  const boxes = page.getByRole("checkbox");
  await editBeforeReady(checklist, async () => { await boxes.nth(0).check(); });
  await expect(boxes.nth(0)).toBeChecked();
  await editBeforeReady(checklist, async () => {
    await expect(boxes.nth(0)).toBeChecked();
    await boxes.nth(1).check();
    await expect(page.locator("#check-count")).toHaveText("2 of 6 checked");
  });
  await expect(page.locator("#check-count")).toHaveText("2 of 6 checked");
  const checks = await downloadedText(page, "Download checklist");
  expect(checks).toContain("[x] Content and redirects");
  expect(checks).toContain("[x] Resident tasks");
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

test("the featured project carousel opens the working ledger", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const gallery = page.locator('#featured-projects .project-carousel');
  const viewport = gallery.locator('.owl-stage-outer');
  await expect(gallery.locator('.owl-item')).toHaveCount(14);
  await expect(gallery.locator('.owl-item.cloned[aria-hidden=true]')).toHaveCount(8);
  await expect(page.locator('#quotes .owl-item')).toHaveCount(23);
  const next = gallery.getByRole('button', {name:'Next project'});
  const active = () => gallery.locator('.owl-item.active').first().textContent();
  await expect.poll(active).toBeTruthy();
  const centerError = () => gallery.locator('.owl-item.center').evaluate(item => {
    const card = item.getBoundingClientRect();
    const rail = item.closest('.owl-stage-outer').getBoundingClientRect();
    return Math.abs((card.left + card.right - rail.left - rail.right) / 2);
  });
  await expect.poll(centerError).toBeLessThan(2);
  const initial = await active();
  await next.focus();
  await next.press('Enter');
  await expect.poll(active).not.toBe(initial);
  await expect.poll(centerError).toBeLessThan(2);
  await expect(viewport).toBeVisible();
  await gallery.getByRole('link', {name:/Service ledger/i}).click();
  await expect(page).toHaveURL(/\/demos\/service-ledger\/$/);
  await expect(page.getByLabel('District', {exact:true})).toBeVisible();
});

test('the buyer carousel opens the worked brief and cycles through four distinct resources', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/#blog-list');
  const rail = page.getByRole('region', {name:'Browse four buyer resources'});
  const selected = rail.locator('.owl-item.center a');
  const next = rail.getByRole('button', {name:'Next resource'});
  for (const path of ['/resources/project-brief/', '/resources/launch-checklist/', '/resources/capabilities/', '/pricing/']) {
    await expect(selected).toHaveAttribute('href',path);
    await expect(selected.locator('img')).toHaveAttribute('loading','eager');
    await next.press('Enter');
  }
  await expect(selected).toHaveAttribute('href','/resources/project-brief/');
  await selected.click();
  await expect(page).toHaveURL(/\/resources\/project-brief\/$/);
});
