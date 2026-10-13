# Zain Khurram · Portfolio

Personal portfolio for Zain Khurram, growth and digital marketer based in Karachi.

The whole site is one file: `index.html`. Open it in a browser, or host it on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's on the page

- **Hero**: headline with 3D props (chat bubble, megaphone, heart, play button, chart and more) that follow the mouse, dodge the cursor, and spin when clicked.
- **About**: a 3D "ZK" monogram on a name badge, a short point of view, and key numbers.
- **Selected work**: six projects, each on its own colour set with a 3D prop:
  - VisaPro campaigns: the real campaign creatives (click to view full size) plus a funnel that leads drop into
  - VisaPro global distribution: a globe with the webinar travelling to each market
  - Startup Ninja: a teaser poster with a spinning shuriken
  - Onease: a paper plane flying the outbound loop
  - Eloit: a t-shirt on a hanger that swings when you scroll
  - Cedar: a chess king for leadership
- **Approach**: four working principles as sticky notes.
- **Contact**: email, copy button, and an envelope with a letter popping out.

## How it works

- Light theme, fonts from Google Fonts (Bricolage Grotesque and Figtree).
- The 3D layer uses [three.js](https://threejs.org) r169, loaded from the jsDelivr CDN. Every 3D object is built in code, so there are no model files to host.
- If WebGL is not available, the page shows simple coloured shapes instead, and all content stays readable.
- Visitors who turn on "reduce motion" in their system settings get a still version.

## Editing

- **Text**: edit it directly in `index.html`. Each project is an `<article class="case">` block.
- **Images**: the two VisaPro creatives are embedded inside `index.html` as `data:image/webp;base64,...` so the file works on its own. To swap one, replace that `src="data:..."` value with a path to your own image file, for example `src="images/new-campaign.webp"`, and upload the image next to `index.html`.
- **Colours**: the palette is defined at the top of the `<style>` block in `:root`.

## Publish with GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/portfolio/` after a minute or two.
