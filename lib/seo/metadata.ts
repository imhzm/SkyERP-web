import { Metadata } from "next";
import { SITE } from "@/lib/constants";

type PageMeta = {
  title: string;
  description: string;
  keywords?: string[];
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description,
  keywords = [],
  path = "",
  ogImage = "/images/og/home-og.webp",
  noIndex = false,
}: PageMeta): Metadata {
  const url = `${SITE.url}${path}`;

  return {
    title,
    description,
    keywords: [...SITE.keywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${title} | ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      images: [
        {
          url: `${SITE.url}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: SITE.locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE.name}`,
      description,
      images: [`${SITE.url}${ogImage}`],
    },
    robots: noIndex ? "noindex, nofollow" : "index, follow",
  };
}
