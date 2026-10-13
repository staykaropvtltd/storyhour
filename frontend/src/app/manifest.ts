import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StoryHour",
    short_name: "StoryHour",
    description:
      "Bringing Indian mythology, culture, and history to life through soulful audiobooks and puppet storytelling.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F3",
    theme_color: "#C9281D",
    icons: [
      {
        src: "/cropped-tp-logo-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
