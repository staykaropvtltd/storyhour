import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://storyhour.co.uk";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/new-design", "/checkout", "/order-success"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
