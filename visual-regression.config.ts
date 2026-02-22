import type { VisualRegressionConfig } from "./src/config.js";

const config: VisualRegressionConfig = {
  targets: [
    {
      name: "example-homepage",
      url: "https://example.com",
      width: 1280,
      height: 720,
    },
    {
      name: "example-homepage-mobile",
      url: "https://example.com",
      width: 375,
      height: 812,
    },
  ],

  /** pixelmatch color threshold (0–1). Lower = stricter. Default: 0.1 */
  threshold: 0.1,

  /** Maximum allowed diff percentage (0–100). Default: 0.5 */
  maxDiffPercentage: 0.5,
};

export default config;
