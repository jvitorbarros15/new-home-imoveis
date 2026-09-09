import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1");
const sourceRoot = join(root, "v1");
const outDir = join(sourceRoot, "dist");

const vendors = {
  "vendor-react": "vendor-react.js",
  "vendor-supabase": "vendor-supabase.js",
};

const entries = {
  home: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "app.jsx"],
  property: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "imovel-sections.jsx", "imovel-app.jsx"],
  listings: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "listings-page.jsx"],
  favorites: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "favoritos-page.jsx"],
  about: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "quem-somos-page.jsx"],
  finance: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "financiamento-page.jsx"],
  privacy: ["company.js", "analytics.js", "sections.jsx", "chat.jsx", "privacidade-page.jsx"],
  admin: ["company.js", "admin-listings.jsx", "admin-leads.jsx", "admin-form.jsx", "admin-app.jsx"],
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

const total = Object.keys(vendors).length + Object.keys(entries).length;
console.log(`Built ${total} browser bundles in v1/dist.`);
