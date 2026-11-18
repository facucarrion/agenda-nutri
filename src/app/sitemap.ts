import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

// Only the public marketing and legal pages. Booking links (/reservar/...)
// belong to each professional and are shared by them, not listed here.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/funciones`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
