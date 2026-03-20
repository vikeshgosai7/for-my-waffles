const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY environment variable is not set.');
  process.exit(1);
}

// Debug: log where we are and what files exist
console.log('__dirname:', __dirname);
console.log('cwd:', process.cwd());
try {
  console.log('files in cwd:', fs.readdirSync(process.cwd()).join(', '));
} catch(e) {
  console.log('could not read cwd');
}

// Serve static files from current working directory
const staticDir = process.cwd();
app.use(express.static(staticDir));

app.post('/api/recommend', async (req, res) => {
  const { book, mood, open, excluded = [] } = req.body;

  if (!book || book.trim().length < 5) {
    return res.status(400).json({ error: 'Please describe a book you loved.' });
  }

  const excludeNote = excluded.length
    ? `Do not recommend any of these already suggested books: ${excluded.join(', ')}.`
    : '';

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

The recommendation array should have exactly 3 paragraph strings â€” rich, personal, literary. Focus on emotional texture, what kind of reader it suits, and a specific detail connecting it to what the reader loved. Warm and specific, not blurby.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(502).json({ error: err.error?.message || 'API error' });
    }

    const data = await response.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const rec = JSON.parse(clean);

    res.json(rec);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.get('*', (req, res) => {
  const indexPath = path.join(process.cwd(), 'index.html');
  console.log('Serving index from:', indexPath);
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`For My Waffles running on http://localhost:${PORT}`));
