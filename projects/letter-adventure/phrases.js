// All language data for Letter Adventure, shared by the game (game.js) and the
// voice generator (tools/generate-voices.mjs).
//
// Spoken phrases live in `g` (general), `per` (one clip per letter) and
// `perWord` (one clip per word). A marker like "{, n}" is where the player's
// name is shown on screen; the recorded audio leaves it out.
(function (root) {
const LANGS = {
sv: {
  code: 'sv-SE', alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ', kb: ['QWERTYUIOPÅ', 'ASDFGHJKLÖÄ', 'ZXCVBNM'],
  title: 'Bokstavsäventyret', friend: 'kompis',
  poss: n => n + (/[sxz]$/i.test(n) ? '' : 's'),
  homeTitle: p => `${p} bokstäver`, shelfTitle: p => `${p} klistermärken`,
  ui: {
    tagline: 'Lär dig bokstäverna med enhörningen och nyckelpigan',
    nameLabel: 'Vad heter du?', namePh: 'Skriv ditt namn', start: 'Börja spela 🐞',
    aboutH: 'Om spelet',
    about: 'Ett bokstavsspel för barn från ungefär fyra år. Barnet övar på att känna igen och skriva bokstäver, med tangentbord eller pekskärm, och på att läsa och bygga ord, i nio små spel. En glad röst guidar, berömmer varje rätt svar och hjälper vänligt till när det blir fel. Välj mellan fem röster, och mellan stora bokstäver, små bokstäver eller båda. Svårigheten anpassas efter barnets ålder, 3 till 7 år, i fem nivåer och kan ändras i inställningarna. På de svåraste nivåerna visas inte bokstäverna. Alfabetet går på tid, med en topplista.',
    tip: 'Fungerar i webbläsaren på surfplatta, dator och mobil. Inget konto och ingen reklam. Stjärnor och klistermärken sparas bara i den här webbläsaren. Spelet räknar anonymt hur många gånger det spelas.',    noStickers: 'Här hamnar dina klistermärken när du har spelat klart ett spel.',
    replay: 'Spela igen', winHome: '🏠 Hem', ariaHome: 'Hem', ariaAgain: 'Lyssna igen',
    setH: 'Inställningar för vuxna', setLetters: 'Bokstäver', caseU: 'STORA', caseL: 'små', caseB: 'Båda',
    setVoice: 'Röst som guidar', setVoiceName: 'Välj röst', setRate: 'Röstens tempo',
    setSfx: 'Ljudeffekter', setKb: 'Tangentbord på skärmen', setFull: '⛶ Helskärm',
    setReset: 'Nollställ stjärnor', setResetArm: 'Tryck igen för att nollställa', setResetDone: 'Nollställt!',
    setChange: 'Byt namn eller språk', setDone: 'Klar',
    secLetters: 'Bokstäver', secWords: 'Ord',
    installH: 'Installera och spela i helskärm',
    installIntro: 'Installera spelet på läsplattan, så får det en egen ikon på startskärmen och öppnas i helskärm utan adressfält. Det behöver fortfarande internet för rösterna.',
    installBtn: '📲 Installera spelet', installed: '✅ Spelet är installerat och körs i helskärm.',
    installSteps: [
      ['Android och Samsung med Chrome', 'Tryck på menyn ⋮ uppe till höger och välj ”Lägg till på startskärmen” eller ”Installera app”. Bekräfta med ”Installera”.'],
      ['Samsung Internet', 'Tryck på menyn ☰ nere till höger och välj att lägga till sidan på startskärmen.'],
      ['iPad och iPhone med Safari', 'Tryck på Dela-knappen (rutan med en pil uppåt) och välj ”Lägg till på hemskärmen”.'],
      ['Sedan', 'Stäng webbläsaren och öppna spelet från den nya ikonen. Då visas det i helskärm.'],
    ],
    ageLabel: 'Hur gammal är du?', setLevel: 'Svårighet (1 = 3 år, 5 = 7 år)', levelChip: n => `Nivå ${n}`,
    boardH: 'Topplista: alfabetet', boardEmpty: 'Ingen har skrivit hela alfabetet på den här nivån än. Bli först!',
    boardNote: 'Tiden räknas från första till sista bokstaven. Varje fel kostar 5 sekunder. Listan gäller den här enheten.',
    yourTime: (t, e) => `Din tid: ${t}` + (e ? ` (${e} fel, +${e * 5} s)` : ''), newBest: 'Nytt rekord!', close: 'Stäng',
  },
  dec: ',',
  games: [['Alfabetet', 'A till Ö i rätt ordning'], ['Hitta bokstaven', 'Tryck på rätt tangent'], ['Lyssna', 'Vilken bokstav hör du?'], ['Stor och liten', 'Vilka hör ihop?'], ['Skriv ord', 'Bokstav för bokstav'],
          ['Bild och ord', 'Vilket ord passar?'], ['Läs ordet', 'Vilken bild passar?'], ['Första bokstaven', 'Vad börjar ordet på?'], ['Saknad bokstav', 'Vilken bokstav fattas?']],
  words: [['SOL', '☀️'], ['KO', '🐮'], ['BIL', '🚗'], ['BOK', '📖'], ['HUS', '🏠'], ['KATT', '🐱'], ['HUND', '🐶'], ['FISK', '🐟'], ['BÅT', '⛵'], ['MÅNE', '🌙'], ['ORM', '🐍'], ['GRIS', '🐷'], ['HÄST', '🐴'], ['TÅG', '🚂'], ['BOLL', '⚽'], ['ÄPPLE', '🍎'], ['GLASS', '🍦'], ['BLOMMA', '🌸'], ['MAMMA', '👩'], ['PAPPA', '👨'], ['ÖRA', '👂'], ['ÄGG', '🥚'], ['RÄV', '🦊'], ['BJÖRN', '🐻'], ['MUS', '🐭'], ['KAKA', '🍪'], ['HJÄRTA', '💖'], ['FJÄRIL', '🦋'], ['KRONA', '👑'], ['TÅRTA', '🎂'],
          ['ENHÖRNING', '🦄'], ['NYCKELPIGA', '🐞'], ['REGNBÅGE', '🌈']],
  finale: 3, // the last three words are the long finale words
  voices: ['Enhörningen', 'Nyckelpigan', 'Ugglan', 'Björnen', 'Räven'],
  hello: ['Hej! Jag är enhörningen. Ska vi leka med bokstäver?', 'Hej hej! Jag är nyckelpigan. Ska vi leka med bokstäver?', 'Hej! Jag är ugglan. Ska vi leka med bokstäver?', 'Hej! Jag är björnen. Ska vi leka med bokstäver?', 'Hej! Jag är räven. Ska vi leka med bokstäver?'],
  g: {
    greet: 'Hej{ n}! Välkommen till Bokstavsäventyret! Vad vill du spela?',
    homeAgain: ['Vad vill du spela nu?', 'Välj ett spel!', 'Vilket spel blir det nu?'],
    level: ['Nivå ett!', 'Nivå två!', 'Nivå tre!', 'Nivå fyra!', 'Nivå fem!'],
    caseUpper: 'Nu övar vi på stora bokstäver!', caseLower: 'Nu övar vi på små bokstäver!', caseBoth: 'Nu övar vi på både stora och små bokstäver!',
    introBildord: 'Nu parar vi ihop bilder och ord!', askBildord: 'Vilket ord passar till bilden?', winBildord: 'Du hittade alla orden! Vilken läsare du är!',
    introLasord: 'Nu ska vi läsa ord!', askLasord: 'Vilken bild passar till ordet?', winLasord: 'Du läste alla orden! Fantastiskt!',
    introForsta: 'Nu lyssnar vi efter första bokstaven!', askForsta: 'Vilken bokstav börjar ordet på?', winForsta: 'Du hörde alla första bokstäver! Vilka fina öron du har!',
    introSaknad: 'Nu letar vi efter bokstäver som saknas!', askSaknad: 'Vilken bokstav saknas?', winSaknad: 'Du hittade alla bokstäver som saknades! Strålande!',
    introAlfabet: 'Nu skriver vi hela alfabetet!', introHitta: 'Nu letar vi bokstäver på tangentbordet!', introLyssna: 'Lyssna noga!', introPara: 'Nu parar vi ihop stora och små bokstäver!', introOrd: 'Nu skriver vi ord!',
    alphaLast: 'Och sist kommer Ö!',
    short: ['Bra!', 'Ja!', 'Rätt!', 'Snyggt!', 'Toppen!', 'Precis!', 'Härligt!', 'Wow!', 'Super!', 'Jättebra!'],
    long: ['Bra jobbat{, n}!', 'Superbra{, n}!', 'Du är en stjärna!', 'Wow, helt rätt!', 'Heja{ n}!', 'Fantastiskt!', 'Jättebra{, n}!', 'Vad duktig du är!', 'Enhörningen dansar av glädje!', 'Nyckelpigan är så stolt över dig!', 'Du är en bokstavsmästare!', 'Perfekt{, n}!', 'Strålande!', 'Vilken stjärna du är!', 'Magiskt bra!', 'Regnbågsbra{, n}!', 'Nyckelpigan gör en glädjevolt!', 'Enhörningen jublar!'],
    wrong: ['Oj, inte riktigt.', 'Nästan! Försök igen.', 'Hoppsan! Titta en gång till.'],
    nameStart: 'Skriv ditt namn!', wroteName: 'Du skrev ditt namn!',
    hurra: 'Hurra{, n}!',
    winAlfabet: 'Du skrev hela alfabetet, från A till Ö! Du är en riktig bokstavsmästare!', winHitta: 'Du hittade alla bokstäverna! Nyckelpigan är jättestolt!', winLyssna: 'Vilka fina öron du har! Du klarade alla!', winPara: 'Du parade ihop allihop! Enhörningen dansar av glädje!', winOrd: 'Du skrev alla orden helt själv! Fantastiskt!',
    winTail: 'Du får ett nytt klistermärke och fem stjärnor!',
  },
  per: {
    L: L => `${L}!`,
    find: L => `Hitta bokstaven ${L}!`, findU: L => `Hitta stora ${L}!`, findL: L => `Hitta lilla ${L}!`,
    next: L => `Nu kommer ${L}.`, start: L => `Börja med ${L}.`,
    pairU: L => `Vilken liten bokstav hör ihop med stora ${L}?`, pairL: L => `Vilken stor bokstav hör ihop med lilla ${L}?`,
  },
  perWord: { word: w => `Skriv ordet ${w}.`, wrote: w => `Du skrev ${w}!`, say: w => `${w[0].toUpperCase()}${w.slice(1)}.` },
},
en: {
  code: 'en-US', alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', kb: ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'],
  title: 'Letter Adventure', friend: 'friend',
  poss: n => n + (/s$/i.test(n) ? '’' : '’s'),
  homeTitle: p => `${p} letters`, shelfTitle: p => `${p} stickers`,
  ui: {
    tagline: 'Learn your letters with the unicorn and the ladybug',
    nameLabel: 'What is your name?', namePh: 'Type your name', start: 'Start playing 🐞',
    aboutH: 'About the game',
    about: 'A letter game for children from about age four. Your child practises recognising and typing letters, with a keyboard or a touch screen, and reading and building words, in nine small games. A cheerful voice guides the way, praises every right answer and gently helps after a mistake. Choose between five voices, and between big letters, small letters or both. The difficulty follows the child’s age, 3 to 7, in five levels and can be changed in the settings. On the hardest levels the letters are hidden. The alphabet game is timed, with a top list.',
    tip: 'Works in the browser on tablets, computers and phones. No account and no ads. Stars and stickers are saved only in this browser. The game counts, anonymously, how many times it is played.',    noStickers: 'Your stickers will appear here when you finish a game.',
    replay: 'Play again', winHome: '🏠 Home', ariaHome: 'Home', ariaAgain: 'Listen again',
    setH: 'Settings for grown-ups', setLetters: 'Letters', caseU: 'BIG', caseL: 'small', caseB: 'Both',
    setVoice: 'Voice guide', setVoiceName: 'Choose a voice', setRate: 'Voice speed',
    setSfx: 'Sound effects', setKb: 'On-screen keyboard', setFull: '⛶ Full screen',
    setReset: 'Reset stars', setResetArm: 'Tap again to reset', setResetDone: 'Reset!',
    setChange: 'Change name or language', setDone: 'Done',
    secLetters: 'Letters', secWords: 'Words',
    installH: 'Install and play in full screen',
    installIntro: 'Install the game on your tablet to get its own icon on the home screen and open it in full screen, without the address bar. It still needs the internet for the voices.',
    installBtn: '📲 Install the game', installed: '✅ The game is installed and running in full screen.',
    installSteps: [
      ['Android and Samsung with Chrome', 'Tap the ⋮ menu at the top right and choose “Add to Home screen” or “Install app”. Confirm with “Install”.'],
      ['Samsung Internet', 'Tap the ☰ menu at the bottom right and choose to add the page to the home screen.'],
      ['iPad and iPhone with Safari', 'Tap the Share button (the square with an arrow pointing up) and choose “Add to Home Screen”.'],
      ['Then', 'Close the browser and open the game from the new icon. It now fills the whole screen.'],
    ],
    ageLabel: 'How old are you?', setLevel: 'Difficulty (1 = age 3, 5 = age 7)', levelChip: n => `Level ${n}`,
    boardH: 'Top list: the alphabet', boardEmpty: 'Nobody has typed the whole alphabet on this level yet. Be the first!',
    boardNote: 'The clock runs from the first letter to the last. Each mistake costs 5 seconds. The list is for this device.',
    yourTime: (t, e) => `Your time: ${t}` + (e ? ` (${e} ${e === 1 ? 'mistake' : 'mistakes'}, +${e * 5} s)` : ''), newBest: 'New record!', close: 'Close',
  },
  dec: '.',
  games: [['The alphabet', 'A to Z in the right order'], ['Find the letter', 'Press the right key'], ['Listen', 'Which letter do you hear?'], ['Big and small', 'Which ones match?'], ['Spell words', 'Letter by letter'],
          ['Picture and word', 'Which word fits?'], ['Read the word', 'Which picture fits?'], ['First letter', 'What does the word start with?'], ['Missing letter', 'Which letter is missing?']],
  words: [['SUN', '☀️'], ['COW', '🐮'], ['CAR', '🚗'], ['BOOK', '📖'], ['CAT', '🐱'], ['DOG', '🐶'], ['FISH', '🐟'], ['BOAT', '⛵'], ['MOON', '🌙'], ['PIG', '🐷'], ['BALL', '⚽'], ['EGG', '🥚'], ['FOX', '🦊'], ['BEAR', '🐻'], ['STAR', '⭐'], ['CAKE', '🎂'], ['BEE', '🐝'], ['FROG', '🐸'], ['DUCK', '🦆'], ['TREE', '🌳'], ['APPLE', '🍎'], ['HORSE', '🐴'], ['MOUSE', '🐭'], ['HEART', '💖'], ['TRAIN', '🚂'], ['CROWN', '👑'], ['HOUSE', '🏠'], ['FLOWER', '🌸'], ['COOKIE', '🍪'], ['SNAKE', '🐍'],
          ['UNICORN', '🦄'], ['LADYBUG', '🐞'], ['RAINBOW', '🌈']],
  finale: 3,
  voices: ['Unicorn', 'Ladybug', 'Owl', 'Bear', 'Fox'],
  hello: ['Hi! I am the unicorn. Shall we play with letters?', 'Hello hello! I am the ladybug. Shall we play with letters?', 'Hello! I am the owl. Shall we play with letters?', 'Hello! I am the bear. Shall we play with letters?', 'Hi! I am the fox. Shall we play with letters?'],
  g: {
    greet: 'Hi{ n}! Welcome to Letter Adventure! What would you like to play?',
    homeAgain: ['What would you like to play now?', 'Pick a game!', 'Which game is next?'],
    level: ['Level one!', 'Level two!', 'Level three!', 'Level four!', 'Level five!'],
    caseUpper: 'Now we practise big letters!', caseLower: 'Now we practise small letters!', caseBoth: 'Now we practise both big and small letters!',
    introBildord: 'Let’s match pictures and words!', askBildord: 'Which word fits the picture?', winBildord: 'You found all the words! What a reader you are!',
    introLasord: 'Let’s read some words!', askLasord: 'Which picture fits the word?', winLasord: 'You read all the words! Fantastic!',
    introForsta: 'Let’s listen for the first letter!', askForsta: 'Which letter does the word start with?', winForsta: 'You heard every first letter! What great ears you have!',
    introSaknad: 'Let’s look for missing letters!', askSaknad: 'Which letter is missing?', winSaknad: 'You found all the missing letters! Brilliant!',
    introAlfabet: 'Let’s type the whole alphabet!', introHitta: 'Let’s find letters on the keyboard!', introLyssna: 'Listen carefully!', introPara: 'Let’s match big and small letters!', introOrd: 'Let’s spell some words!',
    alphaLast: 'And last comes Z!',
    short: ['Great!', 'Yes!', 'Right!', 'Nice!', 'Super!', 'Exactly!', 'Lovely!', 'Wow!', 'Awesome!', 'Well done!'],
    long: ['Great job{, n}!', 'Super{, n}!', 'You are a star!', 'Wow, exactly right!', 'Go{ n}!', 'Fantastic!', 'Well done{, n}!', 'How clever you are!', 'The unicorn is dancing with joy!', 'The ladybug is so proud of you!', 'You are a letter champion!', 'Perfect{, n}!', 'Brilliant!', 'What a star you are!', 'Magically good!', 'Rainbow-tastic{, n}!', 'The ladybug does a happy flip!', 'The unicorn is cheering!'],
    wrong: ['Oops, not quite.', 'Almost! Try again.', 'Whoops! Look one more time.'],
    nameStart: 'Spell your name!', wroteName: 'You spelled your name!',
    hurra: 'Hooray{, n}!',
    winAlfabet: 'You typed the whole alphabet, from A to Z! You are a real letter champion!', winHitta: 'You found all the letters! The ladybug is so proud!', winLyssna: 'What great ears you have! You got them all!', winPara: 'You matched every one! The unicorn is dancing with joy!', winOrd: 'You spelled all the words by yourself! Fantastic!',
    winTail: 'You get a new sticker and five stars!',
  },
  per: {
    L: L => `${L}!`,
    find: L => `Find the letter ${L}!`, findU: L => `Find big ${L}!`, findL: L => `Find small ${L}!`,
    next: L => `Now comes ${L}.`, start: L => `Start with ${L}.`,
    pairU: L => `Which small letter goes with big ${L}?`, pairL: L => `Which big letter goes with small ${L}?`,
  },
  perWord: { word: w => `Spell the word ${w}.`, wrote: w => `You spelled ${w}!`, say: w => `${w[0].toUpperCase()}${w.slice(1)}.` },
}};

// What is said aloud: the phrase without its name marker.
const spoken = s => s.replace(/\{[^}]*\}/g, '');

// Every audio clip for one language and voice, as [id, text] pairs.
// File names are ASCII: letters and words are referred to by index.
function clipList(lang, voiceIdx) {
  const T = LANGS[lang], out = [['hello', T.hello[voiceIdx]]];
  for (const [key, val] of Object.entries(T.g)) {
    if (Array.isArray(val)) val.forEach((s, i) => out.push([`${key}_${i}`, spoken(s)]));
    else out.push([key, spoken(val)]);
  }
  [...T.alpha].forEach((L, i) => { for (const [key, fn] of Object.entries(T.per)) out.push([`${key}_${i}`, fn(L)]); });
  T.words.forEach(([w], i) => { for (const [key, fn] of Object.entries(T.perWord)) out.push([`${key}_${i}`, fn(w.toLowerCase())]); });
  return out;
}

const api = { LANGS, spoken, clipList };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.LA = api;
})(typeof window !== 'undefined' ? window : globalThis);
