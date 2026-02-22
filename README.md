# Visual Regression Starter

Catch visual regressions automatically using [Scrnpix](https://scrnpix.com?ref=visual-regression-starter) baselines and `pixelmatch` diffs.

## Quickstart

```bash
# 1. Clone and install
git clone https://github.com/scrnpix/visual-regression-starter.git
cd visual-regression-starter
npm install

# 2. Add your API key
cp .env.example .env
# Edit .env and add your SCRNPIX_API_KEY

# 3. Capture baselines
npm run baseline

# 4. Detect regressions
npm run compare
```

## How It Works

1. **Baseline** — Scrnpix captures screenshots of your target URLs and saves them to `baselines/`
2. **Current** — On each comparison run, fresh screenshots are captured to `current/`
3. **Diff** — `pixelmatch` compares each current screenshot against its baseline pixel-by-pixel
4. **Pass/Fail** — If the diff percentage exceeds `maxDiffPercentage`, the comparison fails

Diff images are saved to `diffs/`. White pixels mean no change; red pixels highlight differences.

## Configuration

Edit `visual-regression.config.ts` to set your targets and thresholds:

```ts
import type { VisualRegressionConfig } from "./src/config.js";

const config: VisualRegressionConfig = {
  targets: [
    {
      name: "homepage",
      url: "https://example.com",
      width: 1280,
      height: 720,
    },
    {
      name: "homepage-mobile",
      url: "https://example.com",
      width: 375,
      height: 812,
    },
  ],
  threshold: 0.1,
  maxDiffPercentage: 0.5,
};

export default config;
```

### Target Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | string | **required** | Unique name for the screenshot |
| `url` | string | **required** | Public URL to capture |
| `width` | number | 1280 | Viewport width (100–4000) |
| `height` | number | 720 | Viewport height (100–4000) |
| `fullPage` | boolean | false | Capture the full scrollable page |

### Threshold Tuning

| Setting | Default | Description |
|---------|---------|-------------|
| `threshold` | 0.1 | pixelmatch color sensitivity (0–1). Lower = stricter matching. 0 requires exact match; 0.1 tolerates minor anti-aliasing differences. |
| `maxDiffPercentage` | 0.5 | Maximum allowed percentage of differing pixels (0–100). A page with 0.3% diff passes; 0.6% fails. |

**Tips:**
- Start with defaults (0.1 threshold, 0.5% max diff)
- If you get false positives from font rendering, increase `threshold` to 0.2
- For pixel-perfect comparisons, set `threshold: 0` and `maxDiffPercentage: 0`
- For pages with dynamic content (ads, timestamps), increase `maxDiffPercentage`

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run baseline` | Capture baseline screenshots (skips existing) |
| `npm run baseline:update` | Recapture all baselines (overwrites existing) |
| `npm run compare` | Capture current screenshots and diff against baselines |
| `npm run test` | Run comparisons via Playwright test runner |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |

## CI Setup

### GitHub Actions

The included workflow (`.github/workflows/visual-regression.yml`) runs on pushes and PRs to `main`.

**Setup:**

1. Add your API key as a repository secret: **Settings > Secrets > Actions > New secret**
   - Name: `SCRNPIX_API_KEY`
   - Value: your API key
2. Commit baselines to git (`baselines/` is tracked)
3. Push — the workflow will capture current screenshots and diff against baselines

**On failure**, diff and current images are uploaded as artifacts (14-day retention) so you can inspect exactly what changed.

### Other CI Providers

```bash
# Set SCRNPIX_API_KEY in your CI environment, then:
npm ci
npm run typecheck
npm run lint
npm run compare
```

## Interpreting Diff Images

Diff images in `diffs/` use the following colors:
- **White** — pixels match between baseline and current
- **Red** — pixels differ between baseline and current

If a comparison fails, open the diff image to see exactly which areas of the page changed.

## Known Limitations

- **Public URLs only** — Scrnpix captures pages from the cloud, so URLs must be publicly accessible
- **PNG only** — diffs are always PNG for accurate pixel comparison (no JPEG compression artifacts)
- **Sequential captures** — screenshots are captured one at a time to avoid rate limiting
- **No dynamic content handling** — pages with animations, ads, or timestamps may cause false positives; increase `maxDiffPercentage` to compensate

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `SCRNPIX_API_KEY is not set` | Copy `.env.example` to `.env` and add your key |
| `Invalid API key` | Verify your key at [scrnpix.com](https://scrnpix.com?ref=visual-regression-starter) |
| `URL must be publicly accessible` | Scrnpix can't reach localhost. Deploy or use a tunnel. |
| `Dimension mismatch` | Baseline was captured at a different size. Run `npm run baseline:update`. |
| `Baseline not found` | Run `npm run baseline` before `npm run compare`. |
| `Insufficient credits` | Top up at [scrnpix.com](https://scrnpix.com?ref=visual-regression-starter) |
| False positives from fonts | Increase `threshold` to 0.2 in config |
| False positives from dynamic content | Increase `maxDiffPercentage` in config |

## License

MIT

---

Powered by [Scrnpix](https://scrnpix.com?ref=visual-regression-starter) — [Get API Key](https://scrnpix.com?ref=visual-regression-starter)
