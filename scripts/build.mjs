import { build } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = join(root, "v1");
const outDir = join(sourceRoot, "dist");

const vendors = {
  "vendor-react": "vendor-react.js",
  "vendor-supabase": "vendor-supabase.js",
};

const entries = {
  home: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "app.jsx"],
  property: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "imovel-sections.jsx", "imovel-app.jsx"],
  listings: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "listings-page.jsx"],
  favorites: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "favoritos-page.jsx"],
  about: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "quem-somos-page.jsx"],
  finance: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "financiamento-page.jsx"],
  seller: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "anunciar-page.jsx"],
  privacy: ["constants.js", "company.js", "analytics.js", "lead.js", "sections.jsx", "chat.jsx", "privacidade-page.jsx"],
  admin: ["constants.js", "company.js", "admin-listings.jsx", "admin-leads.jsx", "admin-form.jsx", "admin-app.jsx"],
};

await mkdir(outDir, { recursive: true });

// On Vercel the property page is served by api/imovel.js, which injects real
// Open Graph metadata. Locally there is no function runtime, so the same shell
// is emitted as a static file instead.
if (!process.env.VERCEL) {
  const shell = await readFile(join(root, "templates", "imovel.html"), "utf8");
  await writeFile(join(sourceRoot, "imovel.html"), shell, "utf8");
}

// Public browser configuration is generated from the deployment environment so
// that no project identifiers are committed to the repository.
if (process.env.VERCEL && (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set for Vercel builds.");
}

const publicConfig = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
};
await writeFile(
  join(sourceRoot, "config.js"),
  `window.NEW_HOME_CONFIG=${JSON.stringify(publicConfig)};\n`,
  "utf8"
);

for (const [name, file] of Object.entries(vendors)) {
  await build({
    entryPoints: [join(sourceRoot, file)],
    outfile: join(outDir, `${name}.js`),
    bundle: true,
    minify: true,
    format: "iife",
    sourcemap: false,
    target: ["es2019"],
    legalComments: "none",
    define: { "process.env.NODE_ENV": '"production"' },
  });
}

for (const [name, files] of Object.entries(entries)) {
  const source = (
    await Promise.all(
      files.map(async (file) => `\n/* ${file} */\n${await readFile(join(sourceRoot, file), "utf8")}`)
    )
  ).join("\n");

  await build({
    stdin: { contents: source, loader: "jsx", sourcefile: `${name}.jsx` },
    outfile: join(outDir, `${name}.js`),
    bundle: false,
    minify: true,
    sourcemap: false,
    target: ["es2019"],
    legalComments: "none",
  });
}

// Deployment-only HTML rewrites. They are skipped locally so tracked files stay
// clean, and each one is idempotent so repeated builds produce the same output.
if (process.env.VERCEL) {
  const bundleHashes = {};
  for (const file of await readdir(outDir)) {
    if (!file.endsWith(".js")) continue;
    bundleHashes[file] = createHash("sha256").update(await readFile(join(outDir, file))).digest("hex").slice(0, 10);
  }

  const htmlFiles = [
    ...(await readdir(sourceRoot)).filter((file) => file.endsWith(".html")).map((file) => join(sourceRoot, file)),
    join(root, "templates", "imovel.html"),
  ];
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const next = html.replace(/src="(\/?dist\/([\w-]+\.js))(?:\?v=[0-9a-f]+)?"/g, (match, src, name) =>
      bundleHashes[name] ? `src="${src}?v=${bundleHashes[name]}"` : match
    );
    if (next !== html) await writeFile(file, next, "utf8");
  }
}

const total = Object.keys(vendors).length + Object.keys(entries).length;
console.log(`Built ${total} browser bundles in v1/dist.`);
