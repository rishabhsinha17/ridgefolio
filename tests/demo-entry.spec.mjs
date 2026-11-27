import { test, expect } from "./browser.mjs";

for (const [slug, firstControl] of [
  ["finder", "#service-query"],
  ["permit-desk", "#pd-name"],
  ["service-ledger", "#district"],
]) {
  test(`${slug} entry, working controls and return navigation`, async ({page, hasTouch, baseURL}) => {
    test.setTimeout(60000); // Two independent navigation paths and a return trip.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const path = "/demos/" + slug + "/";
    const workspace = page.locator("#workspace");
    const up = page.locator("#down-arrow .up");

    async function enter(link) {
      if (hasTouch) await link.tap();
      else { await link.focus(); await link.press("Enter"); }
      await expect.poll(() => page.url()).toBe(new URL(path+"#workspace", baseURL).href);
      await expect(workspace).toBeFocused();
      await expect.poll(() => workspace.evaluate(el => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.top < innerHeight / 3 && el.contains(document.elementFromPoint(r.left + 10,r.top + 10));
      })).toBe(true);
    }

    await page.goto("/demos/", {waitUntil:"domcontentloaded"});
    await enter(page.locator(`a[href="${path}#workspace"]`).first());
    await page.goto(path, {waitUntil:"domcontentloaded"});
    await enter(page.locator(".demo-launch a"));
    await page.keyboard.press("Tab");
    await expect(page.locator(firstControl)).toBeFocused();

    for (const fraction of [0.1,0.5,0.85]) {
      await workspace.evaluate((el, fraction) => {
        const b = el.getBoundingClientRect();
        scrollTo({top:scrollY + b.top + b.height * fraction - innerHeight / 2, behavior:"instant"});
      },fraction);
      await expect.poll(() => up.evaluate(link => {
        const a=link.getBoundingClientRect(), w=document.getElementById("workspace").getBoundingClientRect();
        const blocked=a.left<w.right && a.right>w.left && a.top<w.bottom && a.bottom>w.top;
        const styles=getComputedStyle(link);
        const hit=link.contains(document.elementFromPoint(a.x+a.width/2,a.y+a.height/2));
        if (document.documentElement.classList.contains("ref-contact-docked")) return false;
        return blocked
          ? styles.visibility==="hidden" && styles.opacity==="0" && link.inert &&
            link.tabIndex===-1 && link.getAttribute("aria-hidden")==="true" && !hit
          : styles.visibility==="visible" && styles.opacity==="1" && !link.inert &&
            link.tabIndex===0 && link.getAttribute("aria-hidden")==="false" && hit;
      })).toBe(true);
    }
    // Exercise a real field with the site's floating controls present.
    if (slug === "service-ledger") {
      await page.locator(firstControl).selectOption("North");
      const clear = page.locator("#ledger-clear");
      if (hasTouch) await clear.tap(); else await clear.click();
      await expect(page.locator(firstControl)).toHaveValue("All districts");
    } else {
      const input = page.locator(firstControl);
      if (hasTouch) await input.tap(); else await input.click();
      await expect(input).toBeFocused();
      await input.fill(slug === "finder" ? "permit" : "Harbor art fair");
    }

    // Put the complete application above the viewport; the original shortcut returns.
    await workspace.evaluate(el => scrollTo({top:scrollY+el.getBoundingClientRect().bottom+48,behavior:"instant"}));
    await expect(up).toBeVisible();
    await expect(up).toHaveAttribute("aria-hidden","false");
    await expect(up).toHaveJSProperty("inert",false);
    await expect(up).toHaveAttribute("tabindex","0");
    await expect.poll(() => up.evaluate(link => {
      const b=link.getBoundingClientRect();return b.width>=44&&b.height>=44&&link.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));
    })).toBe(true);
    if (hasTouch) await up.tap(); else {await up.focus();await up.press("Enter");}
    await expect.poll(() => page.url()).toBe(new URL(path+"#main", baseURL).href);
    await expect(page.locator("#main")).toBeFocused();
  });
}
