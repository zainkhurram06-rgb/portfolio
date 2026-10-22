// The template gallery: every design with made-up businesses in it. Its own root
// layout, so nothing from the dashboard or a client site leaks in.

import { BODY_FONTS, HEADING_FONTS } from "@/lib/content";

const fonts = [...HEADING_FONTS, ...BODY_FONTS].map((f) => `family=${f.replace(/ /g, "+")}:wght@400;500;600;700`).join("&");

export const metadata = { title: "Template gallery", robots: { index: false, follow: false } };

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?${fonts}&display=swap`} />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
