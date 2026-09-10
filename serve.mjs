import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
const port = Number(process.env.PORT || 4173);

createServer((request, response) => {
  const pathname = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const file = join(process.cwd(), pathname.replace(/^\//, ""));
  const stream = createReadStream(file);
  stream.on("open", () => {
    response.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
    stream.pipe(response);
  });
  stream.on("error", () => {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  });
}).listen(port, "127.0.0.1", () => console.log(`Local: http://127.0.0.1:${port}`));
