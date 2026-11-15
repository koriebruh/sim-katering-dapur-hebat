import type { MetadataRoute } from "next";
import { SITUS } from "@/lib/situs";
import { NAV } from "@/lib/roles";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/login", ...NAV.map((n) => n.href)] },
    sitemap: `${SITUS.url}/sitemap.xml`,
  };
}
