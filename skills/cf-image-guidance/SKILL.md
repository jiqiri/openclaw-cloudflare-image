---
name: cf-image-guidance
description: Platform-aware guidance for OpenClaw image generation using the Cloudflare Workers AI image provider. Use when choosing image dimensions, aspect ratios, or SEO-friendly filenames for a destination platform.
user-invocable: false
disable-model-invocation: false
---

# Cloudflare Image Generation Guidance

Use the native `image_generate` tool.

Do not invent a separate image generation tool.

Do not explicitly specify a model unless the user asks for a specific model. The configured image provider handles model selection.

## Filename

Always provide the `filename` parameter when calling `image_generate`.

Create the filename from the image's actual topic and purpose.

Use:
- the article or content topic
- the specific subject shown in the image
- the image role when relevant, such as featured image, hero image, infographic, or thumbnail

Rules:
- lowercase
- words separated with hyphens
- concise
- descriptive
- SEO-friendly
- unique for each image
- do not include the file extension

Examples:

- `website-speed-seo-featured`
- `core-web-vitals-optimization`
- `mobile-website-speed`
- `wordpress-speed-optimization`
- `website-performance-checklist`

Do not use generic filenames such as:

- `image`
- `photo`
- `generated-image`
- `cloudflare`
- `untitled`
- random UUIDs

Do not copy the full image-generation prompt into the filename.

When generating multiple images for the same article or topic, every image must have a different filename describing its specific subject or role.

## Platform sizes

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

## Rules

1. User-provided size always wins.
2. User-provided aspect ratio always wins.
3. If a platform is stated and no size is provided, use the platform default above.
4. For article, SEO, thumbnail, featured-image, or Open Graph requests without a platform, use `1200x630`.
5. For generic image requests without a destination, use `1024x1024`.
6. Generate directly at the requested dimensions.
7. Do not generate another ratio and crop afterward when the provider can generate the requested dimensions directly.
8. Always provide a unique SEO-friendly `filename`.