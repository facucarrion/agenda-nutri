// Public base URL of the site, used for robots.txt, the sitemap and canonical
// links. NEXT_PUBLIC_SITE_URL overrides it (e.g. for a preview domain).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.nutrituagenda.com"
).replace(/\/$/, "");
