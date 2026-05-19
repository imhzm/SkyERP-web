import { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

const apps = [
  "accounting", "inventory", "sales", "purchase", "crm", "pos",
  "hr-payroll", "projects", "manufacturing", "helpdesk",
  "whatsapp-crm", "ai-assistant", "reports-bi", "automation", "marketplace",
];

const industries = [
  "retail", "manufacturing", "services", "agencies", "clinics",
  "restaurants", "ecommerce", "distribution", "maintenance",
];

const pages = [
  "features", "apps", "pricing", "implementation", "integrations",
  "security", "about", "blog", "contact",
  "privacy-policy", "terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = pages.map((page) => ({
    url: `${SITE.url}/${page}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const appPages = apps.map((app) => ({
    url: `${SITE.url}/apps/${app}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const industryPages = industries.map((ind) => ({
    url: `${SITE.url}/industries/${ind}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...staticPages,
    ...appPages,
    ...industryPages,
  ];
}
