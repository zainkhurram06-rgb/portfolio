# Zain Khurram · Portfolio

Personal portfolio for Zain Khurram, growth and digital marketer based in Karachi.

The whole site is one file: `index.html`. Open it in a browser, or host it on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's on the page

Dotted paper background, black ink, Arial Black headlines and flat colour cards.

- **Hero**: the "Portfolio 2026" wordmark and a 3D collage of the real VisaPro creatives (a printed ad and a phone post) that reacts to the mouse.
- **About**: short bio, roles, email and phone, a 3D profile badge on a lanyard you can drag, tools and what I do.
- **Work**: four projects (VisaPro, Startup Ninja, Onease, my e-commerce stores). Each has the brief, what I did, my part, a visual and a strip of work samples.
- **Gallery**: every piece of work in one wall, with filters per project. Any image opens bigger in a viewer with arrows.
- **How I work**: four steps.
- **Cedar Executive Business Society** and **Why me** cards.
- **Contact**: email, phone, copy button and Karachi local time.

## How it works

- Headlines use Arial Black and body text uses Arial. Archivo (Google Fonts) is a fallback for phones without Arial Black.
- 3D uses [three.js](https://threejs.org) r169 from the jsDelivr CDN. Scrolling is the browser's own.
- Without WebGL, the hero shows the creatives as flat images and the badge as a flat card. Content stays readable.
- Visitors who turn on "reduce motion" get a still version.
- **Your photo**: the badge currently shows "ZK". When you have a photo, it can replace the monogram on the badge card.

## Editing

- **Text**: edit it directly in `index.html`. Each project is an `<article class="card project">` inside the `#work` section.
- **Work samples**: each sample is a `<figure class="shot">`. Empty slots (`<div class="slot">`) mark where a picture still needs to go. Put the image in a `<button>` in place of the slot. `data-p` on the figure sets which gallery filter it belongs to.
- **Images**: the VisaPro creatives are embedded inside `index.html` as `data:image/webp;base64,...` so the file works on its own. To swap one, replace that `src="data:..."` value with a path to your own image file, for example `src="images/new-campaign.webp"`, and upload the image next to `index.html`.
- **Colours**: the palette is defined at the top of the `<style>` block in `:root`.

## Publish with GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/portfolio/` after a minute or two.
