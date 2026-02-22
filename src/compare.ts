import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { targetFilename } from "./config.js";
import type { ResolvedConfig } from "./config.js";

const BASELINES_DIR = "baselines";
const CURRENT_DIR = "current";
const DIFFS_DIR = "diffs";

export interface ComparisonResult {
  targetName: string;
  baselinePath: string;
  currentPath: string;
  diffPath: string;
  totalPixels: number;
  mismatchedPixels: number;
  diffPercentage: number;
  passed: boolean;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function compareImages(
  baselineBuffer: Buffer,
  currentBuffer: Buffer,
  threshold: number,
): { mismatchedPixels: number; diffPng: PNG; totalPixels: number } {
  const baseline = PNG.sync.read(baselineBuffer);
  const current = PNG.sync.read(currentBuffer);

  if (baseline.width !== current.width || baseline.height !== current.height) {
    throw new Error(
      `Dimension mismatch: baseline is ${baseline.width}x${baseline.height}, ` +
        `current is ${current.width}x${current.height}. ` +
        `Run "npm run baseline:update" to recapture baselines.`,
    );
  }

  const { width, height } = baseline;
  const diffPng = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    baseline.data,
    current.data,
    diffPng.data,
    width,
    height,
    { threshold },
  );

  return { mismatchedPixels, diffPng, totalPixels: width * height };
}

export function runComparisons(config: ResolvedConfig): ComparisonResult[] {
  ensureDir(DIFFS_DIR);

  const results: ComparisonResult[] = [];

  for (const target of config.targets) {
    const filename = targetFilename(target);
    const baselinePath = path.join(BASELINES_DIR, filename);
    const currentPath = path.join(CURRENT_DIR, filename);
    const diffPath = path.join(DIFFS_DIR, filename);

    if (!fs.existsSync(baselinePath)) {
      throw new Error(
        `Baseline not found: ${baselinePath}. Run "npm run baseline" first.`,
      );
    }

    if (!fs.existsSync(currentPath)) {
      throw new Error(
        `Current screenshot not found: ${currentPath}. Capture failed for "${target.name}".`,
      );
    }

    const baselineBuffer = fs.readFileSync(baselinePath);
    const currentBuffer = fs.readFileSync(currentPath);

    const { mismatchedPixels, diffPng, totalPixels } = compareImages(
      baselineBuffer,
      currentBuffer,
      config.threshold,
    );

    const diffPercentage = (mismatchedPixels / totalPixels) * 100;
    const passed = diffPercentage <= config.maxDiffPercentage;

    fs.writeFileSync(diffPath, PNG.sync.write(diffPng));

    results.push({
      targetName: target.name,
      baselinePath,
      currentPath,
      diffPath,
      totalPixels,
      mismatchedPixels,
      diffPercentage,
      passed,
    });
  }

  return results;
}
