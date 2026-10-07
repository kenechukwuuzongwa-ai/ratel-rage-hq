import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const gameRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../RAGE OF RATELS");
const allowed = new Set(["index.html", "styles.css", "src", "frontend", "layers", "sprites", "sounds", "music", "buildings", "level1"]);
const types = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".json":"application/json", ".png":"image/png", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".webp":"image/webp", ".svg":"image/svg+xml", ".mp3":"audio/mpeg", ".ogg":"audio/ogg", ".wav":"audio/wav", ".mp4":"video/mp4", ".webm":"video/webm" };
const server = http.createServer((request,response)=>{
  if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405).end(); return; }
  let relative;
  try { relative=decodeURIComponent(new URL(request.url,"http://localhost").pathname).replace(/^\/+/,"") || "index.html"; }
  catch { response.writeHead(400).end(); return; }
  const parts=relative.split(/[\\/]/);
  if (parts.some(part=>part===".."||part.startsWith(".")) || !allowed.has(parts[0])) { response.writeHead(404).end(); return; }
  const file=path.resolve(gameRoot,...parts);
  if (!file.startsWith(gameRoot+path.sep)) { response.writeHead(404).end(); return; }
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){response.writeHead(404).end();return;}
    const mime=types[path.extname(file).toLowerCase()]||"application/octet-stream";
    response.writeHead(200,{"Content-Type":mime.startsWith("text/")?`${mime}; charset=utf-8`:mime,"Content-Length":stat.size,"Cache-Control":"no-store"});
    if(request.method==="HEAD"){response.end();return;} fs.createReadStream(file).pipe(response);
  });
});
server.listen(5174,"127.0.0.1",()=>console.log("Ratel Rage browser prototype: http://localhost:5174/"));
