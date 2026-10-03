import { expect, test, type Page } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function makePdf(pages: number, label = "Page"): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= pages; i++) doc.addPage([595, 842]).drawText(`${label} ${i}`, { x: 72, y: 760, size: 28, font });
  return Buffer.from(await doc.save());
}

async function pngFromPage(page: Page, w = 400, h = 300): Promise<Buffer> {
  const b64 = await page.evaluate(([w, h]) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0d7a63");
    g.addColorStop(1, "#e8622c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return c.toDataURL("image/png").split(",")[1];
  }, [w, h]);
  return Buffer.from(b64, "base64");
}

const fileInput = (page: Page) => page.locator('input[type="file"]').first();
/** App alerts (excludes Next.js's route announcer, which also has role="alert"). */
const appAlert = (page: Page) => page.locator('[role="alert"]:not(#__next-route-announcer__)').first();

test("global search palette finds tools with the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+k");
  const box = page.getByRole("dialog", { name: "Search tools" }).getByRole("combobox");
  await box.fill("emi");
  await expect(page.getByRole("option", { name: /EMI Calculator/ }).first()).toBeVisible();
  await box.press("Enter");
  await expect(page).toHaveURL(/\/finance\/emi-calculator$/);
});

test("EMI calculator gives the published value", async ({ page }) => {
  await page.goto("/finance/emi-calculator");
  const amount = page.getByLabel("Loan amount", { exact: true });
  await amount.fill("1000000");
  await amount.blur();
  await page.getByLabel("Interest rate (per year)", { exact: true }).fill("8.5");
  await page.getByLabel("Loan tenure", { exact: true }).fill("20");
  await expect(page.getByText("₹8,678").first()).toBeVisible();
});

test("PDF to JPG converts every page in the browser without uploading", async ({ page }) => {
  const uploads: string[] = [];
  page.on("request", (r) => {
    if (["POST", "PUT"].includes(r.method())) uploads.push(r.url());
  });
  await page.goto("/convert/pdf-to-jpg");
  await expect(page.getByText("Select PDF file")).toBeVisible();
  await page.waitForLoadState("networkidle");
  await fileInput(page).setInputFiles({ name: "report.pdf", mimeType: "application/pdf", buffer: await makePdf(3) });
  await page.getByRole("button", { name: "Convert to JPG" }).click();
  await expect(page.getByText("3 files are ready")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("report-page-1.jpg")).toBeVisible();
  // Previews must actually load (a revoked object URL renders as a broken image).
  const preview = page.getByRole("img", { name: "Preview of report-page-1.jpg" });
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  expect(uploads).toEqual([]);
});

test("mismatched file contents are rejected with a clear message", async ({ page }) => {
  await page.goto("/convert/pdf-to-jpg");
  await page.waitForLoadState("networkidle");
  await fileInput(page).setInputFiles({ name: "fake.pdf", mimeType: "application/pdf", buffer: Buffer.from("this is not a pdf at all") });
  await expect(appAlert(page)).toContainText(/contents|recognise|isn't|accepts/i);
});

test("PDF merge combines files", async ({ page }) => {
  await page.goto("/pdf/pdf-merge");
  await page.waitForLoadState("networkidle");
  await fileInput(page).setInputFiles([
    { name: "a.pdf", mimeType: "application/pdf", buffer: await makePdf(2, "A") },
    { name: "b.pdf", mimeType: "application/pdf", buffer: await makePdf(3, "B") },
  ]);
  await expect(page.getByText("2 files · 5 pages")).toBeVisible();
  await page.getByRole("button", { name: "Merge 2 PDFs" }).click();
  await expect(page.getByText("merged.pdf", { exact: true })).toBeVisible();
  await expect(page.getByText("5 pages")).toBeVisible();
});

test("CSV viewer parses quotes and searches", async ({ page }) => {
  await page.goto("/tools/csv-viewer");
  await page.waitForLoadState("networkidle");
  const csv = 'name,city,amount\n"Rao, Asha",Pune,1200\nRavi,"Mumbai",900\nMeera,Delhi,"1,500"\n';
  await fileInput(page).setInputFiles({ name: "people.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await expect(page.getByText("3 rows · 3 columns")).toBeVisible();
  await expect(page.getByRole("cell", { name: "Rao, Asha" })).toBeVisible();
  await page.getByLabel("Search all columns").fill("mumbai");
  await expect(page.getByText("1 of 3 rows match")).toBeVisible();
});

test("CSV to JSON keeps leading zeros", async ({ page }) => {
  await page.goto("/convert/csv-to-json");
  await page.waitForLoadState("networkidle");
  await fileInput(page).setInputFiles({ name: "pins.csv", mimeType: "text/csv", buffer: Buffer.from("pin,count\n011001,5\n560034,7\n") });
  await page.getByRole("button", { name: "Convert to JSON" }).click();
  await expect(page.locator("pre").first()).toContainText('"pin": "011001"');
  await expect(page.locator("pre").first()).toContainText('"count": 5');
});

test("image compressor shrinks a PNG to WebP", async ({ page }) => {
  await page.goto("/tools/image-compressor");
  await page.waitForLoadState("networkidle");
  const png = await pngFromPage(page, 1200, 900);
  await fileInput(page).setInputFiles({ name: "banner.png", mimeType: "image/png", buffer: png });
  await page.getByLabel("Output format").selectOption("webp");
  await page.getByRole("button", { name: "Compress images" }).click();
  await expect(page.getByRole("button", { name: "Download" }).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText(/% smaller/)).toBeVisible();
});

test("JSON formatter reports a trailing comma with its line", async ({ page }) => {
  await page.goto("/developer/json-formatter");
  const input = page.getByLabel("JSON input", { exact: true });
  await input.fill('{\n  "a": 1,\n}');
  await expect(appAlert(page)).toContainText("line 3");
  await expect(appAlert(page)).toContainText(/trailing comma/i);
  await input.fill('{"b":2,"a":[1,2]}');
  await expect(page.getByLabel("Formatted JSON", { exact: true })).toHaveValue('{\n  "b": 2,\n  "a": [\n    1,\n    2\n  ]\n}');
});

test("notes persist across reloads", async ({ page }) => {
  await page.goto("/notes");
  await page.getByRole("button", { name: "New note" }).first().click();
  await page.getByLabel("Note title").fill("Groceries");
  await page.getByLabel("Note content").fill("milk\neggs");
  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.getByRole("button", { name: /Groceries/ }).first()).toBeVisible();
  await expect(page.getByText(/stored locally in this browser/)).toBeVisible();
});

test("expense splitter settles a trip", async ({ page }) => {
  await page.goto("/finance/expense-splitter");
  await page.getByLabel("Description").fill("Hotel");
  await page.getByLabel("Amount in rupees").fill("9000");
  await page.getByRole("button", { name: "Add expense" }).click();
  await expect(page.getByText("₹6,000.00").first()).toBeVisible();
  await expect(page.getByText(/owes ₹3,000.00/).first()).toBeVisible();
});

test("dark mode toggle persists", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("html").getAttribute("data-theme");
  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  const after = await page.locator("html").getAttribute("data-theme");
  expect(after).not.toBe(before);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", after!);
});

test("security headers are present", async ({ request }) => {
  const res = await request.get("/");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["x-powered-by"]).toBeUndefined();
});

test("structured data and canonical are present on tool pages", async ({ page }) => {
  await page.goto("/convert/pdf-to-jpg");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://expensico.com/convert/pdf-to-jpg");
  const types = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent || "{}")["@type"]));
  expect(types).toEqual(expect.arrayContaining(["WebApplication", "FAQPage", "BreadcrumbList"]));
});

test("regex tester stops catastrophic backtracking instead of freezing", async ({ page }) => {
  await page.goto("/developer/regex-tester");
  await page.getByLabel("Regular expression").fill("(a+)+$");
  await page.getByLabel("Test text").fill("a".repeat(40) + "b");
  await expect(page.getByText("The pattern took too long")).toBeVisible({ timeout: 10_000 });
  // The page is still responsive and works with a sane pattern afterwards.
  await page.getByLabel("Regular expression").fill("a+");
  await expect(page.getByText(/^1 match$/)).toBeVisible();
});

test("PDF viewer renders pages with selectable text", async ({ page }) => {
  await page.goto("/tools/pdf-viewer");
  await page.waitForLoadState("networkidle");
  await fileInput(page).setInputFiles({ name: "doc.pdf", mimeType: "application/pdf", buffer: await makePdf(3, "Viewer page") });
  await expect(page.getByText("/ 3")).toBeVisible();
  await expect(page.locator(".pdf-text-layer").first()).toContainText("Viewer page 1", { timeout: 15_000 });
});

test("Excel viewer shows every sheet", async ({ page }) => {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Name", "Amount"], ["Asha", 1200], ["Ravi", 900]]), "Q1");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Name", "Amount"], ["Meera", 450]]), "Q2");
  const buffer = Buffer.from(XLSX.write(wb, { bookType: "xlsx", type: "array" }));
  await page.goto("/tools/excel-viewer");
  await page.waitForLoadState("networkidle");
  await fileInput(page).setInputFiles({ name: "sales.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer });
  await expect(page.getByRole("cell", { name: "Asha" })).toBeVisible();
  await page.getByRole("tab", { name: "Q2" }).click();
  await expect(page.getByRole("cell", { name: "Meera" })).toBeVisible();
});

test("to-do list survives a reload", async ({ page }) => {
  await page.goto("/productivity/todo-list");
  await page.getByLabel("New task").fill("Pay electricity bill");
  await page.getByRole("button", { name: "Add" }).click();
  await page.waitForTimeout(800);
  await page.reload();
  await expect(page.getByLabel("Task text").first()).toHaveValue("Pay electricity bill");
});

test("light theme is the default even when the device prefers dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  // The header toggle switches to dark, and the choice survives a reload.
  await page.getByRole("button", { name: "Toggle dark mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("validators open with a valid sample and can show an error example", async ({ page }) => {
  await page.goto("/developer/yaml-validator");
  await expect(page.getByText("Valid YAML", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try an example with an error" }).click();
  await expect(page.getByText(/Invalid YAML — line 12/)).toBeVisible();

  await page.goto("/developer/json-validator");
  await expect(page.getByText("Valid JSON", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Try an example with an error" }).click();
  await expect(appAlert(page)).toContainText(/trailing comma|line 6/i);
});

test("homepage search suggestions are not clipped by the hero", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  await page.getByRole("combobox").first().fill("word co");
  const option = page.getByRole("option", { name: /Word Counter/ }).first();
  await expect(option).toBeVisible();
  // The whole suggestion row must be painted: the topmost element at its bottom edge belongs to it.
  const box = (await option.boundingBox())!;
  const insideOption = await page.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return Boolean(el?.closest('[role="option"]'));
  }, { x: box.x + 20, y: box.y + box.height - 4 });
  expect(insideOption).toBe(true);
});

test("category menu opens on hover and closes when the pointer leaves it", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const menu = page.locator("#menu-pdf");
  await page.getByRole("button", { name: "PDF Tools" }).hover();
  await expect(menu).toBeVisible();
  // Moving into the card keeps it open.
  await page.mouse.move(720, 250, { steps: 8 });
  await page.waitForTimeout(400);
  await expect(menu).toBeVisible();
  // Moving to the empty area beside the card closes it.
  await page.mouse.move(15, 300, { steps: 8 });
  await expect(menu).toBeHidden();
  // Hover again, then leave downwards onto the page.
  await page.getByRole("button", { name: "PDF Tools" }).hover();
  await expect(menu).toBeVisible();
  await page.mouse.move(720, 880, { steps: 12 });
  await expect(menu).toBeHidden();
});
