import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const candidates = [".vercel/output/static", ".output/public"].map((dir) =>
  fileURLToPath(new URL(`../${dir}/`, import.meta.url))
);
const root = candidates.find((dir) => existsSync(dir));

if (!root) {
  console.error("FAIL: no build output found (run `npm run build` first)");
  process.exit(1);
}

const forbidden = ["SUPABASE_SERVICE_ROLE_KEY", "asServiceRole", "@base44", "base44_access_token", "createClientFromRequest"];
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;

function* files(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* files(path);
    else if (/\.(js|css|html|map|json)$/.test(name)) yield path;
  }
}

let scanned = 0;
const hits = [];

for (const file of files(root)) {
  scanned += 1;
  const text = readFileSync(file, "utf8");

  if (/sb_secret_[A-Za-z0-9_-]{20,}/.test(text)) {
    hits.push(`Supabase secret key pattern in ${file.replace(root, "client")}`);
  }

  for (const needle of forbidden) {
    if (text.includes(needle)) hits.push(`${needle} in ${file.replace(root, "client")}`);
  }

  if (secret && text.includes(secret)) {
    hits.push(`service-role key VALUE in ${file.replace(root, "client")}`);
  }

  for (const match of text.matchAll(/eyJ[\w-]{10,}\.([\w-]{10,})\.[\w-]{10,}/g)) {
    try {
      if (JSON.parse(Buffer.from(match[1], "base64url").toString()).role === "service_role") {
        hits.push(`service_role JWT in ${file}`);
      }
    } catch {}
  }
}

console.log(`scanned ${scanned} client files; secret value checked: ${secret ? "yes" : "no (SUPABASE_SERVICE_ROLE_KEY not set)"}`);

if (hits.length) {
  console.error("FAIL\n" + hits.join("\n"));
  process.exit(1);
}

console.log("PASS: no service-role key, no Base44 runtime in the browser bundle");
