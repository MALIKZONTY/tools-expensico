import { describe, expect, it } from "vitest";
import { outputFormat, targetSize } from "./process";

describe("image sizing", () => {
  it("fits within a box without upscaling", () => {
    expect(targetSize(4000, 3000, { mode: "fit", maxWidth: 1920, maxHeight: 1920 })).toEqual({ w: 1920, h: 1440 });
    expect(targetSize(800, 600, { mode: "fit", maxWidth: 1920, maxHeight: 1920 })).toEqual({ w: 800, h: 600 });
    expect(targetSize(800, 600, { mode: "fit", maxWidth: 1600, maxHeight: 1600, upscale: true })).toEqual({ w: 1600, h: 1200 });
  });
  it("scales by percentage and exact sizes", () => {
    expect(targetSize(1001, 501, { mode: "scale", percent: 50 })).toEqual({ w: 501, h: 251 });
    expect(targetSize(10, 10, { mode: "exact", width: 413, height: 531 })).toEqual({ w: 413, h: 531 });
  });
  it("chooses output formats", () => {
    expect(outputFormat("gif", "same")).toBe("png");
    expect(outputFormat("jpg", "same")).toBe("jpg");
    expect(outputFormat("png", "webp")).toBe("webp");
  });
});
