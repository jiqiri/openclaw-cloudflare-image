# OpenClaw Cloudflare Workers AI Image

Native OpenClaw image-generation provider backed by Cloudflare Workers AI `@cf/black-forest-labs/flux-2-klein-4b`.

## Features

- Native `image_generate` provider: `cloudflare`
- Direct generation at the requested width/height
- Common aspect-ratio support: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2`, `2:3`
- Platform-aware defaults via the bundled OpenClaw skill
- Cloudflare Workers AI backend, with no third-party image gateway

## Requirements

Set these environment variables for the OpenClaw Gateway:

- `CF_WORKERS_AI_ACCOUNT`
- `CF_WORKERS_AI_TOKEN`

Recommended location:

```bash
~/.openclaw/.env
```

Example:

```dotenv
CF_WORKERS_AI_ACCOUNT=your-cloudflare-account-id
CF_WORKERS_AI_TOKEN=your-cloudflare-api-token
```

## Install from ClawHub

```bash
openclaw plugins install clawhub:openclaw-cloudflare-image
openclaw plugins enable cloudflare-image
openclaw gateway restart
```

## OpenClaw config

Set Cloudflare as the primary image provider:

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

Check the active image providers with:

```text
/tool image_generate action=list
```

The provider should show:

```text
cloudflare (default @cf/black-forest-labs/flux-2-klein-4b)
configured: yes
```

## Usage

The agent can use the native `image_generate` tool. Examples:

```text
Create a cute white cat.
```

```text
Create a 16:9 YouTube thumbnail about website optimization.
```

```text
Create a 1200x630 featured image for an SEO article about website optimization.
```

When the user specifies a size, use it. When only a platform or content type is specified, the bundled skill supplies a sensible default.

### Platform defaults

| Platform / use case | Default size |
| --- | --- |
| Blog / SEO featured image | 1200x630 |
| Open Graph / social link preview | 1200x630 |
| Facebook | 1200x630 |
| LinkedIn | 1200x627 |
| X / Twitter | 1200x675 |
| YouTube thumbnail | 1280x720 |
| Instagram square | 1080x1080 |
| Instagram portrait | 1080x1350 |
| Instagram Story / Reel | 1080x1920 |
| TikTok | 1080x1920 |
| Pinterest | 1000x1500 |

These defaults are used only when the user does not specify another size.

## Troubleshooting

If `image_generate` still uses another provider, check:

```bash
openclaw config get agents.defaults.mediaModels.image
```

If Cloudflare shows `configured: no`, verify the Gateway environment:

```bash
openclaw gateway restart
```

and confirm the two required variables are available to the Gateway.
