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

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function resolveFilename(req, width, height) {
  const requested = slugify(req.filename);

  if (requested) {
    return requested.endsWith(".jpg")
      ? requested
      : `${requested}.jpg`;
  }

  return `generated-image-${width}x${height}.jpg`;
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
      if (
        !process.env.CF_WORKERS_AI_ACCOUNT ||
        !process.env.CF_WORKERS_AI_TOKEN
      ) {
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
        throw new Error(
          `Cloudflare image API ${response.status}: ${text}`
        );
      }

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          `Cloudflare returned invalid JSON: ${text}`
        );
      }

      const imageBase64 = data?.result?.image;

      if (!imageBase64) {
        throw new Error(
          `Cloudflare returned no image: ${text}`
        );
      }

      return {
        images: [
          {
            buffer: Buffer.from(imageBase64, "base64"),
            mimeType: "image/jpeg",
            fileName: resolveFilename(req, width, height)
          }
        ],
        model: MODEL
      };
    }
  });
}