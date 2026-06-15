const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "GamingBlog";
const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGithubPages
    ? {
        output: "export",
        basePath: `/${repoName}`,
        assetPrefix: `/${repoName}/`,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isGithubPages,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "images.igdb.com", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
    ],
  },
};

export default nextConfig;
