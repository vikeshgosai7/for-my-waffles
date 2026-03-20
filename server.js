const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.');
  process.exit(1);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--ink:#1a1814;--ink-muted:#6b6760;--ink-faint:#b5b2ab;--paper:#faf8f4;--paper-warm:#f2ede4;--paper-rule:#e4dfd6;--accent:#8b4a2f;--serif:'Playfair Display',Georgia,serif;--body:'Lora',Georgia,serif;--sans:'DM Sans',system-ui,sans-serif;--max:720px;--t:0.2s ease}
html{font-size:16px;-webkit-font-smoothing:antialiased}
body{background:var(--paper);color:var(--ink);font-family:var(--body);min-height:100vh;line-height:1.7}
nav{border-bottom:1px solid var(--paper-rule);padding:0 2rem;display:flex;align-items:center;justify-content:space-between;height:56px;position:sticky;top:0;background:var(--paper);z-index:100}
.nav-brand{font-family:var(--serif);font-size:18px;font-weight:400;font-style:italic;color:var(--ink);text-decoration:none}
.nav-links{display:flex;gap:2rem;align-items:center}
.nav-links a{font-family:var(--sans);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-muted);text-decoration:none;transition:color var(--t)}
.nav-links a:hover,.nav-links a.active{color:var(--ink)}
.nav-links a.active{border-bottom:1px solid var(--ink);padding-bottom:1px}
.container{max-width:var(--max);margin:0 auto;padding:0 2rem}
.masthead{text-align:center;padding:4rem 2rem 3rem;border-bottom:1px solid var(--paper-rule);margin-bottom:3rem}
.masthead-kicker{font-family:var(--sans);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-faint);margin-bottom:1rem;display:flex;align-items:center;justify-content:center;gap:12px}
.masthead-kicker::before,.masthead-kicker::after{content:'';display:block;width:40px;height:1px;background:var(--paper-rule)}
.masthead h1{font-family:var(--serif);font-size:clamp(2.4rem,6vw,3.6rem);font-weight:400;line-height:1.1;letter-spacing:-.02em;color:var(--ink);margin-bottom:.75rem}
.masthead-sub{font-family:var(--body);font-size:15px;color:var(--ink-muted);font-style:italic;max-width:380px;margin:0 auto}
.form-section{margin-bottom:3rem}
.form-label{font-family:var(--sans);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);display:block;margin-bottom:.5rem}
textarea{width:100%;min-height:120px;font-family:var(--body);font-size:15px;line-height:1.75;color:var(--ink);background:transparent;border:none;border-bottom:1px solid var(--paper-rule);padding:.5rem 0 1rem;resize:none;outline:none;transition:border-color var(--t)}
textarea:focus{border-bottom-color:var(--ink-muted)}
textarea::placeholder{color:var(--ink-faint);font-style:italic}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:2rem;margin-top:1.5rem}
select{width:100%;font-family:var(--sans);font-size:13px;color:var(--ink);background:transparent;border:none;border-bottom:1px solid var(--paper-rule);padding:.5rem 0;outline:none;cursor:pointer;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23b5b2ab'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 0 center}
.btn-find{margin-top:2.5rem;display:flex;align-items:center;gap:10px;font-family:var(--sans);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--paper);background:var(--ink);border:none;padding:14px 28px;cursor:pointer;transition:background var(--t),transform var(--t)}
.btn-find:hover{background:var(--accent)}.btn-find:active{transform:scale(.99)}.btn-find:disabled{opacity:.35;cursor:default;background:var(--ink)}
.btn-ghost{font-family:var(--sans);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-muted);background:none;border:none;cursor:pointer;padding:0;transition:color var(--t);display:inline-flex;align-items:center;gap:6px}
.btn-ghost:hover{color:var(--ink)}
#loading{display:none;text-align:center;padding:3rem 0}
#loading.visible{display:block}
.loading-line{width:48px;height:1px;background:var(--ink-faint);margin:0 auto 1rem;position:relative;overflow:hidden}
.loading-line::after{content:'';position:absolute;left:-100%;top:0;width:100%;height:100%;background:var(--ink);animation:slide 1.2s ease-in-out infinite}
@keyframes slide{0%{left:-100%}100%{left:100%}}
.loading-text{font-family:var(--body);font-size:13px;color:var(--ink-faint);font-style:italic}
#result{display:none}#result.visible{display:block}
.result-rule{display:flex;align-items:center;gap:1.5rem;margin:2rem 0 2.5rem;color:var(--ink-faint);font-family:var(--sans);font-size:10px;letter-spacing:.14em;text-transform:uppercase}
.result-rule::before,.result-rule::after{content:'';flex:1;height:1px;background:var(--paper-rule)}
.rec-title{font-family:var(--serif);font-size:clamp(1.6rem,4vw,2.2rem);font-weight:400;line-height:1.2;letter-spacing:-.01em;margin-bottom:.2rem}
.rec-year{font-size:1rem;font-weight:400;color:var(--ink-faint)}
.rec-author{font-family:var(--body);font-size:14px;color:var(--ink-muted);font-style:italic;margin-bottom:1.75rem}
.rec-body{font-family:var(--body);font-size:16px;line-height:1.85;color:var(--ink)}
.rec-body p{margin-bottom:1.1rem}.rec-body p:last-child{margin-bottom:0}
.rec-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:1.75rem}
.rec-tag{font-family:var(--sans);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-muted);border:1px solid var(--paper-rule);padding:5px 12px}
.result-actions{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-top:2.5rem;padding-top:1.5rem;border-top:1px solid var(--paper-rule)}
.result-actions-left,.result-actions-right{display:flex;gap:1.5rem;align-items:center}
.toast{position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(8px);background:var(--ink);color:var(--paper);font-family:var(--sans);font-size:12px;letter-spacing:.06em;padding:10px 20px;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none;z-index:999}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.error-msg{display:none;font-family:var(--body);font-size:14px;font-style:italic;color:var(--accent);padding:1rem 0}
.error-msg.visible{display:block}
.history-section{border-top:1px solid var(--paper-rule);margin-top:4rem;padding-top:2.5rem;padding-bottom:4rem}
.history-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:1.5rem}
.history-header h2{font-family:var(--serif);font-size:18px;font-weight:400;font-style:italic}
.history-grid{display:grid;gap:1px;background:var(--paper-rule);border:1px solid var(--paper-rule)}
.history-item{background:var(--paper);padding:1rem 1.25rem;display:flex;align-items:baseline;justify-content:space-between;gap:1rem;cursor:pointer;transition:background var(--t)}
.history-item:hover{background:var(--paper-warm)}
.history-item-title{font-family:var(--serif);font-size:16px;font-weight:400}
.history-item-meta{font-family:var(--sans);font-size:11px;color:var(--ink-faint);white-space:nowrap;flex-shrink:0}
.history-empty{font-family:var(--body);font-size:14px;color:var(--ink-faint);font-style:italic;padding:1rem 0}
footer{border-top:1px solid var(--paper-rule);padding:1.5rem 2rem;display:flex;align-items:center;justify-content:space-between}
.footer-brand{font-family:var(--serif);font-size:14px;font-style:italic;color:var(--ink-faint)}
.footer-note{font-family:var(--sans);font-size:11px;color:var(--ink-faint);letter-spacing:.04em}
@media(max-width:560px){.form-row{grid-template-columns:1fr;gap:1.25rem}.result-actions{flex-direction:column;align-items:flex-start}nav{padding:0 1rem}.container{padding:0 1rem}footer{flex-direction:column;gap:.5rem;text-align:center}}
`;

const JS = `
const HISTORY_KEY='fmw_history',MAX_HISTORY=20;
let excludedRecs=[],currentRec=null,currentQuery=null;

async function findRecommendation(){
  const book=document.getElementById('bookInput').value.trim();
  const mood=document.getElementById('moodSelect').value;
  const open=document.getElementById('openSelect').value;
  if(!book){document.getElementById('bookInput').focus();return;}
  currentQuery={book,mood,open};
  setLoading(true);
  try{
    const res=await fetch('/api/recommend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({book,mood,open,excluded:excludedRecs})});
    const data=await res.json();
    if(!res.ok){showError(data.error||'Something went wrong.');return;}
    currentRec=data;
    excludedRecs.push(data.title+' by '+data.author);
    renderRecommendation(data);
    saveToHistory(data,book);
    renderHistory();
  }catch(e){showError('Could not connect. Please try again.');}
  finally{setLoading(false);}
}

function findAnother(){
  if(!currentQuery)return;
  document.getElementById('bookInput').value=currentQuery.book;
  document.getElementById('moodSelect').value=currentQuery.mood;
  document.getElementById('openSelect').value=currentQuery.open;
  findRecommendation();
}

function renderRecommendation(rec){
  const paras=Array.isArray(rec.recommendation)?rec.recommendation.map(p=>'<p>'+p+'</p>').join(''):'<p>'+rec.recommendation+'</p>';
  const tags=(rec.tags||[]).map(t=>'<span class="rec-tag">'+t+'</span>').join('');
  document.getElementById('recContent').innerHTML='<h2 class="rec-title">'+rec.title+(rec.year?' <span class="rec-year">('+rec.year+')</span>':'')+'</h2><p class="rec-author">'+rec.author+'</p><div class="rec-body">'+paras+'</div><div class="rec-tags">'+tags+'</div>';
  document.getElementById('result').classList.add('visible');
  document.getElementById('errorMsg').classList.remove('visible');
  document.getElementById('result').scrollIntoView({behavior:'smooth',block:'start'});
}

function shareRec(){
  if(!currentRec||!currentQuery)return;
  const params=new URLSearchParams({title:currentRec.title,author:currentRec.author,year:currentRec.year||'',book:currentQuery.book,tags:(currentRec.tags||[]).join(','),p0:Array.isArray(currentRec.recommendation)?currentRec.recommendation[0]:currentRec.recommendation,p1:Array.isArray(currentRec.recommendation)?(currentRec.recommendation[1]||''):'',p2:Array.isArray(currentRec.recommendation)?(currentRec.recommendation[2]||''):''});
  const url=window.location.origin+'/share?'+params.toString();
  navigator.clipboard.writeText(url).then(()=>showToast('Link copied!')).catch(()=>prompt('Copy this link:',url));
}

function saveToHistory(rec,query){
  const h=getHistory();
  h.unshift({id:Date.now(),title:rec.title,author:rec.author,year:rec.year,recommendation:rec.recommendation,tags:rec.tags,query,date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})});
  if(h.length>MAX_HISTORY)h.pop();
  localStorage.setItem(HISTORY_KEY,JSON.stringify(h));
}

function getHistory(){try{return JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');}catch{return[];}}

function clearHistory(){
  if(!confirm('Clear your entire reading history?'))return;
  localStorage.removeItem(HISTORY_KEY);excludedRecs=[];renderHistory();
}

function renderHistory(){
  const list=document.getElementById('historyList');
  if(!list)return;
  const h=getHistory();
  if(!h.length){list.innerHTML='<p class="history-empty">Your recommended books will appear here.</p>';return;}
  list.innerHTML='<div class="history-grid">'+h.map(e=>'<div class="history-item" onclick="loadFromHistory('+e.id+')"><span class="history-item-title">'+e.title+' <span style="font-style:italic;color:var(--ink-muted);font-family:var(--body);font-size:14px;">by '+e.author+'</span></span><span class="history-item-meta">'+e.date+'</span></div>').join('')+'</div>';
}

function loadFromHistory(id){
  const e=getHistory().find(x=>x.id===id);
  if(!e)return;
  document.getElementById('bookInput').value=e.query||'';
  currentRec=e;currentQuery={book:e.query,mood:'',open:''};
  renderRecommendation(e);window.scrollTo({top:0,behavior:'smooth'});
}

function setLoading(on){
  document.getElementById('findBtn').disabled=on;
  document.getElementById('loading').classList.toggle('visible',on);
  if(on){document.getElementById('result').classList.remove('visible');document.getElementById('errorMsg').classList.remove('visible');}
}

function showError(msg){const el=document.getElementById('errorMsg');el.textContent=msg;el.classList.add('visible');}
function showToast(msg,d=2200){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),d);}

document.addEventListener('DOMContentLoaded',()=>{
  renderHistory();
  const ta=document.getElementById('bookInput');
  if(ta){
    ta.addEventListener('input',()=>{ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';});
    ta.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter')findRecommendation();});
  }
});
`;

const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>For My Waffles — A Reading Companion</title>
<meta name="description" content="Tell us about a book you loved. We'll find what comes next.">
<style>${CSS}</style>
</head>
<body>
<nav>
  <a class="nav-brand" href="/">For My Waffles</a>
  <div class="nav-links"><a href="/" class="active">Read</a><a href="/about">About</a></div>
</nav>
<main>
  <div class="masthead">
    <div class="masthead-kicker">A reading companion</div>
    <h1>For My Waffles</h1>
    <p class="masthead-sub">Tell us about a book that stayed with you. We'll find what comes next.</p>
  </div>
  <div class="container">
    <div class="form-section">
      <label class="form-label" for="bookInput">A book you loved</label>
      <textarea id="bookInput" placeholder="Describe a book that moved you — what you loved about it, how it made you feel, a character or line you can't forget…" rows="5"></textarea>
      <div class="form-row">
        <div>
          <label class="form-label" for="moodSelect">Mood</label>
          <select id="moodSelect">
            <option value="">Any mood</option>
            <option value="contemplative and slow-burning">Contemplative &amp; slow-burning</option>
            <option value="immersive and emotionally intense">Immersive &amp; intense</option>
            <option value="warm and character-driven">Warm &amp; character-driven</option>
            <option value="dark and unsettling">Dark &amp; unsettling</option>
            <option value="epic and sweeping">Epic &amp; sweeping</option>
            <option value="quiet and introspective">Quiet &amp; introspective</option>
          </select>
        </div>
        <div>
          <label class="form-label" for="openSelect">Open to</label>
          <select id="openSelect">
            <option value="literary fiction and narrative non-fiction">Anything literary</option>
            <option value="literary fiction only">Fiction only</option>
            <option value="narrative non-fiction and history">Non-fiction &amp; history</option>
            <option value="short stories and novellas">Short stories &amp; novellas</option>
            <option value="international and translated literature">Translated &amp; international</option>
          </select>
        </div>
      </div>
      <button class="btn-find" id="findBtn" onclick="findRecommendation()">Find my next book →</button>
    </div>
    <div id="loading"><div class="loading-line"></div><p class="loading-text">Searching the shelves…</p></div>
    <p class="error-msg" id="errorMsg"></p>
    <div id="result">
      <div class="result-rule">Recommended</div>
      <div id="recContent"></div>
      <div class="result-actions">
        <div class="result-actions-left"><button class="btn-ghost" onclick="findAnother()">Another recommendation →</button></div>
        <div class="result-actions-right"><button class="btn-ghost" onclick="shareRec()">Share ↗</button></div>
      </div>
    </div>
    <div class="history-section" id="historySection">
      <div class="history-header">
        <h2>Your reading history</h2>
        <button class="btn-ghost" onclick="clearHistory()" style="font-size:10px;">Clear all</button>
      </div>
      <div id="historyList"></div>
    </div>
  </div>
</main>
<footer>
  <span class="footer-brand">For My Waffles</span>
  <span class="footer-note">Powered by Claude · Every recommendation hand-considered</span>
</footer>
<div class="toast" id="toast"></div>
<script>${JS}</script>
</body>
</html>`;

const ABOUT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>About — For My Waffles</title>
<style>${CSS}</style>
</head>
<body>
<nav>
  <a class="nav-brand" href="/">For My Waffles</a>
  <div class="nav-links"><a href="/">Read</a><a href="/about" class="active">About</a></div>
</nav>
<main>
  <div class="masthead">
    <div class="masthead-kicker">About</div>
    <h1>How it works</h1>
    <p class="masthead-sub">A reading companion built on the idea that the best book recommendations come from someone who actually listened.</p>
  </div>
  <div class="about-body container">
    <h2>The idea</h2>
    <p>Most book recommendation tools match genres or bestseller lists. For My Waffles does something different — it listens to how you <em>talk</em> about a book you loved.</p>
    <p>From that, it finds you something that fits — not by category, but by feel.</p>
    <h2>How to use it</h2>
    <div class="about-step"><div class="about-step-num">1</div><div class="about-step-text"><strong>Describe a book you loved</strong><p>Don't just give the title. Tell us what moved you about it.</p></div></div>
    <div class="about-step"><div class="about-step-num">2</div><div class="about-step-text"><strong>Set your mood and preferences</strong><p>Choose the kind of reading experience you're after right now.</p></div></div>
    <div class="about-step"><div class="about-step-num">3</div><div class="about-step-text"><strong>Read the recommendation</strong><p>A single book with three paragraphs of considered context.</p></div></div>
    <div class="about-step"><div class="about-step-num">4</div><div class="about-step-text"><strong>Ask for another, or share it</strong><p>Not quite right? Ask for another. Found something great? Copy a shareable link.</p></div></div>
    <h2>Your history</h2>
    <p>Recommendations are saved locally in your browser — nothing is stored on any server.</p>
    <h2>Built by</h2>
    <p>For My Waffles is a personal project powered by <a href="https://www.anthropic.com/claude" style="color:var(--ink);text-decoration:underline;text-underline-offset:3px;">Claude</a> by Anthropic.</p>
  </div>
</main>
<footer>
  <span class="footer-brand">For My Waffles</span>
  <span class="footer-note">Powered by Claude · Every recommendation hand-considered</span>
</footer>
</body>
</html>`;

const SHARE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>A recommendation — For My Waffles</title>
<style>${CSS}</style>
</head>
<body>
<nav>
  <a class="nav-brand" href="/">For My Waffles</a>
  <div class="nav-links"><a href="/">Read</a><a href="/about">About</a></div>
</nav>
<main>
  <div class="masthead">
    <div class="masthead-kicker">Shared recommendation</div>
    <h1 id="shareTitle">—</h1>
    <p class="masthead-sub" id="shareAuthor"></p>
  </div>
  <div class="container">
    <div id="shareContent"></div>
    <div style="margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--paper-rule)">
      <a href="/" class="btn-find" style="text-decoration:none;display:inline-flex;align-items:center;gap:10px;">Get your own recommendation →</a>
    </div>
  </div>
</main>
<footer>
  <span class="footer-brand">For My Waffles</span>
  <span class="footer-note">Powered by Claude · Every recommendation hand-considered</span>
</footer>
<script>
const p=new URLSearchParams(window.location.search);
const title=p.get('title')||'A recommendation';
document.title=title+' — For My Waffles';
document.getElementById('shareTitle').textContent=title;
const author=p.get('author')||'';const year=p.get('year')||'';
document.getElementById('shareAuthor').textContent=author+(year?' ('+year+')':'');
const paras=[p.get('p0'),p.get('p1'),p.get('p2')].filter(Boolean).map(x=>'<p>'+x+'</p>').join('');
const tags=(p.get('tags')||'').split(',').filter(Boolean).map(t=>'<span class="rec-tag">'+t+'</span>').join('');
const book=p.get('book')||'';
document.getElementById('shareContent').innerHTML=(book?'<p style="font-family:var(--body);font-size:13px;color:var(--ink-muted);font-style:italic;margin-bottom:1.5rem;">Based on: \u201c'+book+'\u201d</p>':'')+'<div class="rec-body">'+paras+'</div>'+(tags?'<div class="rec-tags" style="margin-top:1.5rem;">'+tags+'</div>':'');
</script>
</body>
</html>`;

app.get('/', (req, res) => res.send(INDEX_HTML));
app.get('/about', (req, res) => res.send(ABOUT_HTML));
app.get('/share', (req, res) => res.send(SHARE_HTML));

app.post('/api/recommend', async (req, res) => {
  const { book, mood, open, excluded = [] } = req.body;
  if (!book || book.trim().length < 5) {
    return res.status(400).json({ error: 'Please describe a book you loved.' });
  }
  const excludeNote = excluded.length ? `Do not recommend any of these already suggested books: ${excluded.join(', ')}.` : '';
  const prompt = `You are a deeply well-read literary companion with refined taste. A reader has described a book they loved. Give them one beautifully considered recommendation.

Reader's description: "${book}"
${mood ? `Mood they want: ${mood}` : ''}
${open ? `Open to: ${open}` : ''}
${excludeNote}

Respond ONLY with a valid JSON object, no markdown, no backticks, no preamble. Use this exact structure:
{
  "title": "Book title",
  "author": "Author name",
  "year": "Publication year",
  "recommendation": ["paragraph one", "paragraph two", "paragraph three"],
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

The recommendation array should have exactly 3 paragraph strings - rich, personal, literary. Warm and specific, not blurby.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
    });
    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message || 'API error' });
    }
    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const rec = JSON.parse(text.replace(/```json|```/g, '').trim());
    res.json(rec);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`For My Waffles running on http://localhost:${PORT}`));
