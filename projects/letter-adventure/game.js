(() => {
const { LANGS } = window.LA;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const COLORS = ['--r1','--r2','--r3','--r4','--r5','--r6'];
const GAME_META = [
  {id:'alfabet', em:'🌈', c:'--r1'},
  {id:'hitta',   em:'🐞', c:'--r2'},
  {id:'lyssna',  em:'👂', c:'--r3'},
  {id:'para',    em:'🦋', c:'--r4'},
  {id:'ord',     em:'🦄', c:'--r6'},
  // word games
  {id:'bildord', em:'🖼️', c:'--r5'},
  {id:'lasord',  em:'📖', c:'--r2'},
  {id:'forsta',  em:'🔤', c:'--r3'},
  {id:'saknad',  em:'🧩', c:'--r4'},
];
const LETTER_GAMES = 5; // the first five are letter games, the rest word games
const WORD_GAMES = ['bildord','lasord','forsta','saknad'];
const WORD_ROUNDS = [0, 4, 5, 6, 8, 10];   // words per round on levels 1-5
const WORD_MAXLEN = [0, 3, 4, 5, 6, 10];   // longest word on levels 1-5
const VOICE_EM = ['🦄','🐞','🦉','🐻','🦊'];
const STICKERS = [...'🦄🐞🌈⭐🌸🦋🍓🧁👑💖🐱🐶🍭🎀🌟🐰🍉🎈🐥🌻'];
const cap = s => s[0].toUpperCase() + s.slice(1);

/* ---------- state ---------- */
const KEY = 'letter-adventure-v1';
const S = {name:'', lang:(navigator.language||'').toLowerCase().startsWith('sv') ? 'sv' : 'en', letterCase:'upper', voice:true, voiceChar:0, speed:1, sfx:true, kb:true, stars:0, stickers:[], age:null, level:2, boards:{}};
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}
if (!LANGS[S.lang]) S.lang = 'en';
if (!VOICE_EM[S.voiceChar]) S.voiceChar = 0;

/* ---------- difficulty: level 1 (age 3) to level 5 (age 7) ----------
   rounds   letters per round in the find, listen and match games
   choices  buttons to choose between in the listen and match games
   hintAt   mistakes on one letter before the right key lights up (0 = lit from the start)
   show     the letter to press is shown; false hides it until hintAt mistakes
   say      the voice names the next letter in the alphabet and spelling games
   words    how many short, medium and long words in the spelling game
   short    longest "short" word */
const LEVELS = [null,
  {rounds:5,  choices:2, hintAt:0, show:true,  say:true,  words:[2,0,0], short:3},
  {rounds:8,  choices:3, hintAt:1, show:true,  say:true,  words:[3,0,0], short:4},
  {rounds:10, choices:4, hintAt:2, show:true,  say:false, words:[3,1,1], short:4},
  {rounds:10, choices:5, hintAt:2, show:false, say:false, words:[3,1,1], short:4},
  {rounds:12, choices:6, hintAt:3, show:false, say:false, words:[2,2,2], short:4},
];
if (S.hard !== undefined){ S.level = S.hard ? 4 : 2; delete S.hard; } // from the earlier easy/hard switch
if (!LEVELS[S.level]) S.level = 2;
const LV = () => LEVELS[S.level];
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
let T = LANGS[S.lang], ALPHA = [...T.alpha];

const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a = [...a]; for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const disp = (L,c) => c==='lower' ? L.toLowerCase() : L;
const pickCase = () => S.letterCase==='both' ? (Math.random()<.5?'upper':'lower') : S.letterCase;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nm = () => S.name || T.friend;
// On screen the name marker "{, n}" becomes ", Moa"; with no name it disappears.
const shown = s => s.replace(/\{([^}]*)n\}/g, (_, pre) => S.name ? pre + S.name : '');

/* ---------- alphabet clock and top list (kept in this browser) ---------- */
const PENALTY = 5000; // each mistake costs five seconds
const boardKey = () => `${S.lang}-L${S.level}`;
const fmtTime = ms => { const t = Math.round(ms/100); return `${Math.floor(t/600)}:${String(Math.floor(t/10)%60).padStart(2,'0')}${T.dec}${t%10}`; };
function fillBoard(ol, mark){
  const list = S.boards[boardKey()] || [];
  ol.innerHTML = '';
  list.forEach(r => {
    const li = document.createElement('li'), n = document.createElement('span'), t = document.createElement('b');
    n.textContent = r.name; t.textContent = fmtTime(r.ms);
    if (r.at === mark) li.className = 'me';
    li.append(n, t); ol.append(li);
  });
  return list.length;
}
let clock = null;
function stopClock(){ clearInterval(clock); clock = null; }
function startClock(){
  stopClock();
  clock = setInterval(() => {
    if (!G || !G.t0) return stopClock();
    $('#timer').textContent = '⏱ ' + fmtTime(performance.now() - G.t0 + G.errs*PENALTY).slice(0, -2);
  }, 250);
}

/* ---------- anonymous play counters (abacus.jasoncameron.dev) ---------- */
const STATS = 'https://abacus.jasoncameron.dev', NS = 'sverrhag-letter-adventure';
const live = location.protocol === 'https:' && !/^(localhost|127\.)/.test(location.hostname);
// Counters: players, lang-sv, lang-en, game-alfabet, game-hitta, game-lyssna,
// game-para, game-ord. They are only written here; the site's statistics page reads them.
const hit = key => { if (live) fetch(`${STATS}/hit/${NS}/${key}`).catch(() => {}); };

/* ---------- phrases: {id, text} parts ---------- */
function g(key){
  const v = T.g[key];
  if (Array.isArray(v)){ const i = Math.floor(Math.random()*v.length); return {id:`${key}_${i}`, text:shown(v[i])}; }
  return {id:key, text:shown(v)};
}
// The caption must not give away what the screen hides: the letter in the listening
// game, and on the levels without visible letters, until the answer has been revealed.
const secret = () => G && !G.revealed && (G.id==='lyssna' || (!LV().show && G.id!=='para'));
const per = (key, L, open) => ({id:`${key}_${ALPHA.indexOf(L)}`, text:T.per[key](!open && secret() ? '?' : L)});
const wordPart = (key, it) => ({id:`${key}_${it.wi}`, text:T.perWord[key](key==='word' && secret() ? '…' : it.w.toLowerCase())});

/* ---------- voice: recorded clips ---------- */
const player = new Audio();
let tok = 0;
const clipUrl = id => `audio/${S.lang}/v${S.voiceChar+1}/${id}.mp3`;
function say(parts, then){
  parts = [].concat(parts).filter(Boolean);
  const text = parts.map(p => p.text).join(' ');
  $$('.say').forEach(e => e.textContent = text);
  const my = ++tok; let done = false, tm, i = 0;
  const fin = () => { if (done) return; done = true; clearTimeout(tm); if (then && my===tok) then(); };
  player.pause();
  if (!S.voice){ if (then) tm = setTimeout(fin, 1300); return; }
  tm = setTimeout(fin, 3000 + text.length*120);
  const next = () => {
    if (my !== tok) return;
    if (i >= parts.length) return fin();
    const p = parts[i++]; let moved = false;
    const go = () => { if (!moved){ moved = true; next(); } };
    player.onended = go; player.onerror = go;
    player.src = clipUrl(p.id); player.playbackRate = S.speed;
    player.play().catch(go);
  };
  next();
}

/* ---------- sound effects ---------- */
let ac = null;
function tone(f, at, dur, type='sine', vol=.16){
  if (!S.sfx || !ac) return;
  const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime + at;
  o.type = type; o.frequency.value = f;
  gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t+.02); gn.gain.exponentialRampToValueAtTime(.001, t+dur);
  o.connect(gn).connect(ac.destination); o.start(t); o.stop(t+dur+.05);
}
const sfxYes = () => [523,659,784,1047].forEach((f,i)=>tone(f,i*.07,.22,'triangle',.1));
const sfxNo  = () => { tone(300,0,.18,'sine',.1); tone(240,.12,.22,'sine',.1); };
const sfxWin = () => [523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,i*.13,.3,'triangle',.1));

/* ---------- sparkle ---------- */
function burst(n, el){
  if (reduced) n = Math.ceil(n/4);
  const r = el ? el.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
  const x = r.left + r.width/2, y = r.top + r.height/2;
  for (let i=0;i<n;i++){
    const s = document.createElement('span'); s.textContent = pick(['⭐','💖','🦄','🐞','🌸','✨','🌈']);
    s.style.left = x+'px'; s.style.top = y+'px'; $('#fx').append(s);
    const a = Math.random()*Math.PI*2, d = 140 + Math.random()*260;
    s.animate([{transform:'translate(-50%,-50%) scale(.3)', opacity:1},
               {transform:`translate(calc(-50% + ${Math.cos(a)*d}px), calc(-50% + ${Math.sin(a)*d - 60}px)) scale(1.3) rotate(${Math.random()*360}deg)`, opacity:0}],
              {duration:900+Math.random()*700, easing:'cubic-bezier(.1,.7,.3,1)'}).onfinish = () => s.remove();
  }
}
function rain(n){
  if (reduced) n = Math.ceil(n/5);
  for (let i=0;i<n;i++){
    const s = document.createElement('span'); s.textContent = pick(['⭐','💖','🦄','🐞','🌸','🎀','🌈','🎈']);
    s.style.left = Math.random()*100+'%'; s.style.top = '-50px'; $('#fx').append(s);
    s.animate([{transform:'translateY(0) rotate(0)'},{transform:`translateY(${innerHeight+120}px) rotate(${Math.random()*720-360}deg)`}],
              {duration:2200+Math.random()*2600, delay:Math.random()*1800, easing:'linear'}).onfinish = () => s.remove();
  }
}

/* ---------- screens ---------- */
let screen = 'start', G = null, lastId = 'alfabet';
function show(id){
  screen = id; $$('.screen').forEach(s => s.classList.toggle('on', s.id===id));
  document.activeElement?.blur?.();
}
function applyLang(){
  T = LANGS[S.lang]; ALPHA = [...T.alpha];
  document.documentElement.lang = S.lang; document.title = T.title;
  $('#gameTitle').textContent = T.title;
  $$('[data-t]').forEach(e => e.textContent = T.ui[e.dataset.t]);
  $$('[data-ta]').forEach(e => e.setAttribute('aria-label', T.ui[e.dataset.ta]));
  $('#name').placeholder = T.ui.namePh;
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang===S.lang));
  const cards = GAME_META.map((gm,i)=>`<button class="game" data-g="${gm.id}" style="background:var(${gm.c})"><span class="num">${i+1}</span><span class="em">${gm.em}</span>${T.games[i][0]}<small>${T.games[i][1]}</small></button>`);
  $('#games').innerHTML = cards.slice(0, LETTER_GAMES).join('');
  $('#games2').innerHTML = cards.slice(LETTER_GAMES).join('');
  $('#aboutList').innerHTML = GAME_META.map((gm,i)=>`<li>${gm.em} <b>${T.games[i][0]}</b> – ${T.games[i][1]}</li>`).join('');
  $$('.voices').forEach(box => box.innerHTML = VOICE_EM.map((em,i)=>`<button class="voice" data-voice="${i}"><span>${em}</span>${T.voices[i]}</button>`).join(''));
  refresh();
}
function refresh(){
  const p = T.poss(nm());
  $('#homeTitle').textContent = T.homeTitle(p);
  $('#shelfTitle').textContent = T.shelfTitle(p);
  $('#winTitle').textContent = shown(T.g.hurra);
  $$('.starcount').forEach(e => e.textContent = S.stars);
  $$('[data-case]').forEach(b => b.setAttribute('aria-pressed', b.dataset.case===S.letterCase));
  $$('[data-voice]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.voice===S.voiceChar));
  $$('[data-level]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.level===S.level));
  $$('[data-age]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.age===S.age));
  $('#levelChip').textContent = T.ui.levelChip(S.level);
  $$('.who').forEach(e => e.textContent = VOICE_EM[S.voiceChar]);
  const st = $('#stickers');
  st.classList.toggle('none', !S.stickers.length);
  st.textContent = S.stickers.length ? S.stickers.slice(-45).join('') : T.ui.noStickers;
  $('#optVoice').checked = S.voice; $('#optSfx').checked = S.sfx; $('#optKb').checked = S.kb; $('#optRate').value = S.speed;
  buildKb();
}
function goHome(first){
  G = null; stopClock(); show('home'); refresh();
  say(g(first ? 'greet' : 'homeAgain'));
}
function begin(){
  S.name = $('#name').value.trim().replace(/\s+/g,' ').slice(0,16); save();
  try { ac = ac || new (window.AudioContext||window.webkitAudioContext)(); ac.resume?.(); } catch {}
  if (!S.counted){ S.counted = true; save(); hit('players'); hit('lang-' + S.lang); }
  goHome(true);
}

document.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) startGame(b.dataset.g); });

// Games answered by tapping a choice instead of typing.
const usesChoices = () => G && (['lyssna','para','bildord','lasord'].includes(G.id) || (G.id==='forsta' && S.level<=3));
function buildKb(){
  const kb = $('#kb');
  kb.hidden = !S.kb || usesChoices();
  const c = S.letterCase==='lower' ? 'lower' : 'upper';
  kb.innerHTML = T.kb.map(r => `<div class="kr">${[...r].map(L=>`<button class="key" data-k="${L}">${disp(L,c)}</button>`).join('')}</div>`).join('');
}
$('#kb').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
$('#choices').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });

/* ---------- games ---------- */
function nameWord(){
  const w = S.name.toLocaleUpperCase(S.lang);
  return w.length>=2 && w.length<=10 && [...w].every(ch => ALPHA.includes(ch)) ? w : null;
}
function startGame(id){
  lastId = id;
  G = {id, i:0, pos:0, wrong:0, lock:false, errs:0, t0:0};
  stopClock();
  $('#timer').hidden = id!=='alfabet'; $('#timer').textContent = '⏱ 0:00';
  if (id==='alfabet') G.items = ALPHA.map(L=>({L}));
  else if (id==='ord'){
    const all = T.words.map(([w,e],wi)=>({w,e,wi}));
    const pool = shuffle(all.slice(0, -T.finale)), me = nameWord();
    const [nShort, nMedium, nLong] = LV().words;
    const ws = [...(me ? [{w:me, e:'💖', isName:true}] : []), ...pool.filter(x=>x.w.length<=LV().short).slice(0, nShort), ...pool.filter(x=>x.w.length>=5).slice(0, nMedium), ...shuffle(all.slice(-T.finale)).slice(0, nLong)];
    G.items = ws.map(x=>({...x, c:pickCase()}));
  } else if (WORD_GAMES.includes(id)){
    const all = T.words.map(([w,e],wi)=>({w,e,wi}));
    const pool = shuffle(all.filter(x => x.w.length <= WORD_MAXLEN[S.level]));
    G.items = pool.slice(0, WORD_ROUNDS[S.level]).map(x => {
      const it = {...x, c:pickCase()};
      // Other words to choose between; from level 4 words with the same first letter come first.
      const others = shuffle(all.filter(o => o.wi!==x.wi));
      if (!LV().show) others.sort((a,b) => (b.w[0]===x.w[0]) - (a.w[0]===x.w[0]));
      it.opts = shuffle([x, ...others.slice(0, LV().choices - 1)]);
      it.letters = shuffle([x.w[0], ...shuffle(ALPHA.filter(l => l!==x.w[0])).slice(0, LV().choices - 1)]);
      // Missing letters: the first one on levels 1-2, any one on level 3, two on levels 4-5.
      const idx = shuffle([...x.w].map((_,i)=>i));
      it.gaps = S.level<=2 ? [0] : idx.slice(0, S.level>=4 && x.w.length>=3 ? 2 : 1).sort((a,b)=>a-b);
      return it;
    });
  } else G.items = shuffle(ALPHA).slice(0, LV().rounds).map(L=>({L,c:pickCase()}));
  hit('game-' + id);
  show('game'); buildKb(); render();
  say([g('intro'+cap(id)), ...prompt()]);
}
const item = () => G.items[G.i];
function target(){
  const it = item();
  switch (G.id){
    case 'ord': return it.w[G.pos];
    case 'bildord': case 'lasord': return String(it.wi); // the choice buttons carry the word's index
    case 'forsta': return it.w[0];
    case 'saknad': return it.w[it.gaps[G.pos]];
    default: return it.L;
  }
}
// The word itself, spoken. On screen it is hidden where it would give the answer away.
const sayWord = (it, open) => ({id:`say_${it.wi}`, text: open ? T.perWord.say(it.w.toLowerCase()) : '…'});
const findKey = c => S.letterCase==='both' && c ? (c==='lower' ? 'findL' : 'findU') : 'find';

function prompt(){
  const it = item(), L = target();
  switch (G.id){
    case 'alfabet':
      if (!LV().say) return []; // from level 3 the voice no longer says which letter comes next
      if (G.i===0) return [per('start',L)];
      if (G.i===ALPHA.length-1) return [g('alphaLast')];
      return [per('next',L)];
    case 'hitta': case 'lyssna': return [per(findKey(it.c), L)];
    case 'para': return [per(it.c==='upper' ? 'pairU' : 'pairL', L)];
    case 'ord':
      if (G.pos>0) return LV().say ? [per('next',L)] : [];
      return [it.isName ? g('nameStart') : wordPart('word',it), LV().say && per('start',L)];
    // Word games: the voice reads the word aloud on the easier levels only.
    case 'bildord': return [g('askBildord'), LV().say && sayWord(it)];
    case 'lasord': return [g('askLasord'), LV().say && sayWord(it, true)];
    case 'forsta': return [g('askForsta'), sayWord(it)];
    case 'saknad': return G.pos>0 ? [] : [g('askSaknad'), LV().show && sayWord(it)];
  }
}

function render(){
  const it = item(), card = $('#card'), ch = $('#choices'), id = G.id;
  G.wrong = 0; G.revealed = false;
  card.className = ''; ch.innerHTML = ''; ch.hidden = true;
  $$('.hint').forEach(e=>e.classList.remove('hint'));
  const hide = !LV().show;
  if (id==='alfabet') card.textContent = hide ? '?' : S.letterCase==='both' ? it.L+' '+it.L.toLowerCase() : disp(it.L,S.letterCase);
  if (id==='hitta') card.textContent = hide ? '👂' : disp(it.L,it.c);
  if (id==='lyssna' || id==='para'){
    card.classList.add('compact');
    card.textContent = id==='lyssna' ? '👂' : disp(it.L,it.c);
    it.opts = it.opts || shuffle([it.L, ...shuffle(ALPHA.filter(x=>x!==it.L)).slice(0, LV().choices - 1)]);
    const oc = id==='para' ? (it.c==='upper'?'lower':'upper') : it.c;
    ch.hidden = false;
    ch.innerHTML = it.opts.map((L,i)=>`<button class="choice" data-k="${L}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(L,oc)}</button>`).join('');
  }
  if (id==='ord'){
    card.classList.add('compact');
    card.innerHTML = `<span class="pic">${it.e}</span><div class="slots" style="--n:${it.w.length}">${[...it.w].map((L,i)=>`<span class="slot ${i<G.pos?'done':i===G.pos?'now':''}">${hide && i>=G.pos ? '' : disp(L,it.c)}</span>`).join('')}</div>`;
  }
  const wordSlots = (cls, txt) => `<div class="slots" style="--n:${it.w.length}">${[...it.w].map((L,i)=>`<span class="slot ${cls(i)}">${txt(i) ? disp(L,it.c) : ''}</span>`).join('')}</div>`;
  if (id==='bildord'){
    card.classList.add('compact'); card.textContent = it.e;
    ch.hidden = false;
    ch.innerHTML = it.opts.map((o,i)=>`<button class="choice word" data-k="${o.wi}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(o.w,it.c)}</button>`).join('');
  }
  if (id==='lasord'){
    card.classList.add('compact','wordcard'); card.textContent = disp(it.w,it.c);
    ch.hidden = false;
    ch.innerHTML = it.opts.map((o,i)=>`<button class="choice" data-k="${o.wi}" style="background:var(${COLORS[(i*2+G.i)%6]})">${o.e}</button>`).join('');
  }
  if (id==='forsta'){
    card.classList.add('compact');
    // Level 1 shows the whole word under the picture; after that the child has to listen.
    card.innerHTML = `<span class="pic">${it.e}</span>` + (S.level===1 ? wordSlots(i => i===0 ? 'now' : '', () => true) : '');
    if (usesChoices()){
      ch.hidden = false;
      ch.innerHTML = it.letters.map((L,i)=>`<button class="choice" data-k="${L}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(L,it.c)}</button>`).join('');
    }
  }
  if (id==='saknad'){
    card.classList.add('compact');
    const gi = i => it.gaps.indexOf(i); // -1 for letters that are given
    card.innerHTML = `<span class="pic">${it.e}</span>` + wordSlots(i => gi(i)<0 ? 'given' : gi(i)<G.pos ? 'done' : gi(i)===G.pos ? 'now' : '', i => gi(i)<0 || gi(i)<G.pos);
  }
  card.classList.toggle('tap', card.textContent==='👂');
  const p = $('#progress');
  if (id==='alfabet') p.innerHTML = ALPHA.map((L,i)=>`<span class="dot ${i<G.i?'done':i===G.i?'now':''}" ${i<G.i?`style="background:var(${COLORS[i%6]})"`:''}>${hide && i>=G.i ? '' : disp(L,S.letterCase==='lower'?'lower':'upper')}</span>`).join('');
  else p.innerHTML = G.items.map((_,i)=>`<span class="pip ${i<G.i?'done':''}">${i<G.i?(i%2?'🦄':'🐞'):''}</span>`).join('');
  // On the easiest level the right key is lit from the start in the typing games.
  if (LV().hintAt===0 && ['alfabet','hitta','ord','saknad'].includes(id)) hint();
}

function hint(){
  const t = target();
  $$(`#kb [data-k="${t}"], #choices [data-k="${t}"]`).forEach(e=>e.classList.add('hint'));
}
// After enough mistakes: light up the key, and on the levels that hide the letter, show it.
function reveal(){
  const t = target(), it = item();
  hint();
  if (LV().show) return;
  G.revealed = true;
  if (G.id==='alfabet' || G.id==='hitta'){ const c = $('#card'); c.textContent = disp(t, it.c || (S.letterCase==='lower' ? 'lower' : 'upper')); c.classList.remove('tap'); }
  if (G.id==='ord'){ const s = $('#card .slot.now'); if (s) s.textContent = disp(t, it.c); }
}
function flash(cls){ const c = $('#card'); c.classList.remove('yay','no'); void c.offsetWidth; c.classList.add(cls); }
function showStars(){ $$('.starcount').forEach(e => e.textContent = S.stars); }

function press(k){
  if (screen!=='game' || !G || G.lock) return;
  const t = target(), it = item();
  if (k !== t){
    G.wrong++; G.errs++; sfxNo(); flash('no');
    const helped = G.wrong >= Math.max(1, LV().hintAt);
    if (helped) reveal();
    // Where the letter is hidden, the answer is only said aloud once it has been revealed.
    const tell = LV().show || helped || (G.id!=='alfabet' && G.id!=='ord');
    let follow = tell && !WORD_GAMES.includes(G.id) && per(G.id==='hitta' || G.id==='lyssna' ? findKey(it.c) : 'find', t);
    // In the word games the letter is only named once the help has appeared.
    if ((G.id==='forsta' || G.id==='saknad') && helped) follow = per('find', t, true);
    say([g('wrong'), follow]);
    return;
  }
  if (G.id==='alfabet' && !G.t0){ G.t0 = performance.now(); startClock(); }
  S.stars++; save(); showStars(); sfxYes(); flash('yay'); burst(12, $('#card'));
  const last = G.i === G.items.length-1;
  if (G.id==='alfabet'){
    if (last){ G.result = {ms: performance.now() - G.t0 + G.errs*PENALTY, errs: G.errs}; stopClock(); $('#timer').textContent = '⏱ ' + fmtTime(G.result.ms);
      G.lock = true; $$('#progress .dot').forEach((d,i)=>{ d.className='dot done'; d.style.background=`var(${COLORS[i%6]})`; }); say([per('L',t,true), g('long')], win); return; }
    G.i++; render(); say([g('short'), ...prompt()]); return;
  }
  if (G.id==='ord'){
    G.pos++;
    if (G.pos < it.w.length){ render(); say([g('short'), ...prompt()]); return; }
    G.lock = true; render(); burst(16, $('#card'));
    say([it.isName ? g('wroteName') : wordPart('wrote',it), g('long')], () => advance(last)); return;
  }
  if (G.id==='saknad'){
    G.pos++;
    if (G.pos < it.gaps.length){ render(); say(g('short')); return; }
    G.lock = true; render(); burst(16, $('#card'));
    say([sayWord(it, true), g('long')], () => advance(last)); return;
  }
  G.lock = true;
  if (G.id==='lyssna') $('#card').textContent = disp(it.L,it.c);
  $$('#choices .choice').forEach(b => { if (b.dataset.k!==t) b.style.opacity = .25; });
  // After a right answer in a word game the voice says the word, so sound and spelling meet.
  say([WORD_GAMES.includes(G.id) && sayWord(it, true), g('long')], () => advance(last));
}
function advance(last){
  if (!G) return;
  if (last) return win();
  G.i++; G.pos = 0; G.lock = false; render(); say(prompt());
}
function win(){
  if (!G) return;
  const id = G.id, res = G.result; G = null;
  const st = pick(STICKERS); S.stickers.push(st); S.stars += 5;
  $('#result').hidden = !res; $('#win').classList.toggle('timed', !!res);
  if (res){
    const mark = Date.now(), list = (S.boards[boardKey()] ||= []);
    list.push({name: nm(), ms: Math.round(res.ms), errors: res.errs, at: mark});
    list.sort((a,b) => a.ms - b.ms); list.splice(10);
    $('#yourTime').textContent = T.ui.yourTime(fmtTime(res.ms), res.errs) + (list[0].at===mark ? ' ' + T.ui.newBest : '');
    fillBoard($('#winBoard'), mark);
  }
  save();
  $('#prize').textContent = st;
  show('win'); refresh(); sfxWin(); rain(70);
  say([g('hurra'), g('win'+cap(id)), g('winTail')]);
}

/* ---------- buttons & keys ---------- */
$('#name').value = S.name;
$('#go').onclick = begin;
$('#toHome').onclick = () => goHome();
$('#winHome').onclick = () => goHome();
$('#replay').onclick = () => startGame(lastId);
const repeat = () => { if (!G || G.lock) return; const p = prompt().filter(Boolean); if (p.length) say(p); };
$('#again').onclick = repeat;
$('#card').onclick = () => { if ($('#card').classList.contains('tap')) repeat(); };
const boardDlg = $('#boardDlg');
$('#openBoard').onclick = () => {
  $('#boardTitle').textContent = `${T.ui.boardH} (${T.ui.levelChip(S.level).toLowerCase()})`;
  $('#boardEmpty').hidden = fillBoard($('#boardList')) > 0;
  boardDlg.showModal();
};
$('#closeBoard').onclick = () => boardDlg.close();
$('#levelChip').onclick = () => $('#openSettings').click();
$('#langSeg').addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (!b) return; S.lang = b.dataset.lang; save(); applyLang(); });

const dlg = $('#settings');
$('#openSettings').onclick = () => { refresh(); $('#fullscreen').hidden = !document.fullscreenEnabled; dlg.showModal(); };
$('#closeSettings').onclick = () => dlg.close();
$('#changeName').onclick = () => { dlg.close(); G = null; stopClock(); tok++; player.pause(); show('start'); };
document.addEventListener('click', e => {
  const c = e.target.closest('[data-case]');
  if (c){ S.letterCase = c.dataset.case; save(); refresh(); if (!dlg.open) say(g('case'+cap(S.letterCase))); return; }
  const lv = e.target.closest('[data-level]');
  if (lv){ S.level = +lv.dataset.level; save(); refresh(); say({id:`level_${S.level-1}`, text:T.g.level[S.level-1]}); return; }
  const ag = e.target.closest('[data-age]');
  if (ag){ S.age = +ag.dataset.age; S.level = S.age - 2; save(); refresh(); return; }
  const v = e.target.closest('[data-voice]');
  if (v){ S.voiceChar = +v.dataset.voice; save(); refresh(); say({id:'hello', text:T.hello[S.voiceChar]}); }
});
$('#optVoice').onchange = e => { S.voice = e.target.checked; if (!S.voice) player.pause(); save(); };
$('#optSfx').onchange = e => { S.sfx = e.target.checked; save(); };
$('#optKb').onchange = e => { S.kb = e.target.checked; save(); buildKb(); };
$('#optRate').onchange = e => { S.speed = +e.target.value; save(); };
$('#fullscreen').onclick = () => { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())?.catch?.(()=>{}); };
let armed = false;
$('#reset').onclick = e => {
  if (!armed){ armed = true; e.target.textContent = T.ui.setResetArm; setTimeout(()=>{ if (armed){ armed=false; e.target.textContent=T.ui.setReset; } }, 4000); return; }
  S.stars = 0; S.stickers = []; save(); refresh(); armed = false; e.target.textContent = T.ui.setResetDone;
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || dlg.open || boardDlg.open) return;
  if (screen==='start'){ if (e.key==='Enter'){ e.preventDefault(); begin(); } return; }
  if (e.key==='Escape'){ if (screen!=='home') goHome(); return; }
  if (screen==='home'){ const n = e.key.length===1 ? '123456789'.indexOf(e.key) : -1; if (n>=0){ e.preventDefault(); startGame(GAME_META[n].id); } return; }
  if (screen==='win'){ if (e.key==='Enter' || e.key===' '){ e.preventDefault(); startGame(lastId); } return; }
  if (screen==='game'){
    if (e.key===' ' || e.key==='Enter'){ e.preventDefault(); repeat(); return; }
    const k = e.key.toLocaleUpperCase(S.lang);
    if (k.length===1 && ALPHA.includes(k)){ e.preventDefault(); press(k); }
  }
});

applyLang();
if (!S.name && matchMedia('(pointer:fine)').matches) $('#name').focus();
})();
