# Zain Khurram · Portfolio

Personal portfolio for Zain Khurram, growth and digital marketer based in Karachi.

The whole site is one file: `index.html`. Open it in a browser, or host it on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's on the page

Laid out like a presentation deck: dotted background, white-framed rounded cards.

- **Hero**: the "Portfolio 2026" wordmark and a 3D collage of the real VisaPro creatives (a printed ad and a phone post) that reacts to the mouse.
- **A bit about me**: short bio, email, phone, location and a 3D profile badge on a lanyard you can drag and swing.
- **Experience**: where I've worked, what I do, and the tools I use as 3D keycaps.
- **My work**: four projects shown in full on the page (VisaPro, Startup Ninja, Onease, my e-commerce stores). Each has the brief, what I did, my part and a visual.
- **How I work**: four steps.
- **Cedar Executive Business Society** and **Why me** cards.
- **Contact**: email, phone, copy button and Karachi local time.

## How it works

- Fonts from Google Fonts (Outfit).
- 3D uses [three.js](https://threejs.org) r169 and smooth scrolling uses [Lenis](https://lenis.darkroom.engineering) 1.1.20, both from the jsDelivr CDN.
- Without WebGL, the hero shows the creatives as flat images and the badge as a flat card. Content stays readable.
- Visitors who turn on "reduce motion" get a still version.
- **Your photo**: the badge currently shows "ZK". When you have a photo, it can replace the monogram on the badge card.

## Editing

- **Text**: edit it directly in `index.html`. Each project is an `<article class="proj">` inside the `#work` section.
- **Images**: the VisaPro creatives are embedded inside `index.html` as `data:image/webp;base64,...` so the file works on its own. To swap one, replace that `src="data:..."` value with a path to your own image file, for example `src="images/new-campaign.webp"`, and upload the image next to `index.html`.
- **Colours**: the palette is defined at the top of the `<style>` block in `:root`.

## Publish with GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/portfolio/` after a minute or two.
