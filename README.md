# OpenClaw Cloudflare Workers AI Image

Native OpenClaw image-generation provider backed by Cloudflare Workers AI `@cf/black-forest-labs/flux-2-klein-4b`.

## Features

- Native `image_generate` provider: `cloudflare`
- Direct generation at requested width/height
- Aspect-ratio mapping for common ratios
- Platform-aware defaults via a bundled OpenClaw skill
- Cloudflare-hosted model, no third-party model gateway required
- Default article/thumbnail size: 1200x630

## Required environment

- `CF_WORKERS_AI_ACCOUNT`
- `CF_WORKERS_AI_TOKEN`

## OpenClaw config

Set the image provider primary to:

```json5
{
  "agents": {
    "defaults": {
      "mediaModels": {
        "image": {
          "primary": "cloudflare/@cf/black-forest-labs/flux-2-klein-4b"
        }
      }
    }
  }
}
```

## Test

In Control UI:

```text
/tool image_generate action=list
```

Then:

```text
Create a YouTube thumbnail about website optimization.
```

The agent guidance should select `1280x720` unless the user specifies another size.
