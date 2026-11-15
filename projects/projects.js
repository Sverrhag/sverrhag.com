// Add one entry per project. Each project should live in its own folder
// under /projects/<slug>/ with its own index.html.
//
// Example:
// {
//   title: "My Little Tool",
//   description: "One sentence describing what it does.",
//   url: "projects/my-little-tool/",
//   tags: ["JS", "demo"],
//   thumbnail: "assets/img/projects/my-little-tool.jpg", // optional
//   stats: { // optional — shown on the unlisted stats page, ignored here
//     namespace: "sverrhag-my-little-tool", // convention: "sverrhag-<slug>"
//     counters: [
//       { key: "visits", label: "Visits" }, // key: 3-64 chars, a-z 0-9 - _ .
//     ],
//   },
// }

window.PROJECTS = [
  {
    title: "Letter Adventure",
    description:
      "A playful letter game for children from about age four. Type the alphabet, find letters, match big and small, and spell words, guided by a cheerful voice with unicorns and ladybugs. In Swedish and English.",
    url: "projects/letter-adventure/",
    tags: ["Kids", "Game", "Svenska / English"],
    thumbnail: "assets/img/projects/letter-adventure.jpg",
    stats: {
      namespace: "sverrhag-letter-adventure",
      counters: [
        { key: "players", label: "Players (once per browser)" },
        { key: "lang-sv", label: "Chose Swedish" },
        { key: "lang-en", label: "Chose English" },
        { key: "game-alfabet", label: "The alphabet, starts" },
        { key: "game-hitta", label: "Find the letter, starts" },
        { key: "game-lyssna", label: "Listen, starts" },
        { key: "game-para", label: "Big and small, starts" },
        { key: "game-ord", label: "Spell words, starts" },
      ],
    },
  },
];
