import { cp, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await Promise.all([
  cp("index.html", "dist/index.html"),
  cp("styles.css", "dist/styles.css"),
  cp("app.js", "dist/app.js")
]);

console.log("Static site prepared in dist/");
