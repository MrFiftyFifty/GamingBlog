import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const moves = [
  ["src/middleware.ts.pages-bak", "src/middleware.ts"],
  ["src/app/_api_pages_bak", "src/app/api"],
];

for (const [from, to] of moves) {
  const source = path.join(root, from);
  const target = path.join(root, to);
  if (fs.existsSync(source) && !fs.existsSync(target)) {
    fs.renameSync(source, target);
  }
}
