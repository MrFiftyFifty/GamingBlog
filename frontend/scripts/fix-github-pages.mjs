import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "out");

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "GamingBlog";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? `/${repoName}`;

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Перенаправление…</title>
  <script>
    (function () {
      var pathname = location.pathname;
      var hasFileExtension = /\\.[^/]+$/.test(pathname);
      if (!pathname.endsWith("/") && !hasFileExtension) {
        location.replace(pathname + "/" + location.search + location.hash);
        return;
      }
      location.replace("${basePath}/");
    })();
  </script>
</head>
<body></body>
</html>
`;

if (!fs.existsSync(outDir)) {
  console.error("out/ not found — run next build first");
  process.exit(1);
}

fs.writeFileSync(path.join(outDir, "404.html"), html, "utf8");
console.log("Wrote GitHub Pages 404.html redirect");
