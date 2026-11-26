// Exercise the site locally. Desktop protocol handlers must stay outside browser tests.
import { test as base, expect } from "@playwright/test";

export const test = base.extend({
  context: async ({ context, baseURL }, use) => {
    await context.addInitScript(() => {
      const externalProtocol = url => url && !/^(https?:|blob:|data:|about:)/i.test(url);
      function preventHandoff(event) {
        const target = event.type === "submit"
          ? (event.submitter?.hasAttribute("formaction") ? event.submitter.formAction : event.target.action)
          : event.target.closest?.("a[href]")?.href;
        if (externalProtocol(target)) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }
      for (const type of ["click", "auxclick", "submit"]) {
        document.addEventListener(type, preventHandoff, true);
      }
    });
    const origin = new URL(baseURL).origin;
    await context.route(/^https?:/, route => {
      return new URL(route.request().url()).origin === origin ? route.continue() : route.abort();
    });
    await use(context);
  },
});
export { expect };
