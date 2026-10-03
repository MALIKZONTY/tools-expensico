import { expect, test } from "@playwright/test";

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440];
const PAGES = [
  "/",
  "/tools",
  "/convert",
  "/pdf",
  "/finance",
  "/notes",
  "/guides/ctc-vs-in-hand-salary",
  "/privacy-policy",
  "/convert/pdf-to-jpg",
  "/tools/csv-viewer",
  "/tools/image-compressor",
  "/finance/emi-calculator",
  "/finance/salary-calculator",
  "/finance/expense-splitter",
  "/finance/debt-payoff-calculator",
  "/developer/json-formatter",
  "/developer/regex-tester",
  "/developer/color-converter",
  "/productivity/word-counter",
  "/productivity/qr-code-generator",
  "/productivity/todo-list",
  "/productivity/date-calculator",
];

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }) => {
    // Visits every page in PAGES, so it needs more than the default per-test budget.
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 900 });
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        const offenders = [...document.querySelectorAll("body *")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.right <= window.innerWidth + 1) return false;
            // Elements inside intentionally scrollable containers are fine.
            let p: HTMLElement | null = el.parentElement;
            while (p) {
              const ox = getComputedStyle(p).overflowX;
              if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") return false;
              p = p.parentElement;
            }
            return true;
          })
          .slice(0, 3)
          .map((el) => `${el.tagName.toLowerCase()}.${String((el as HTMLElement).className).slice(0, 80)}`);
        return { scroll: doc.scrollWidth, client: doc.clientWidth, offenders };
      });
      expect(overflow.scroll, `${path} @${width}: ${overflow.offenders.join(" | ")}`).toBeLessThanOrEqual(overflow.client + 1);
      await expect(page.locator("h1").first(), `${path} has an h1`).toBeVisible();
    }
  });
}

test("mobile menu opens and navigates @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const nav = page.locator("#mobile-nav");
  await nav.locator("summary", { hasText: "Finance Calculators" }).click();
  await nav.getByRole("link", { name: /See all finance calculators/ }).click();
  await expect(page).toHaveURL(/\/finance$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Finance calculators/);
});

test("touch targets on primary buttons are at least 40px tall @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/convert/pdf-to-jpg");
  const box = await page.getByText("Select PDF file").boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(40);
});
