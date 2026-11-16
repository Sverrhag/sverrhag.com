// Writes the project cards into index.html as plain HTML.
//
// Run by the deploy workflow just before publishing; the copy of index.html
// in the repository keeps an empty grid. The browser still renders the cards
// with the same function (assets/js/render-projects.js), so the two can't
// drift apart. No dependencies: `node tools/prerender.mjs`.

import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

const window = {};
const context = vm.createContext({ window });
vm.runInContext(read("projects/projects.js"), context);
vm.runInContext(read("assets/js/render-projects.js"), context);

const cards = window.renderProjects(window.PROJECTS || []);
const empty = '<div class="projects-grid" id="projects-grid"></div>';
const html = read("index.html");

if (!html.includes(empty)) {
  console.error("prerender: empty #projects-grid element not found in index.html");
  process.exit(1);
}

writeFileSync(
  new URL("index.html", root),
  html.replace(empty, () => `<div class="projects-grid" id="projects-grid">${cards}</div>`)
);
console.log(`prerender: wrote ${(window.PROJECTS || []).length} project cards into index.html`);
