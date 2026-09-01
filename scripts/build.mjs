import { build } from "esbuild";
import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1");
const sourceRoot = join(root, "v1");
const outDir = join(sourceRoot, "dist");

const entries = {
  home: ["company.js", "sections.jsx", "chat.jsx", "app.jsx"],
  property: ["company.js", "sections.jsx", "chat.jsx", "imovel-sections.jsx", "imovel-app.jsx"],
  about: ["company.js", "sections.jsx", "chat.jsx", "quem-somos-page.jsx"],
  finance: ["company.js", "sections.jsx", "chat.jsx", "financiamento-page.jsx"],
  admin: ["company.js", "admin-listings.jsx", "admin-form.jsx", "admin-app.jsx"],
};

await mkdir(outDir, { recursive: true });

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

console.log(`Built ${Object.keys(entries).length} browser bundles in v1/dist.`);
