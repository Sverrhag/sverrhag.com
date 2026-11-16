document.getElementById("year").textContent = new Date().getFullYear();

const portraitTrigger = document.getElementById("portrait-trigger");
const lightbox = document.getElementById("lightbox");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox() {
  lightbox.hidden = false;
  lightboxClose.focus();
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.hidden = true;
  portraitTrigger.focus();
  document.body.style.overflow = "";
}

portraitTrigger.addEventListener("click", openLightbox);
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});

const grid = document.getElementById("projects-grid");
const projects = window.PROJECTS || [];

if (projects.length === 0) {
  grid.innerHTML = `
    <div class="projects-empty">
      <strong>Nothing here yet</strong>
      New projects will show up in this space as they're built.
    </div>
  `;
} else {
  grid.innerHTML = projects
    .map((p) => {
      const tag = p.url ? "a" : "div";
      const linkAttrs = p.url
        ? ` href="${p.url}"${
            /^https?:\/\//.test(p.url) ? ' target="_blank" rel="noopener"' : ""
          }`
        : "";
      // A card with extra links can't be one big <a> (links can't nest), so
      // the card becomes a <div> holding the main link plus a row of links.
      const hasLinks = p.url && p.links && p.links.length;
      const outerOpen = hasLinks
        ? `<div class="project-card has-links"><a class="project-card-main"${linkAttrs}>`
        : `<${tag} class="project-card"${linkAttrs}>`;
      const outerClose = hasLinks
        ? `</a>
        <p class="project-links">
          ${p.linksLabel ? `<span>${p.linksLabel}</span>` : ""}
          ${p.links
            .map(
              (l) =>
                `<a href="${l.url}"${l.lang ? ` hreflang="${l.lang}" lang="${l.lang}"` : ""}${
                  /^https?:\/\//.test(l.url) ? ' target="_blank" rel="noopener"' : ""
                }>${l.label}</a>`
            )
            .join(" ")}
        </p></div>`
        : `</${tag}>`;
      return `
      ${outerOpen}
        ${
          p.thumbnail
            ? `<div class="project-thumb">
                <picture>
                  <source srcset="${p.thumbnail.replace(/\.(jpg|jpeg|png)$/i, ".webp")}" type="image/webp">
                  <img src="${p.thumbnail}" alt="" loading="lazy">
                </picture>
              </div>`
            : ""
        }
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${
          p.tags && p.tags.length
            ? `<div class="project-tags">${p.tags
                .map((t) => `<span>${t}</span>`)
                .join("")}</div>`
            : ""
        }
      ${outerClose}`;
    })
    .join("");
}
