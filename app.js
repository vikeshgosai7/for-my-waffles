const HISTORY_KEY = 'fmw_history';
const MAX_HISTORY = 20;

let excludedRecs = [];
let currentRec = null;
let currentQuery = null;

// ── RECOMMENDATION ──

async function findRecommendation() {
  const book = document.getElementById('bookInput').value.trim();
  const mood = document.getElementById('moodSelect').value;
  const open = document.getElementById('openSelect').value;

  if (!book) {
    document.getElementById('bookInput').focus();
    return;
  }

  currentQuery = { book, mood, open };

  setLoading(true);

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book, mood, open, excluded: excludedRecs })
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    currentRec = data;
    excludedRecs.push(`${data.title} by ${data.author}`);

    renderRecommendation(data);
    saveToHistory(data, book);
    renderHistory();

  } catch (e) {
    showError('Could not connect. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
}

function findAnother() {
  if (!currentQuery) return;
  const { book, mood, open } = currentQuery;
  document.getElementById('bookInput').value = book;
  document.getElementById('moodSelect').value = mood;
  document.getElementById('openSelect').value = open;
  findRecommendation();
}

function renderRecommendation(rec) {
  const paras = Array.isArray(rec.recommendation)
    ? rec.recommendation.map(p => `<p>${p}</p>`).join('')
    : `<p>${rec.recommendation}</p>`;

  const tags = (rec.tags || []).map(t => `<span class="rec-tag">${t}</span>`).join('');

  document.getElementById('recContent').innerHTML = `
    <h2 class="rec-title">
      ${rec.title}
      ${rec.year ? `<span class="rec-year">(${rec.year})</span>` : ''}
    </h2>
    <p class="rec-author">${rec.author}</p>
    <div class="rec-body">${paras}</div>
    <div class="rec-tags">${tags}</div>
  `;

  document.getElementById('result').classList.add('visible');
  document.getElementById('errorMsg').classList.remove('visible');

  document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── SHARE ──

function shareRec() {
  if (!currentRec || !currentQuery) return;

  const params = new URLSearchParams({
    title: currentRec.title,
    author: currentRec.author,
    year: currentRec.year || '',
    book: currentQuery.book,
    tags: (currentRec.tags || []).join(','),
    p0: Array.isArray(currentRec.recommendation) ? currentRec.recommendation[0] : currentRec.recommendation,
    p1: Array.isArray(currentRec.recommendation) ? (currentRec.recommendation[1] || '') : '',
    p2: Array.isArray(currentRec.recommendation) ? (currentRec.recommendation[2] || '') : '',
  });

  const shareUrl = `${window.location.origin}/share.html?${params.toString()}`;

  navigator.clipboard.writeText(shareUrl).then(() => {
    showToast('Link copied to clipboard');
  }).catch(() => {
    prompt('Copy this link:', shareUrl);
  });
}

// ── HISTORY ──

function saveToHistory(rec, query) {
  const history = getHistory();
  const entry = {
    id: Date.now(),
    title: rec.title,
    author: rec.author,
    year: rec.year,
    recommendation: rec.recommendation,
    tags: rec.tags,
    query,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };

  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function clearHistory() {
  if (!confirm('Clear your entire reading history?')) return;
  localStorage.removeItem(HISTORY_KEY);
  excludedRecs = [];
  renderHistory();
}

function renderHistory() {
  const section = document.getElementById('historySection');
  const list = document.getElementById('historyList');
  if (!section || !list) return;

  const history = getHistory();

  if (history.length === 0) {
    list.innerHTML = '<p class="history-empty">Your recommended books will appear here.</p>';
    return;
  }

  list.innerHTML = `
    <div class="history-grid">
      ${history.map(entry => `
        <div class="history-item" onclick="loadFromHistory(${entry.id})">
          <span class="history-item-title">${entry.title} <span style="font-style:italic;color:var(--ink-muted);font-family:var(--body);font-size:14px;">by ${entry.author}</span></span>
          <span class="history-item-meta">${entry.date}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function loadFromHistory(id) {
  const history = getHistory();
  const entry = history.find(e => e.id === id);
  if (!entry) return;

  document.getElementById('bookInput').value = entry.query || '';
  currentRec = entry;
  currentQuery = { book: entry.query, mood: '', open: '' };
  renderRecommendation(entry);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── UI HELPERS ──

function setLoading(on) {
  document.getElementById('findBtn').disabled = on;
  document.getElementById('loading').classList.toggle('visible', on);
  if (on) {
    document.getElementById('result').classList.remove('visible');
    document.getElementById('errorMsg').classList.remove('visible');
  }
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('visible');
}

function showToast(msg, duration = 2200) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── INIT ──

document.addEventListener('DOMContentLoaded', () => {
  renderHistory();

  // Auto-expand textarea
  const ta = document.getElementById('bookInput');
  if (ta) {
    ta.addEventListener('input', () => {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });

    ta.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') findRecommendation();
    });
  }
});
