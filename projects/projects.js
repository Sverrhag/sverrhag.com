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
  {
    title: "Best Move Chess",
    description:
      "A chess trainer in the browser. Every move you play is checked against Stockfish. Match the engine's best move to build a streak, or switch to Training Mode and get each mistake explained in plain language, read aloud if you like, in 20 languages. Drill openings and earn badges, take the daily challenge, or send a friend the exact same game.",
    // Coming soon: no public url yet. The GitHub repo is private, so it
    // can't be linked either. Add "url: https://chess.sverrhag.com" once
    // that server answers at GET /api/health — the card becomes clickable
    // automatically as soon as a url is present.
    tags: ["Coming soon", "Chess", "Game"],
    thumbnail: "assets/img/projects/best-move-chess.jpg",
  },
];
