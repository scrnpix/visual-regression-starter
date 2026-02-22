import { test, expect } from "@playwright/test";
import path from "node:path";
import { resolveConfig } from "../src/config.js";
import { captureCurrentScreenshots } from "../src/capture.js";
import { runComparisons } from "../src/compare.js";
import type { VisualRegressionConfig } from "../src/config.js";
import type { ComparisonResult } from "../src/compare.js";

let results: ComparisonResult[];

test.beforeAll(async () => {
  const configPath = path.resolve("visual-regression.config.ts");
  const mod = (await import(configPath)) as { default: VisualRegressionConfig };
  const config = resolveConfig(mod.default);

  await captureCurrentScreenshots(config);
  results = runComparisons(config);
});

test("all visual regression comparisons pass", () => {
  const failures = results.filter((r) => !r.passed);

  if (failures.length > 0) {
    const details = failures
      .map(
        (f) =>
          `  ${f.targetName}: ${f.diffPercentage.toFixed(3)}% diff (${f.mismatchedPixels} pixels) — see ${f.diffPath}`,
      )
      .join("\n");

    expect(failures.length, `Visual regressions detected:\n${details}`).toBe(0);
  }
});
