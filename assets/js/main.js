document.getElementById("year").textContent = new Date().getFullYear();

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
