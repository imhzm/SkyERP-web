"use client";

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params);
  }
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName);
  }
}

export const Events = {

  WHATSAPP_CLICK: "whatsapp_click",
  CONTACT_SUBMIT: "contact_submit",
  PRICING_VIEW: "pricing_view",
  MODULE_VIEW: "module_view",
  SCROLL_75: "scroll_75",
  INDUSTRY_CTA_CLICK: "industry_cta_click",
} as const;
