import { test, expect } from "./browser.mjs";
import { readFile } from "node:fs/promises";

const url = "/demos/permit-desk/#workspace";

test("staff can trace two revision requests to the final receipt and undo a reset", async ({ page }) => {
  await page.goto(url);
  const submit = () => page.getByRole("button", { name: /^(Submit application|Resubmit correction)$/ }).click();
  const request = async reason => {
    await page.getByLabel("Correction to request").fill(reason);
    await page.getByRole("button", { name: "Request correction", exact: true }).click();
  };

  await page.getByLabel("Event name").fill("Canal art fair");
  await page.getByLabel("Event date").fill("2028-05-20");
  await page.getByLabel("Expected attendance").fill("80");
  await page.getByLabel("Event plan").fill("An outdoor art fair.");
  await page.reload();
  await expect(page.getByLabel("Event name")).toHaveValue("Canal art fair");
  await submit();
  await request("Identify the public entrance.");
  await page.getByLabel("Event location").fill("Harbor Square, east entrance");
  await submit();

  const changes = page.locator("#pd-changed-fields");
  await expect(changes).toContainText("Previously: Harbor Square");
  await expect(changes).toContainText("Now: Harbor Square, east entrance");
  await page.getByLabel("Correction to request").fill("Update the expected headcount.");
  await page.reload();
  await expect(page.getByLabel("Correction to request")).toHaveValue("Update the expected headcount.");
  await page.getByRole("button", {name:"Request correction", exact:true}).click();
  await page.getByLabel("Expected attendance").fill("95");
  await submit();
  await expect(changes).toContainText("Previously: 80");
  await expect(changes).toContainText("Now: 95");
  await expect(changes).not.toContainText("Event location");
  await page.getByRole("button", {name:"Approve permit"}).click();
  await page.reload();
  await expect(page.locator("#desk-status")).toHaveText("Approved");
  await expect(page.locator("#desk-history li")).toHaveCount(7);

  const pending = page.waitForEvent("download");
  await page.getByRole("button", {name:"Download receipt"}).click();
  const file = await pending;
  expect(file.suggestedFilename()).toBe("sample-permit-receipt.txt");
  const text = await readFile(await file.path(), "utf8");
  for (const value of ["FICTIONAL PERMIT","RF-101","Approved revision: 3","Event date: 2028-05-20",
    "Expected attendance: 95","Identify the public entrance.","Update the expected headcount.",
    "Expected attendance: 80 → 95","Event location: Harbor Square → Harbor Square, east entrance","Staff approved revision 3"]) {
    expect(text).toContain(value);
  }
  expect(text.indexOf("Applicant submitted revision 1")).toBeLessThan(text.indexOf("Applicant submitted revision 3"));
  await page.getByRole("button",{name:"Reset demo"}).click();
  await expect(page.getByLabel("Event name")).toHaveValue("Harbor market");
  await page.getByRole("button",{name:"Undo reset"}).click();
  await expect(page.locator("#desk-status")).toHaveText("Approved");
  await expect(page.locator("#pd-record-fields")).toContainText("Canal art fair");
});

test("invalid intake, a blank staff note and unavailable tab storage leave the case usable", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window,"sessionStorage",{get(){throw new DOMException("Blocked","SecurityError");}}));
  await page.goto(url);
  await expect(page.locator("#pd-local")).toContainText("Keep this page open");
  await page.getByLabel("Event name").fill("   ");
  await page.getByLabel("Expected attendance").fill("1.5");
  await page.getByRole("button",{name:"Submit application"}).click();
  await expect(page.getByLabel("Event name")).toBeFocused();
  await expect(page.getByLabel("Expected attendance")).toHaveAttribute("aria-invalid","true");
  await expect(page.locator("#desk-history li")).toHaveCount(1);
  await page.getByLabel("Event name").fill("Book fair");
  await page.getByLabel("Expected attendance").fill("100");
  await page.getByRole("button",{name:"Submit application"}).click();
  await page.getByLabel("Correction to request").fill("  ");
  await page.getByRole("button",{name:"Request correction",exact:true}).click();
  await expect(page.getByLabel("Correction to request")).toBeFocused();
  await expect(page.locator("#pd-note-error")).toHaveText("Tell the applicant what to change.");
  await expect(page.locator("#desk-history li")).toHaveCount(2);
  await page.getByRole("button",{name:"Approve permit"}).click();
  await expect(page.getByRole("button",{name:"Download receipt"})).toBeVisible();
});
