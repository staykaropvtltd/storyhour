import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://storyhour.co.uk";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/signup", "/new-design", "/checkout", "/order-success", "/account"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
