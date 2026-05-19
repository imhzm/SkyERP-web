import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/api/:path*"],
};

let lastRun = 0;
const INTERVAL_MS = 5 * 60 * 1000;
let isRunning = false;

export async function middleware(request: NextRequest) {
  const now = Date.now();
  if (now - lastRun < INTERVAL_MS || isRunning) {
    return NextResponse.next();
  }

  isRunning = true;
  lastRun = now;

  const url = new URL(request.url);
  const autoTasksUrl = `${url.origin}/api/internal/auto-tasks`;

  fetch(autoTasksUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).catch(() => {});

  return NextResponse.next();
}
