"use client";

import dynamic from "next/dynamic";

const AnalyticsClient = dynamic(() => import("@/components/Analytics"), { ssr: false });

export default function AnalyticsWrapper() {
  return <AnalyticsClient />;
}
