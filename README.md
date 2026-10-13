# Zain Khurram · Portfolio

Personal portfolio for Zain Khurram, growth and digital marketer based in Karachi.

The whole site is one file: `index.html`. Open it in a browser, or host it on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's on the page

- **Hero**: an iridescent liquid-chrome sculpture that slowly morphs, leans toward the cursor and melts away as you scroll, behind an editorial headline.
- **Brands & ventures**: a slow marquee of the brands and ventures worked with.
- **About**: a statement that lights up word by word as you scroll, plus key numbers.
- **Selected work**: six project cards. Each opens a full case study (overview, role, numbers, what I did) with a "next project" link. Every project has its own art-directed sculpture: the real VisaPro creatives, a chrome orbit (global distribution), a silver star (pre-launch), a ceramic knot (outbound system), rippling silk (clothing brand) and ceramic steps (leadership).
- **Expertise**: six services in an expandable list.
- **Approach**: four working principles.
- **Contact**: email, copy button and a small chrome sculpture, then a full-width name in the footer with Karachi local time.

## How it works

- Light theme, fonts from Google Fonts (Inter Tight and Instrument Serif).
- 3D uses [three.js](https://threejs.org) r169 and smooth scrolling uses [Lenis](https://lenis.darkroom.engineering) 1.1.20, both loaded from the jsDelivr CDN. Every sculpture is built in code, so there are no model files to host.
- If WebGL is not available, the page shows soft placeholder shapes and all content stays readable.
- Visitors who turn on "reduce motion" get a still version without the loader or smooth scrolling.

## Editing

- **Text**: edit it directly in `index.html`. Each project has a card (`<a class="card">`) and a full case study (`<article class="case">`) near the end of the page.
- **Images**: the two VisaPro creatives are embedded inside `index.html` as `data:image/webp;base64,...` so the file works on its own. To swap one, replace that `src="data:..."` value with a path to your own image file, for example `src="images/new-campaign.webp"`, and upload the image next to `index.html`.
- **Colours**: the palette is defined at the top of the `<style>` block in `:root`. Card background tones are the `.tone-*` classes.

## Publish with GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/portfolio/` after a minute or two.
