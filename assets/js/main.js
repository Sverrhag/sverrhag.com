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
if (window.renderProjects) grid.innerHTML = window.renderProjects(window.PROJECTS || []);
