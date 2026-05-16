import { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Sky ERP",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0A6CF1",
    icons: [
      {
        src: "/images/logo/sky-erp-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
