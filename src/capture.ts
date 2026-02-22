import fs from "node:fs";
import path from "node:path";
import { ScrnpixClient } from "./scrnpix-client.js";
import { targetFilename, getEnv } from "./config.js";
import type { ResolvedConfig } from "./config.js";

const BASELINES_DIR = "baselines";
const CURRENT_DIR = "current";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export async function captureBaselines(
  config: ResolvedConfig,
  options: { update?: boolean } = {},
): Promise<void> {
  const env = getEnv();
  const client = new ScrnpixClient(env);

  ensureDir(BASELINES_DIR);

  for (const target of config.targets) {
    const filename = targetFilename(target);
    const filepath = path.join(BASELINES_DIR, filename);

    if (!options.update && fs.existsSync(filepath)) {
      console.log(`  [skip] ${filename} (already exists, use --update to overwrite)`);
      continue;
    }

    console.log(`  [capture] ${filename} ...`);
    const png = await client.captureTarget(target);
    fs.writeFileSync(filepath, png);
    console.log(`  [saved]   ${filepath}`);
  }
}

export async function captureCurrentScreenshots(
  config: ResolvedConfig,
): Promise<void> {
  const env = getEnv();
  const client = new ScrnpixClient(env);

  ensureDir(CURRENT_DIR);

  for (const target of config.targets) {
    const filename = targetFilename(target);
    const filepath = path.join(CURRENT_DIR, filename);

    console.log(`  [capture] ${filename} ...`);
    const png = await client.captureTarget(target);
    fs.writeFileSync(filepath, png);
    console.log(`  [saved]   ${filepath}`);
  }
}
