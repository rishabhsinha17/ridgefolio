import { test, expect } from "./browser.mjs";
import { readFile } from "node:fs/promises";

async function readDownload(page, button) {
  const pending = page.waitForEvent("download");
  await button.click();
  const download = await pending;
  return { filename: download.suggestedFilename(), text: await readFile(await download.path(), "utf8") };
}

test("service directory keeps a shareable guide, checklist and recoverable filters", async ({ page }) => {
  await page.goto("/demos/finder/#workspace");
  const tool = page.locator("#workspace");
  const query = tool.getByRole("searchbox");
  await query.fill("park");
  await expect(tool.getByRole("status")).toHaveText("2 matching services");
  const permit = tool.locator('[data-service="permit"]');
  await permit.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(permit).toHaveJSProperty("open", true);
  await expect(page).toHaveURL(/[?&]service=permit/);
  await page.reload();
  await expect(query).toHaveValue("park");
  await expect(permit).toHaveJSProperty("open", true);
  const guide = await readDownload(page, permit.getByRole("button", { name: "Download checklist" }));
  expect(guide.filename).toBe("permit-service-checklist.txt");
  expect(guide.text).toContain("[ ] Entrance or assembly point");
  expect(guide.text).toContain("Example routing: Community services");

  await tool.getByRole("button", { name: "Roads" }).click();
  await expect(tool.getByRole("button", { name: "Roads" })).toHaveAttribute("aria-pressed", "true");
  await expect(tool.getByRole("status")).toHaveText("No matching services");
  await tool.getByRole("button", { name: "Show all services" }).click();
  await expect(query).toBeFocused();
  await expect(tool.locator(".finder-card:visible")).toHaveCount(4);
  await query.fill("street damage");
  await expect(tool.locator(".finder-card:visible strong").first()).toHaveText("Street repair request");
});

test("permit restores data across correction, validation, final decision and reset", async ({ page }) => {
  await page.goto("/demos/permit-desk/#workspace");
  const w = page.locator("#workspace");
  await w.getByLabel("Event name").fill("  ");
  await w.getByRole("button", { name: "Submit application" }).click();
  await expect(w.getByLabel("Event name")).toHaveAttribute("aria-invalid", "true");
  await expect(w.getByLabel("Event name")).toBeFocused();
  await w.getByLabel("Event name").fill("Garden walk");
  await w.getByLabel("Event details (optional)").fill("Meet beside the garden gate.");
  await page.reload();
  await expect(w.getByLabel("Event name")).toHaveValue("Garden walk");
  await w.getByRole("button", { name: "Submit application" }).click();
  await expect(w.locator("#desk-heading")).toBeFocused();
  await w.getByLabel("Correction to request").fill("Supply the street address.");
  await page.reload();
  await expect(w.getByLabel("Correction to request")).toHaveValue("Supply the street address.");
  await w.getByRole("button", { name: "Request correction" }).click();
  await page.reload();
  await expect(w.locator("#desk-status")).toHaveText("Correction requested");
  await expect(w.locator(".reviewer-note")).toContainText("Supply the street address.");
  await w.getByRole("button", { name: "Resubmit correction" }).click();
  await expect(w.getByRole("alert")).toContainText("Update the event");
  await w.getByLabel("Event location").fill("120 Garden Street");
  await expect(w.getByRole("alert")).toHaveCount(0);
  await w.getByRole("button", { name: "Resubmit correction" }).click();
  await expect(w.locator("#desk-history")).toContainText("Harbor Square → 120 Garden Street");
  await expect(w.getByLabel("Correction to request")).toHaveValue("");
  await w.getByRole("button", { name: "Request correction" }).click();
  await expect(w.getByLabel("Correction to request")).toHaveAttribute("aria-invalid", "true");
  await w.getByRole("button", { name: "Approve permit" }).click();
  await page.reload();
  const receipt = await readDownload(page, w.getByRole("button", { name: "Download receipt" }));
  expect(receipt.text).toContain(
    "Garden walk\n120 Garden Street\nDetails: Meet beside the garden gate.\nApproved",
  );
  await w.getByRole("button", { name: "Reset demo" }).click();
  await expect(w.locator("#desk-status")).toHaveText("Draft");
  await w.getByRole("button", { name: "Undo reset" }).click();
  await expect(w.locator("#desk-status")).toHaveText("Approved");
  await page.reload();
  await expect(w.locator("#desk-history li")).toHaveCount(5);
});

test("ledger reconciles the filtered detail, sorted export and empty recovery", async ({ page }) => {
  await page.goto("/demos/service-ledger/?district=South&sort=most&record=RF-205#workspace");
  const w = page.locator("#workspace");
  const record = w.getByRole("button", { name: "RF-205" });
  await expect(w.getByRole("status")).toHaveText("2 records · 10 service hours");
  await expect(record).toHaveAttribute("aria-expanded", "true");
  await expect(w.locator("#detail-RF-205 dd")).toHaveText(["1 h", "6 h", "1 h"]);
  await record.focus();
  await page.keyboard.press("Enter");
  await expect(w.locator("#detail-RF-205")).toBeHidden();
  await w.getByLabel("Sort records").selectOption("fewest");
  await expect(w.locator(".ledger-record:visible .record-toggle")).toHaveText(["RF-203", "RF-205"]);
  await page.reload();
  const download = await readDownload(page, w.getByRole("button", { name: "Download filtered CSV" }));
  expect(download.text).toBe(
    "Record,District,Service,Hours\r\nRF-203,South,Park reservation,2\r\nRF-205,South,Road repair,8\r\n",
  );
  await w.getByLabel("Service", { exact: true }).selectOption("Permit review");
  await expect(w.getByRole("status")).toHaveText("0 records · 0 service hours");
  await expect(w.getByRole("button", { name: "Download filtered CSV" })).toBeDisabled();
  await w.getByRole("button", { name: "Clear filters" }).click();
  await expect(w.getByLabel("District", { exact: true })).toBeFocused();
  await expect(w.getByRole("status")).toHaveText("6 records · 32 service hours");
});

test.describe("without scripting", () => {
  test.use({ javaScriptEnabled: false });
  test("local service guides, permit receipt and complete register stay readable", async ({ page }) => {
    await page.goto("/demos/finder/");
    const workspace = page.locator("#workspace");
    await workspace.locator('[data-service="parks"] summary').click();
    await expect(workspace.getByText("Estimated group size")).toBeVisible();
    await expect(workspace.getByRole("searchbox")).toHaveCount(0);
    await page.goto("/demos/permit-desk/");
    await expect(workspace.getByRole("link", { name: /sample permit receipt/ })).toHaveAttribute(
      "href",
      "/downloads/sample-permit-receipt.txt",
    );
    await expect(workspace.getByRole("button")).toHaveCount(0);
    await page.goto("/demos/service-ledger/");
    await expect(workspace.locator(".ledger-record:visible")).toHaveCount(6);
    await expect(workspace.getByRole("link", { name: "Download all records" })).toHaveAttribute(
      "href",
      /RF-206,North,Permit%20review,3/,
    );
    await expect(workspace.getByRole("button")).toHaveCount(0);
  });
});
