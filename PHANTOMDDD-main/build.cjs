const { build } = require("esbuild");
const fs = require("node:fs/promises");
const path = require("node:path");

async function main() {
  const root = __dirname;
  await build({
    absWorkingDir: root,
    entryPoints: ["main.jsx"],
    bundle: true,
    minify: true,
    outfile: "www/app.js",
    format: "iife",
    target: ["safari15", "chrome100"],
    define: { "process.env.NODE_ENV": '"production"' },
    nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(path.delimiter) : [],
  });
  const [html, css, js] = await Promise.all([
    fs.readFile(path.join(root, "www/phantom-standalone.html"), "utf8"),
    fs.readFile(path.join(root, "www/styles.css"), "utf8"),
    fs.readFile(path.join(root, "www/app.js"), "utf8"),
  ]);
  const standalone = html
    .replace(/<style>[\s\S]*?<\/style>/, () => "<style>" + css + "</style>")
    .replace(/<script>[\s\S]*?<\/script>/, () => "<script>" + js.replace(/<\/script/gi, "<\\/script") + "</script>");
  await fs.writeFile(path.join(root, "www/phantom-standalone.html"), standalone);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
