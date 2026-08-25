import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-markdown v9 and remark-gfm v4 are ESM-only.
  // serverExternalPackages tells Next.js NOT to bundle them
  // server-side — they are resolved natively by Node at runtime.
  serverExternalPackages: [
    "react-markdown",
    "remark-gfm",
    "unified",
    "remark-parse",
    "remark-rehype",
    "rehype-stringify",
    "vfile",
    "mdast-util-from-markdown",
    "mdast-util-to-markdown",
    "mdast-util-gfm",
    "micromark",
    "micromark-extension-gfm",
  ],
};

export default nextConfig;
