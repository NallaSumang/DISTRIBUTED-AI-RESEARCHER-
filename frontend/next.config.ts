import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // remark-gfm v4, react-markdown v10, and their deps are ESM-only.
  // Next.js must transpile them at build time or the bundler throws
  // "module-not-found" on Vercel even though they are in package.json.
  transpilePackages: [
    "react-markdown",
    "remark-gfm",
    "remark-parse",
    "remark-rehype",
    "rehype-stringify",
    "unified",
    "bail",
    "is-plain-obj",
    "trough",
    "vfile",
    "vfile-message",
    "unist-util-stringify-position",
    "mdast-util-from-markdown",
    "mdast-util-to-markdown",
    "mdast-util-gfm",
    "micromark",
    "micromark-extension-gfm",
    "decode-named-character-reference",
    "character-entities",
  ],
};

export default nextConfig;
