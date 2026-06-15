import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const moves = [
  ["src/middleware.ts", "src/middleware.ts.pages-bak"],
  ["src/app/api", "src/app/_api_pages_bak"],
];

for (const [from, to] of moves) {
  const source = path.join(root, from);
  const target = path.join(root, to);
  if (fs.existsSync(source)) {
    fs.renameSync(source, target);
  }
}
