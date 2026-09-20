const MODEL = "@cf/black-forest-labs/flux-2-klein-4b";
const PROVIDER_ID = "cloudflare";

const ASPECT_RATIO_SIZES = {
  "1:1": "1024x1024",
  "16:9": "1024x576",
  "9:16": "576x1024",
  "4:3": "1024x768",
  "3:4": "768x1024",
  "3:2": "1024x683",
  "2:3": "683x1024"
};

function parseSize(value) {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{3,4})x(\d{3,4})$/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (width < 256 || width > 1920 || height < 256 || height > 1920) {
    return null;
  }
  return { width, height };
}

function sizeFromAspectRatio(value) {
  const size = ASPECT_RATIO_SIZES[value];
  return size ? parseSize(size) : null;
}

function resolveDimensions(req) {
  return (
    parseSize(req.size) ||
    sizeFromAspectRatio(req.aspectRatio) ||
    { width: 1200, height: 630 }
  );
}

function apiUrl() {
  const account = process.env.CF_WORKERS_AI_ACCOUNT;
  return `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${MODEL}`;
}

export default function (api) {
  api.registerImageGenerationProvider({
    id: PROVIDER_ID,
    label: "Cloudflare Workers AI",
    defaultModel: MODEL,
    models: [MODEL],

    isConfigured: () =>
      Boolean(
        process.env.CF_WORKERS_AI_ACCOUNT &&
        process.env.CF_WORKERS_AI_TOKEN
      ),

    capabilities: {
      generate: {
        maxCount: 1,
        supportsSize: true,
        supportsAspectRatio: true,
        supportsResolution: false
      },
      edit: {
        enabled: false
      },
      geometry: {
        aspectRatios: Object.keys(ASPECT_RATIO_SIZES)
      }
    },

    async generateImage(req) {
      if (!process.env.CF_WORKERS_AI_ACCOUNT || !process.env.CF_WORKERS_AI_TOKEN) {
        throw new Error(
          "Cloudflare image provider is not configured. Set CF_WORKERS_AI_ACCOUNT and CF_WORKERS_AI_TOKEN."
        );
      }

      const { width, height } = resolveDimensions(req);
      const form = new FormData();
      form.append("prompt", String(req.prompt || ""));
      form.append("width", String(width));
      form.append("height", String(height));

      const response = await fetch(apiUrl(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CF_WORKERS_AI_TOKEN}`
        },
        body: form
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Cloudflare image API ${response.status}: ${text}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Cloudflare returned invalid JSON: ${text}`);
      }

      const imageBase64 = data?.result?.image;
      if (!imageBase64) {
        throw new Error(`Cloudflare returned no image: ${text}`);
      }

      return {
        images: [
          {
            buffer: Buffer.from(imageBase64, "base64"),
            mimeType: "image/jpeg",
            fileName: `cloudflare-${width}x${height}.jpg`
          }
        ],
        model: MODEL
      };
    }
  });

  api.on("before_prompt_build", () => ({
    appendSystemContext:
      "---\n# Cloudflare Image Generation Guidance\n" +
      "When generating an image, use the image_generate tool without an explicit model unless the user explicitly requests a model. The configured primary image provider is Cloudflare Workers AI. " +
      "When the user specifies a platform or destination, pass the platform-appropriate size to image_generate. Defaults: blog/SEO/featured/OG 1200x630; Facebook 1200x630; LinkedIn 1200x627; X/Twitter 1200x675; YouTube thumbnail 1280x720; Instagram square 1080x1080; Instagram portrait/feed 1080x1350; Instagram Story/Reel 1080x1920; TikTok 1080x1920; Pinterest 1000x1500. " +
      "If the user explicitly gives a size or aspect ratio, follow it. If no platform, size, or ratio is specified, default to 1200x630 for article/thumbnail/featured-image requests and 1024x1024 for generic image requests. Do not crop after generation just to satisfy an aspect ratio when the requested dimensions can be generated directly."
  }));
}
