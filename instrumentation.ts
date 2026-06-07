import { initRateLimitStore } from "@/lib/rate-limit";

let registered = false;

export async function register() {
  if (registered) return;
  registered = true;
  initRateLimitStore();
}
