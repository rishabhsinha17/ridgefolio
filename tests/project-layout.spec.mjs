import { test, expect } from "./browser.mjs";

test("project captions stay inside their artwork across the tablet breakpoint", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/work/industrial-parks/");
  for (const width of [700, 701, 820, 991, 992, 1280]) {
    await page.setViewportSize({ width, height: 850 });
    const boxes = await page.locator("#slider").evaluate(slider => {
      const caption = slider.querySelector("#caption").getBoundingClientRect();
      const title = slider.querySelector("#white-block").getBoundingClientRect();
      const frame = slider.getBoundingClientRect();
      return {
        inside: caption.left >= frame.left && caption.right <= frame.right &&
          caption.top >= frame.top && caption.bottom <= frame.bottom,
        separate: caption.right <= title.left || caption.bottom <= title.top,
      };
    });
    expect(boxes, String(width)).toEqual({ inside: true, separate: true });
  }

  await page.goto("/for/partners/");
  for (const width of [390, 820, 991, 992, 1060, 1440]) {
    await page.setViewportSize({ width, height: 850 });
    const fits = await page.locator(".partner-document").evaluate(card => {
      const frame = card.getBoundingClientRect();
      return [...card.querySelectorAll("img, span")].every(child => {
        const box = child.getBoundingClientRect();
        return box.left >= frame.left && box.right <= frame.right + 1 &&
          box.top >= frame.top && box.bottom <= frame.bottom + 1;
      });
    });
    expect(fits, String(width)).toBe(true);
  }
});

test("map place labels clear park symbols and the map edges at each scale", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 850 });
  await page.goto("/work/industrial-parks/");
  const map = page.locator(".atlas.interactive .atlas-viewport");
  await expect(map).toBeVisible();
  async function checkLabels() {
    await expect.poll(() => map.evaluate(viewport => {
      const box = element => element.getBoundingClientRect();
      const frame = box(viewport);
      const labels = [...viewport.querySelectorAll(".atlas-place > span")]
        .filter(element => getComputedStyle(element).visibility === "visible");
      const symbols = Array.from(viewport.querySelectorAll(".atlas-symbol,.cluster-place"), box);
      return labels.length > 0 && labels.every(element => {
        const rect = box(element);
        return rect.left >= frame.left && rect.right <= frame.right &&
          rect.top >= frame.top && rect.bottom <= frame.bottom &&
          symbols.every(mark => rect.left >= mark.right || rect.right <= mark.left ||
            rect.top >= mark.bottom || rect.bottom <= mark.top);
      });
    })).toBe(true);
  }
  await checkLabels();
  await page.getByRole("button", {name: "Zoom in", exact: true}).click();
  await checkLabels();
  await page.getByRole("button", {name: "Show the whole archipelago"}).click();
  await page.setViewportSize({ width: 820, height: 900 });
  await checkLabels();
});

test("home section copy clears the pinned return button on compact desktops", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [992, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 810 });
    const title = page.locator("#our-work-header h3");
    await title.evaluate(el => scrollBy({top: el.getBoundingClientRect().top - 181, behavior: "instant"}));
    const link = page.getByRole("link", {name: "Back to the top", exact: true});
    await expect(link).toBeVisible();
    const arrow = await link.boundingBox();
    const heading = await title.boundingBox();
    expect(arrow.y, String(width)).toBeCloseTo(180, 0);
    expect(heading.x - (arrow.x + arrow.width), String(width)).toBeGreaterThanOrEqual(8);
  }
});

test('the handset moves with scroll within the right side of the map', async ({page}) => {
  await page.goto('/#responsive');
  const art = page.locator('#responsive .responsive-shots');
  await page.emulateMedia({reducedMotion:"no-preference"});
  const offsets = [];
  for (const fraction of [-.6, 0, .35, .7, 1]) {
    const box = await art.evaluate((stage, fraction) => {
      const docTop = stage.getBoundingClientRect().top + scrollY;
      scrollTo({top:docTop - innerHeight * fraction, behavior:'instant'});
      const frame = stage.getBoundingClientRect();
      const map = stage.querySelector('.shot1').getBoundingClientRect();
      const phone = stage.querySelector('.shot2').getBoundingClientRect();
      return {
        outerRight:frame.right - phone.right, outerBottom:frame.bottom - phone.bottom,
        overlap:(map.right - phone.left) / map.width, relativeTop:(phone.top - map.top) / map.height,
        inside:map.left >= 0 && phone.right <= document.documentElement.clientWidth + 1,
      };
    }, fraction);
    expect(Math.abs(box.outerRight)).toBeLessThan(1);
    offsets.push(box.outerBottom);
    expect(box.outerBottom).toBeGreaterThanOrEqual(-1);
    expect(box.overlap).toBeGreaterThan(.05);
    expect(box.overlap).toBeLessThan(.25);
    expect(box.relativeTop).toBeGreaterThan(.15);
    expect(box.inside).toBe(true);
  }
  expect(Math.max(...offsets) - Math.min(...offsets)).toBeGreaterThan(18);
  await page.emulateMedia({reducedMotion:"reduce"});
  const gap = await art.evaluate(stage => stage.getBoundingClientRect().bottom - stage.querySelector('.shot2').getBoundingClientRect().bottom);
  expect(Math.abs(gap)).toBeLessThan(1);
});
