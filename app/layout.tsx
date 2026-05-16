import type { Metadata } from "next";
import { Cairo, Inter, Poppins } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTAStickyBar from "@/components/layout/CTAStickyBar";
import AnalyticsWrapper from "@/components/AnalyticsWrapper";
import JsonLd from "@/components/seo/JsonLd";
import { SITE } from "@/lib/constants";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} - نظام ERP ذكي لإدارة الشركات`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: SITE.keywords,
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    title: `${SITE.name} - كل إدارتك في نظام واحد`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [
      {
        url: `${SITE.url}/images/og/home-og.webp`,
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} - كل إدارتك في نظام واحد`,
    description: SITE.description,
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${inter.variable} ${poppins.variable} h-full`}
    >
      <head>
        <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || ""} />
        <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION || ""} />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white antialiased">
        <AnalyticsWrapper />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CTAStickyBar />
      </body>
    </html>
  );
}
