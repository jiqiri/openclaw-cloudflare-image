---
name: cf-image-guidance
description: Platform-aware guidance for OpenClaw image generation using the Cloudflare Workers AI image provider. Use when choosing image dimensions or aspect ratios for a destination platform.
user-invocable: false
disable-model-invocation: false
---

# Image sizing guidance

Use the native `image_generate` tool. Do not invent a separate image tool and do not specify a model unless the user explicitly asks for one.

When the destination platform is known, pass the matching `size` to `image_generate`:

- Blog / SEO / featured image / Open Graph: `1200x630`
- Facebook: `1200x630`
- LinkedIn: `1200x627`
- X / Twitter: `1200x675`
- YouTube thumbnail: `1280x720`
- Instagram square: `1080x1080`
- Instagram portrait/feed: `1080x1350`
- Instagram Story / Reel: `1080x1920`
- TikTok: `1080x1920`
- Pinterest: `1000x1500`

Rules:

1. User-provided size or aspect ratio always wins.
2. If the platform is stated but the size is not, use the platform default above.
3. For article, SEO, thumbnail, or featured-image requests without a platform, use `1200x630`.
4. For a generic image without a destination, use `1024x1024`.
5. Generate at the requested dimensions. Do not create at another ratio and crop afterward when the provider can generate the requested dimensions directly.
6. If the user asks for a custom size, pass that exact size when it is within the provider's supported range.
