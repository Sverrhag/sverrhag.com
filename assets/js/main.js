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
    .map(
      (p) => `
      <a class="project-card" href="${p.url}">
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${
          p.tags && p.tags.length
            ? `<div class="project-tags">${p.tags
                .map((t) => `<span>${t}</span>`)
                .join("")}</div>`
            : ""
        }
      </a>`
    )
    .join("");
}
