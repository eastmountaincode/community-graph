import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { homedir } from "node:os";
import { join } from "node:path";

if (
  process.env.NODE_ENV === "development" &&
  process.env.CLOUDFLARE_DEV_BINDINGS === "1"
) {
  const wranglerStateRoot = join(
    homedir(),
    ".cache",
    "bandwidth-vs-irl",
    "wrangler-state",
  );

  initOpenNextCloudflareForDev({
    persist: true,
    persistTo: wranglerStateRoot,
  } as Parameters<typeof initOpenNextCloudflareForDev>[0] & {
    persistTo: string;
  });
}

const nextConfig: NextConfig = {};

export default nextConfig;
