import path from "node:path";
import { resolveConfig } from "./config.js";
import { captureBaselines, captureCurrentScreenshots } from "./capture.js";
import { runComparisons } from "./compare.js";
import type { VisualRegressionConfig } from "./config.js";

async function loadConfig() {
  const configPath = path.resolve("visual-regression.config.ts");
  const mod = (await import(configPath)) as { default: VisualRegressionConfig };
  return resolveConfig(mod.default);
}

async function baseline(update: boolean) {
  console.log(update ? "Updating baselines..." : "Capturing baselines...");
  const config = await loadConfig();
  await captureBaselines(config, { update });
  console.log("Done.");
}

async function compare() {
  console.log("Capturing current screenshots...");
  const config = await loadConfig();
  await captureCurrentScreenshots(config);

  console.log("\nComparing against baselines...");
  const results = runComparisons(config);

  let hasFailures = false;

  for (const result of results) {
    const status = result.passed ? "PASS" : "FAIL";
    const pct = result.diffPercentage.toFixed(3);
    console.log(`  [${status}] ${result.targetName} — ${pct}% diff (${result.mismatchedPixels} pixels)`);

    if (!result.passed) {
      console.log(`         diff saved: ${result.diffPath}`);
      hasFailures = true;
    }
  }

  if (hasFailures) {
    console.error("\nVisual regression detected. Check diff images above.");
    process.exit(1);
  }

  console.log("\nAll comparisons passed.");
}

const command = process.argv[2];
const flags = process.argv.slice(3);

switch (command) {
  case "baseline":
    await baseline(flags.includes("--update"));
    break;
  case "compare":
    await compare();
    break;
  default:
    console.error("Usage: tsx src/cli.ts <baseline|compare> [--update]");
    process.exit(1);
}
