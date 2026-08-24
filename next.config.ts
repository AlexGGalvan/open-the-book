import type { NextConfig } from "next";

const githubRepository = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isGithubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = isGithubPages && githubRepository ? `/${githubRepository}` : "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? githubPagesBasePath;

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
