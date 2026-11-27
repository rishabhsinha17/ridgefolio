import {test, expect} from "./browser.mjs";

test("research figures and the park chart reserve room for their art and links", async ({page}) => {
  await page.emulateMedia({reducedMotion:"reduce"});
  const compact = page.viewportSize().width <= 640;
  for (const [url, plates] of [
    ["/work/evaluation/", [
      ["#blog-lg-img", "monitor-strata", ".pixel-btn a", compact],
      ["#project-end-image", "monitor-confidence", ".plate-credit", compact],
      [".research-figure", "monitor-strata", "figcaption", true],
    ]],
    ["/practice/", [["[data-about-plate]", "regional-status", ".plate-credit", compact]]],
  ]) {
    await page.goto(url);
    for (const [selector, stem, label, narrow] of plates) {
      const panel=page.locator(selector);
      const image=panel.locator("picture img");
      await expect.poll(()=>image.evaluate(i=>i.complete && i.naturalWidth>0)).toBe(true);
      await expect(image).toHaveJSProperty("currentSrc",new URL("/assets/project-evidence/"+stem+(narrow?"-compact":"")+".svg",page.url()).href);
      const geometry=await panel.evaluate((el,label)=>{
        const outer=el.getBoundingClientRect(),img=el.querySelector("picture img").getBoundingClientRect();
        const caption=el.querySelector(label).getBoundingClientRect();
        return {
          overflow:Math.max(0,outer.left-img.left,img.right-outer.right,outer.top-img.top,img.bottom-outer.bottom),
          overlap:Math.min(caption.right,img.right)>Math.max(caption.left,img.left)+1 &&
            Math.min(caption.bottom,img.bottom)>Math.max(caption.top,img.top)+1,
        };
      },label);
      expect(geometry.overflow,selector).toBeLessThan(2);
      expect(geometry.overlap,selector).toBe(false);
    }
  }
});
