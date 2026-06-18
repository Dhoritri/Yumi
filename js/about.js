/* About page — structure + templates live in about.html; this fills the hero
   and mission hooks, then clones a row per section. */
async function initPage() {
  const root = document.getElementById("about-root");
  const data = await getAboutData();
  applyBindings(root, data);

  const container = document.getElementById("about-sections");
  data.sections.forEach((section) => {
    const node = cloneTpl("tpl-about-section");
    applyBindings(node, section);
    if (section.imagePosition === "right") {
      node.querySelector(".about-row").classList.add("about-row--img-right");
    }
    container.appendChild(node);
  });
}
