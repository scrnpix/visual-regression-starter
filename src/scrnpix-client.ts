import type { ScreenshotTarget, EnvConfig } from "./config.js";

const ERROR_MESSAGES: Record<string, string> = {
  missing_url_param: "The target URL is missing. Check your visual-regression.config.ts.",
  url_not_public: "The target URL must be publicly accessible. Scrnpix cannot reach localhost or private URLs.",
  missing_api_key: "API key is missing. Set SCRNPIX_API_KEY in your .env file.",
  invalid_api_key: "Invalid API key. Check your SCRNPIX_API_KEY in .env.",
  insufficient_credits: "Insufficient credits. Top up at https://scrnpix.com?ref=visual-regression-starter",
  rate_limit_exceeded: "Rate limit exceeded. Wait a moment and try again.",
  rendering_error: "Rendering failed. The page may be unreachable or timing out.",
};

const STATUS_FALLBACKS: Record<number, string> = {
  401: "Invalid or missing API key. Check your SCRNPIX_API_KEY in .env.",
  402: "Insufficient credits. Top up at https://scrnpix.com?ref=visual-regression-starter",
  429: "Rate limit exceeded. Wait a moment and try again.",
  500: "Scrnpix server error. Try again later.",
};

export class ScrnpixClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(env: EnvConfig) {
    this.apiKey = env.apiKey;
    this.apiUrl = env.apiUrl;
  }

  async captureTarget(target: ScreenshotTarget): Promise<Buffer> {
    const url = new URL("/screenshot", this.apiUrl);
    url.searchParams.set("url", target.url);
    url.searchParams.set("format", "png");

    if (target.width) url.searchParams.set("width", String(target.width));
    if (target.height) url.searchParams.set("height", String(target.height));
    if (target.fullPage) url.searchParams.set("full_page", "true");

    const response = await fetch(url.toString(), {
      headers: { "X-KEY": this.apiKey },
    });

    if (!response.ok) {
      let errorCode = "unknown";
      try {
        const body = (await response.json()) as { error?: string };
        errorCode = body.error ?? errorCode;
      } catch {
        // response body may not be JSON
      }

      const message =
        ERROR_MESSAGES[errorCode] ??
        STATUS_FALLBACKS[response.status] ??
        `Screenshot failed (HTTP ${response.status}): ${errorCode}`;

      throw new Error(`[${target.name}] ${message}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
