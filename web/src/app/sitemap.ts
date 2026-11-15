import type { MetadataRoute } from "next";
import { SITUS } from "@/lib/situs";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITUS.url, changeFrequency: "weekly", priority: 1 }];
}
