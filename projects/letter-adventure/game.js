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
];
const VOICE_EM = ['🦄','🐞','🦉','🐻','🦊'];
const STICKERS = [...'🦄🐞🌈⭐🌸🦋🍓🧁👑💖🐱🐶🍭🎀🌟🐰🍉🎈🐥🌻'];
const cap = s => s[0].toUpperCase() + s.slice(1);

/* ---------- state ---------- */
const KEY = 'letter-adventure-v1';
const S = {name:'', lang:(navigator.language||'').toLowerCase().startsWith('sv') ? 'sv' : 'en', letterCase:'upper', voice:true, voiceChar:0, speed:1, sfx:true, kb:true, stars:0, stickers:[]};
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}
if (!LANGS[S.lang]) S.lang = 'en';
if (!VOICE_EM[S.voiceChar]) S.voiceChar = 0;
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

/* ---------- anonymous play counters (abacus.jasoncameron.dev) ---------- */
const STATS = 'https://abacus.jasoncameron.dev', NS = 'sverrhag-letter-adventure';
const live = location.protocol === 'https:' && !/^(localhost|127\.)/.test(location.hostname);
const hit = key => { if (live) fetch(`${STATS}/hit/${NS}/${key}`).catch(() => {}); };
let statVals = null;
async function loadStats(){
  const keys = ['players', ...GAME_META.map(gm => 'game-' + gm.id)];
  // A counter that has never been hit does not exist yet and counts as 0.
  statVals = await Promise.all(keys.map(k => fetch(`${STATS}/get/${NS}/${k}`).then(r => r.ok ? r.json() : {value:0}).then(j => j.value || 0).catch(() => 0)));
  renderStats();
}
function renderStats(){
  if (!statVals || !statVals.some(Boolean)) return;
  $('#stats').hidden = false;
  $('#statsPlayers').textContent = T.ui.statsPlayers(statVals[0]);
  $('#statsList').innerHTML = GAME_META.map((gm,i)=>`<li>${gm.em} <b>${T.games[i][0]}</b> – ${T.ui.statsTimes(statVals[i+1])}</li>`).join('');
}

/* ---------- phrases: {id, text} parts ---------- */
function g(key){
  const v = T.g[key];
  if (Array.isArray(v)){ const i = Math.floor(Math.random()*v.length); return {id:`${key}_${i}`, text:shown(v[i])}; }
  return {id:key, text:shown(v)};
}
const per = (key, L) => ({id:`${key}_${ALPHA.indexOf(L)}`, text:T.per[key](L)});
const wordPart = (key, it) => ({id:`${key}_${it.wi}`, text:T.perWord[key](it.w.toLowerCase())});

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
  renderStats();
  $$('[data-ta]').forEach(e => e.setAttribute('aria-label', T.ui[e.dataset.ta]));
  $('#name').placeholder = T.ui.namePh;
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang===S.lang));
  $('#games').innerHTML = GAME_META.map((gm,i)=>`<button class="game" data-g="${gm.id}" style="background:var(${gm.c})"><span class="num">${i+1}</span><span class="em">${gm.em}</span>${T.games[i][0]}<small>${T.games[i][1]}</small></button>`).join('');
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
  $$('.who').forEach(e => e.textContent = VOICE_EM[S.voiceChar]);
  const st = $('#stickers');
  st.classList.toggle('none', !S.stickers.length);
  st.textContent = S.stickers.length ? S.stickers.slice(-45).join('') : T.ui.noStickers;
  $('#optVoice').checked = S.voice; $('#optSfx').checked = S.sfx; $('#optKb').checked = S.kb; $('#optRate').value = S.speed;
  buildKb();
}
function goHome(first){
  G = null; show('home'); refresh();
  say(g(first ? 'greet' : 'homeAgain'));
}
function begin(){
  S.name = $('#name').value.trim().replace(/\s+/g,' ').slice(0,16); save();
  try { ac = ac || new (window.AudioContext||window.webkitAudioContext)(); ac.resume?.(); } catch {}
  if (!S.counted){ S.counted = true; save(); hit('players'); hit('lang-' + S.lang); }
  goHome(true);
}

$('#games').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) startGame(b.dataset.g); });

function buildKb(){
  const kb = $('#kb');
  const choiceGame = G && (G.id==='lyssna' || G.id==='para');
  kb.hidden = !S.kb || choiceGame;
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
  G = {id, i:0, pos:0, wrong:0, lock:false};
  if (id==='alfabet') G.items = ALPHA.map(L=>({L}));
  else if (id==='ord'){
    const all = T.words.map(([w,e],wi)=>({w,e,wi}));
    const pool = shuffle(all.slice(0, -T.finale)), me = nameWord();
    const ws = [...(me ? [{w:me, e:'💖', isName:true}] : []), ...pool.filter(x=>x.w.length<=4).slice(0, me ? 3 : 4), pool.find(x=>x.w.length>=5), pick(all.slice(-T.finale))];
    G.items = ws.map(x=>({...x, c:pickCase()}));
  } else G.items = shuffle(ALPHA).slice(0,10).map(L=>({L,c:pickCase()}));
  hit('game-' + id);
  show('game'); buildKb(); render();
  say([g('intro'+cap(id)), ...prompt()]);
}
const item = () => G.items[G.i];
const target = () => G.id==='ord' ? item().w[G.pos] : item().L;
const findKey = c => S.letterCase==='both' && c ? (c==='lower' ? 'findL' : 'findU') : 'find';

function prompt(){
  const it = item(), L = target();
  switch (G.id){
    case 'alfabet':
      if (G.i===0) return [per('start',L)];
      if (G.i===ALPHA.length-1) return [g('alphaLast')];
      return [per('next',L)];
    case 'hitta': case 'lyssna': return [per(findKey(it.c), L)];
    case 'para': return [per(it.c==='upper' ? 'pairU' : 'pairL', L)];
    case 'ord':
      if (G.pos>0) return [per('next',L)];
      return [it.isName ? g('nameStart') : wordPart('word',it), per('start',L)];
  }
}

function render(){
  const it = item(), card = $('#card'), ch = $('#choices'), id = G.id;
  G.wrong = 0;
  card.className = ''; ch.innerHTML = ''; ch.hidden = true;
  $$('.hint').forEach(e=>e.classList.remove('hint'));
  if (id==='alfabet') card.textContent = S.letterCase==='both' ? it.L+' '+it.L.toLowerCase() : disp(it.L,S.letterCase);
  if (id==='hitta') card.textContent = disp(it.L,it.c);
  if (id==='lyssna' || id==='para'){
    card.classList.add('compact');
    card.textContent = id==='lyssna' ? '👂' : disp(it.L,it.c);
    it.opts = it.opts || shuffle([it.L, ...shuffle(ALPHA.filter(x=>x!==it.L)).slice(0,3)]);
    const oc = id==='para' ? (it.c==='upper'?'lower':'upper') : it.c;
    ch.hidden = false;
    ch.innerHTML = it.opts.map((L,i)=>`<button class="choice" data-k="${L}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(L,oc)}</button>`).join('');
  }
  if (id==='ord'){
    card.classList.add('compact');
    card.innerHTML = `<span class="pic">${it.e}</span><div class="slots" style="--n:${it.w.length}">${[...it.w].map((L,i)=>`<span class="slot ${i<G.pos?'done':i===G.pos?'now':''}">${disp(L,it.c)}</span>`).join('')}</div>`;
  }
  const p = $('#progress');
  if (id==='alfabet') p.innerHTML = ALPHA.map((L,i)=>`<span class="dot ${i<G.i?'done':i===G.i?'now':''}" ${i<G.i?`style="background:var(${COLORS[i%6]})"`:''}>${disp(L,S.letterCase==='lower'?'lower':'upper')}</span>`).join('');
  else p.innerHTML = G.items.map((_,i)=>`<span class="pip ${i<G.i?'done':''}">${i<G.i?(i%2?'🦄':'🐞'):''}</span>`).join('');
}

function hint(){
  const t = target();
  $$(`#kb [data-k="${t}"], #choices [data-k="${t}"]`).forEach(e=>e.classList.add('hint'));
}
function flash(cls){ const c = $('#card'); c.classList.remove('yay','no'); void c.offsetWidth; c.classList.add(cls); }
function showStars(){ $$('.starcount').forEach(e => e.textContent = S.stars); }

function press(k){
  if (screen!=='game' || !G || G.lock) return;
  const t = target(), it = item();
  if (k !== t){
    G.wrong++; sfxNo(); flash('no');
    if (G.wrong>=2) hint();
    say([g('wrong'), per(G.id==='hitta' || G.id==='lyssna' ? findKey(it.c) : 'find', t)]);
    return;
  }
  S.stars++; save(); showStars(); sfxYes(); flash('yay'); burst(12, $('#card'));
  const last = G.i === G.items.length-1;
  if (G.id==='alfabet'){
    if (last){ G.lock = true; $$('#progress .dot').forEach((d,i)=>{ d.className='dot done'; d.style.background=`var(${COLORS[i%6]})`; }); say([per('L',t), g('long')], win); return; }
    G.i++; render(); say([g('short'), ...prompt()]); return;
  }
  if (G.id==='ord'){
    G.pos++;
    if (G.pos < it.w.length){ render(); say([g('short'), ...prompt()]); return; }
    G.lock = true; render(); burst(16, $('#card'));
    say([it.isName ? g('wroteName') : wordPart('wrote',it), g('long')], () => advance(last)); return;
  }
  G.lock = true;
  if (G.id==='lyssna') $('#card').textContent = disp(it.L,it.c);
  $$('#choices .choice').forEach(b => { if (b.dataset.k!==t) b.style.opacity = .25; });
  say(g('long'), () => advance(last));
}
function advance(last){
  if (!G) return;
  if (last) return win();
  G.i++; G.pos = 0; G.lock = false; render(); say(prompt());
}
function win(){
  if (!G) return;
  const id = G.id; G = null;
  const st = pick(STICKERS); S.stickers.push(st); S.stars += 5; save();
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
$('#again').onclick = () => { if (G && !G.lock) say(prompt()); };
$('#langSeg').addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (!b) return; S.lang = b.dataset.lang; save(); applyLang(); });

const dlg = $('#settings');
$('#openSettings').onclick = () => { refresh(); $('#fullscreen').hidden = !document.fullscreenEnabled; dlg.showModal(); };
$('#closeSettings').onclick = () => dlg.close();
$('#changeName').onclick = () => { dlg.close(); G = null; tok++; player.pause(); show('start'); };
document.addEventListener('click', e => {
  const c = e.target.closest('[data-case]');
  if (c){ S.letterCase = c.dataset.case; save(); refresh(); if (!dlg.open) say(g('case'+cap(S.letterCase))); return; }
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
  if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || dlg.open) return;
  if (screen==='start'){ if (e.key==='Enter'){ e.preventDefault(); begin(); } return; }
  if (e.key==='Escape'){ if (screen!=='home') goHome(); return; }
  if (screen==='home'){ const n = e.key.length===1 ? '12345'.indexOf(e.key) : -1; if (n>=0){ e.preventDefault(); startGame(GAME_META[n].id); } return; }
  if (screen==='win'){ if (e.key==='Enter' || e.key===' '){ e.preventDefault(); startGame(lastId); } return; }
  if (screen==='game'){
    if (e.key===' ' || e.key==='Enter'){ e.preventDefault(); if (G && !G.lock) say(prompt()); return; }
    const k = e.key.toLocaleUpperCase(S.lang);
    if (k.length===1 && ALPHA.includes(k)){ e.preventDefault(); press(k); }
  }
});

applyLang();
loadStats();
if (!S.name && matchMedia('(pointer:fine)').matches) $('#name').focus();
})();
