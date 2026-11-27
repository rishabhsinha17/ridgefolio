import { readFile } from "node:fs/promises";
import { test, expect } from "./browser.mjs";

const directory = "/demos/finder/";
const record = (page, slug) => page.locator("#service-" + slug);

test("combine directory search and topic, then recover from no results", async ({page}) => {
  await page.goto(directory + "#workspace");
  const search = page.getByRole("searchbox", {name: "Search services"});
  const topic = page.getByRole("combobox", {name: "Service topic"});
  const count = page.locator("#match-count");
  await expect(count).toHaveText("6 matching services");
  await search.fill("PÁRK");
  await expect(count).toHaveText("2 matching services");
  await expect(record(page, "community-event-permit")).toBeVisible();
  await expect(record(page, "park-shelter-reservation")).toBeVisible();
  await search.fill("");
  await topic.selectOption("streets");
  await expect(count).toHaveText("2 matching services");
  await search.fill("poth");
  await expect(count).toHaveText("1 matching service");
  await expect(record(page, "street-repair")).toBeVisible();
  await topic.selectOption("waste");
  await expect(count).toHaveText("No matching services");
  await expect(page.getByText("Try a shorter search", {exact: false})).toBeVisible();
  await page.getByRole("button", {name: "Clear filters"}).click();
  await expect(search).toBeFocused();
  await expect(topic).toHaveValue("");
  await expect(count).toHaveText("6 matching services");
});

test("service-link entry, keyboard checklist, persisted marks and accurate download", async ({page}) => {
  const service = record(page, "public-records");
  await page.goto(directory + "#service-public-records");
  await expect(service).toHaveJSProperty("open", true);
  const name = "Document type or subject";
  const first = service.getByRole("checkbox", {name});
  await first.focus();
  await first.press("Space");
  await expect(first).toBeChecked();
  await expect(service.locator(".finder-progress")).toHaveText("1 of 3 ready");
  await page.reload();
  await expect(first).toBeChecked();
  const download = page.waitForEvent("download");
  await service.getByRole("link", {name: "Download checklist"}).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("public-records-checklist.txt");
  const text = await readFile(await file.path(), "utf8");
  expect(text).toContain("[x] " + name);
  expect(text).toContain("[ ] Approximate dates and the office involved");
  await service.locator("summary").focus();
  await service.locator("summary").press("Enter");
  await expect(service).toHaveJSProperty("open", false);
  await service.locator("summary").press("Space");
  await expect(service).toHaveJSProperty("open", true);
  await expect(service.getByRole("link", {name: "Link to this service, Public records request"})).toHaveAttribute("href", "#service-public-records");
});

test("event preparation and handoff agree with the local permit intake", async ({page}) => {
  await page.goto(directory + "#service-community-event-permit");
  const service = record(page, "community-event-permit");
  const checks = await service.getByRole("checkbox").evaluateAll(inputs => inputs.map(input => input.labels[0].textContent));
  expect(checks).toEqual(["Event name", "Event location, including the entrance or assembly point", "Event date", "Expected attendance"]);
  await service.getByRole("link", {name: "Try the permit application"}).click();
  await expect(page).toHaveURL(/\/demos\/permit-desk\/#workspace$/);
  for (const label of ["Event name", "Event location", "Event date", "Expected attendance"]) {
    await expect(page.getByLabel(label, {exact: true})).toHaveAttribute("required", "");
  }
});

test.describe("directory without JavaScript", () => {
  test.use({javaScriptEnabled: false});
  test("browse native service details and download the blank checklist", async ({page}) => {
    await page.goto(directory + "#workspace");
    await expect(page.locator("#workspace").getByRole("searchbox")).toHaveCount(0);
    const service = record(page, "street-repair");
    await service.locator("summary").click();
    await expect(service.getByText("Next step")).toBeVisible();
    const file = service.getByRole("link", {name: "Download blank checklist"});
    const text = decodeURIComponent((await file.getAttribute("href")).split(",")[1]);
    expect(text).toContain("[ ] Street name and nearest intersection");
    expect(await file.getAttribute("download")).toBe("street-repair-checklist.txt");
  });
});
