export interface ScreenshotTarget {
  name: string;
  url: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
}

export interface VisualRegressionConfig {
  targets: ScreenshotTarget[];
  /** pixelmatch color threshold (0–1). Lower = stricter. Default: 0.1 */
  threshold?: number;
  /** Maximum allowed diff percentage (0–100). Default: 0.5 */
  maxDiffPercentage?: number;
}

export interface ResolvedConfig {
  targets: ScreenshotTarget[];
  threshold: number;
  maxDiffPercentage: number;
}

export interface EnvConfig {
  apiKey: string;
  apiUrl: string;
}

const DEFAULT_THRESHOLD = 0.1;
const DEFAULT_MAX_DIFF_PERCENTAGE = 0.5;
const DEFAULT_API_URL = "https://api.scrnpix.com";

export function resolveConfig(config: VisualRegressionConfig): ResolvedConfig {
  return {
    targets: config.targets,
    threshold: config.threshold ?? DEFAULT_THRESHOLD,
    maxDiffPercentage: config.maxDiffPercentage ?? DEFAULT_MAX_DIFF_PERCENTAGE,
  };
}

export function getEnv(): EnvConfig {
  const apiKey = process.env.SCRNPIX_API_KEY;
  if (!apiKey) {
    console.error(
      "Error: SCRNPIX_API_KEY environment variable is not set.\n" +
        "  1. Copy .env.example to .env\n" +
        "  2. Add your API key from https://scrnpix.com?ref=visual-regression-starter\n" +
        "  3. Run the command again",
    );
    process.exit(1);
  }

  const apiUrl = process.env.SCRNPIX_API_URL || DEFAULT_API_URL;

  return { apiKey, apiUrl };
}

export function targetFilename(target: ScreenshotTarget): string {
  const width = target.width ?? 1280;
  const height = target.height ?? 720;
  return `${target.name}-${width}x${height}.png`;
}
