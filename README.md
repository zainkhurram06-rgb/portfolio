# Zain Khurram · Portfolio

Personal portfolio for Zain Khurram, growth and digital marketer based in Karachi.

The whole site is one file: `index.html`. Open it in a browser, or host it on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's on the page

Laid out like a presentation deck: dotted background, white-framed rounded cards.

- **Hero**: the "Portfolio 2026" wordmark and a 3D collage of the real VisaPro creatives (a printed ad and a phone post) with facts from the campaign, reacting to the mouse.
- **Behind the Campaigns**: short bio, contact details and a 3D profile badge on a lanyard you can drag and swing.
- **Career Overview**: timeline of roles. **Marketing Toolkit**: 3D keycaps for channels and tools. **Capabilities** list.
- **Selected Work**: six project cards. Each opens a full case study with a "next project" link.
- **Contact**: email, copy button and Karachi local time.

## How it works

- Fonts from Google Fonts (Outfit).
- 3D uses [three.js](https://threejs.org) r169 and smooth scrolling uses [Lenis](https://lenis.darkroom.engineering) 1.1.20, both from the jsDelivr CDN.
- Without WebGL, the hero shows the creatives as flat images and the badge as a flat card. Content stays readable.
- Visitors who turn on "reduce motion" get a still version.
- **Your photo**: the badge currently shows "ZK". When you have a photo, it can replace the monogram on the badge card.

## Editing

- **Text**: edit it directly in `index.html`. Each project has a card (`<a class="card">`) and a full case study (`<article class="case">`) near the end of the page.
- **Images**: the two VisaPro creatives are embedded inside `index.html` as `data:image/webp;base64,...` so the file works on its own. To swap one, replace that `src="data:..."` value with a path to your own image file, for example `src="images/new-campaign.webp"`, and upload the image next to `index.html`.
- **Colours**: the palette is defined at the top of the `<style>` block in `:root`. Card background tones are the `.t-*` classes.

## Publish with GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/portfolio/` after a minute or two.
