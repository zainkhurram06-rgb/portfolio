# Zain Khurram · Portfolio

Personal portfolio for Zain Khurram, growth marketer based in Karachi.

The whole site is one file: `index.html`. Open it in a browser, or host it on any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages).

## What's on the page

Zain's own design: dotted paper background, black ink, Arial Black headlines, white cards and flat colour blocks.

- **Hero**: the "Portfolio" wordmark, a one-line intro, services, two buttons, and floating cards for VisaPro, Startup Ninja and Onease.
- **About**: short bio, roles, tools and what I can do for you.
- **Work**: four projects (VisaPro, Startup Ninja, Onease, my e-commerce stores). VisaPro has tabs for Meta ads, posts and videos, email, cold email and partnerships. Click any ad to see it bigger.
- **How I work**: four steps.
- **Cedar Executive Business Society** and **Why me** cards.
- **Contact**: email, phone, copy button and Karachi local time.

## How it works

- Headlines use Arial Black. Phones that don't have it get Archivo Black from Google Fonts, which looks almost the same.
- No frameworks. Scrolling is the browser's own.

## Editing

- **Text**: edit it directly in `index.html`. Each project is an `<article class="card project">` inside the `#work` section.
- **Images**: the creatives are embedded inside `index.html` as `data:image/webp;base64,...` so the file works on its own. To swap one, replace that `src="data:..."` value with a path to your own image file, for example `src="images/new-campaign.webp"`, and upload the image next to `index.html`.
- **Colours**: the palette is defined at the top of the `<style>` block in `:root`.

## Publish with GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. The site will be live at `https://<your-username>.github.io/portfolio/` after a minute or two.
