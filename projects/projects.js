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
    title: "Letter Adventures",
    description:
      "A free alphabet and letter game for children. Nine games across five difficulty levels: type the alphabet, find letters, match big and small, spell words, match pictures to words, read words, find the first letter, and spot a missing one — guided by cheerful recorded voices with unicorns and ladybugs. In English, Spanish, French, Portuguese, German and Swedish.",
    url: "https://letteradventures.com/",
    tags: ["Kids", "Game", "6 languages"],
    thumbnail: "assets/img/projects/letter-adventure.jpg",
    // Optional row of plain links under the card (here: one per language
    // page, so search engines find each of them).
    linksLabel: "Play in your language:",
    links: [
      { label: "English", lang: "en", url: "https://letteradventures.com/" },
      { label: "Español", lang: "es", url: "https://letteradventures.com/es/" },
      { label: "Français", lang: "fr", url: "https://letteradventures.com/fr/" },
      { label: "Português", lang: "pt", url: "https://letteradventures.com/pt/" },
      { label: "Deutsch", lang: "de", url: "https://letteradventures.com/de/" },
      { label: "Svenska", lang: "sv", url: "https://letteradventures.com/sv/" },
    ],
    // No stats field: the game no longer calls any third-party counter
    // (removed for GDPR/consent reasons around child visitors' IPs). The
    // sverrhag-letter-adventure namespace gets no further hits.
  },
  {
    title: "Best Move Chess",
    description:
      "A chess trainer in the browser. Every move you play is checked against Stockfish. Match the engine's best move to build a streak, or switch to Training Mode and get each mistake explained in plain language, read aloud if you like, in 20 languages. Drill openings and earn badges, take the daily challenge, or send a friend the exact same game.",
    // Server-less build: runs entirely in the visitor's browser (Stockfish
    // 18 Lite, explanations, read-aloud, opening drills, stats — all stored
    // locally). Leaderboard, login, feedback and the Berserk/Reckless/Lc0
    // engines need a server and are locked with a notice in this build.
    url: "projects/chess/",
    tags: ["Chess", "Game"],
    thumbnail: "assets/img/projects/best-move-chess.jpg",
  },
];
