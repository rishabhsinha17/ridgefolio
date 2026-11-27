import { test, expect } from "./browser.mjs";
import { readFile } from "node:fs/promises";

async function exportText(page, button) {
  const pending = page.waitForEvent("download");
  await button.click();
  const file = await pending;
  return [file.suggestedFilename(), await readFile(await file.path(), "utf8")];
}

test("a manager reconciles the South register, checks logged activity and exports the sorted rows", async ({ page }) => {
  await page.goto("/demos/service-ledger/#workspace");
  const app = page.locator("#service-ledger");
  await expect(app.getByRole("status")).toHaveText("6 records · 32 service hours");
  await app.getByRole("button", { name: "Filter to South district" }).click();
  await expect(app.getByRole("status")).toHaveText("2 records · 10 service hours");
  await expect(app.getByRole("button", { name: "Clear South district" })).toBeFocused();
  await app.getByRole("group", { name: "Group hours by" }).getByRole("button", { name: "Service" }).click();
  await expect(app.locator("#ledger-chart .ledger-bar strong")).toHaveText(["8 h", "2 h"]);
  await app.getByLabel("Sort by", { exact:true }).selectOption("most");
  await expect(app.locator(".ledger-entry:visible .ledger-toggle")).toHaveText(["RF-205", "RF-203"]);
  const toggle = app.getByRole("button", { name:"RF-205", exact:true });
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const panel = app.locator("#log-RF-205");
  await expect(panel.getByText("Maple Avenue pothole repair")).toBeVisible();
  await expect(panel.locator(".log-hours")).toHaveText(["1 h", "6 h", "1 h"]);
  await expect(panel.locator(".ledger-log-total strong")).toHaveText("8 h");
  await expect(page).toHaveURL(/[?&]record=RF-205/);
  await page.reload();
  await expect(panel).toBeVisible();
  await expect(app.getByLabel("District", { exact:true })).toHaveValue("South");
  await expect(app.locator("#ledger-register-total")).toHaveText("10");

  const [filename, detail] = await exportText(page, panel.getByRole("button", { name: "Download RF-205 work log" }));
  expect(filename).toBe("RF-205-work-log.csv");
  expect(detail).toContain("RF-205,2026-11-05,Road crew,Prepared the surface and completed the asphalt patch.,6\r\n");
  const exported = await exportText(page, app.getByRole("button", { name: "Download filtered CSV" }));
  expect(exported).toEqual(["sample-service-ledger.csv", "Record,District,Service,Hours\r\nRF-205,South,Road repair,8\r\nRF-203,South,Park reservation,2\r\n"]);
});

test("an empty intersection has zero hours and exports only the real column headings", async ({ page }) => {
  await page.goto("/demos/service-ledger/?district=South&service=Permit+review&record=RF-205#workspace");
  const app = page.locator("#service-ledger");
  await expect(app.getByRole("status")).toHaveText("0 records · 0 service hours");
  await expect(app.locator(".ledger-entry:visible")).toHaveCount(0);
  await expect(app.locator(".ledger-log:visible")).toHaveCount(0);
  await expect(app.locator("#ledger-register-total")).toHaveText("0");
  await expect(app.getByText("No hours in this selection.")).toBeVisible();
  expect((await exportText(page, app.getByRole("button", { name: "Download filtered CSV" })))[1]).toBe("Record,District,Service,Hours\r\n");
  await app.getByRole("button", { name:"Show all records" }).click();
  await expect(app.getByLabel("District", { exact:true })).toBeFocused();
  await expect(app.getByRole("status")).toHaveText("6 records · 32 service hours");
  await expect(app.locator(".ledger-entry:visible")).toHaveCount(6);
  await expect(app.locator("#ledger-empty")).toBeHidden();
});

test("changing a filter closes detail that no longer belongs to the report", async ({ page }) => {
  await page.goto("/demos/service-ledger/?district=South&record=RF-203#workspace");
  const app = page.locator("#service-ledger");
  await expect(app.locator("#log-RF-203")).toBeVisible();
  await app.getByLabel("Service", {exact:true}).selectOption("Road repair");
  await expect(app.getByRole("status")).toHaveText("1 record · 8 service hours");
  await expect(app.locator("#log-RF-203")).toBeHidden();
  await expect(page).not.toHaveURL(/[?&]record=/);
  await expect(app.locator(".ledger-entry:visible .record-hours")).toHaveText(["8"]);
});

test.describe("without scripting", () => {
  test.use({ javaScriptEnabled:false });
  test("the full register, inspectable work logs and matching CSV remain available", async ({page}) => {
    await page.goto("/demos/service-ledger/#workspace");
    const app = page.locator("#service-ledger");
    await expect(app.locator(".ledger-entry:visible")).toHaveCount(6);
    await app.getByText("Work log for RF-203", {exact:true}).click();
    await expect(app.getByText("Riverside shelter reservation")).toBeVisible();
    await expect(app.locator("#log-RF-203 .log-hours")).toHaveText(["0.5 h", "1 h", "0.5 h"]);
    const href = await app.getByRole("link", {name:"Download all records"}).getAttribute("href");
    const csv = decodeURIComponent(href.slice(href.indexOf(",") + 1));
    expect(csv.trim().split("\r\n")).toHaveLength(7);
    expect(csv).toContain("RF-203,South,Park reservation,2\r\n");
    await expect(app.getByRole("button")).toHaveCount(0);
  });
});
