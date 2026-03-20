# For My Waffles

A literary reading companion. Describe a book you loved — get a deeply considered recommendation back.

## Stack

- **Backend**: Node.js + Express (API proxy, keeps your Anthropic key secret)
- **Frontend**: Vanilla HTML/CSS/JS (no build step needed)

## Local setup

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm start
```

Open http://localhost:3000

For development with auto-restart:
```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev
```

## Deploy to Railway

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Deploy — Railway auto-detects Node and runs `npm start`

## Deploy to Render

1. Push to GitHub
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add env var: `ANTHROPIC_API_KEY`

## Deploy to Fly.io

```bash
fly launch
fly secrets set ANTHROPIC_API_KEY=sk-ant-...
fly deploy
```

## Deploy to Vercel (serverless)

Vercel needs a small adjustment — rename `server.js` to `api/recommend.js` and export the handler. Or use Railway/Render for simplest deployment.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `PORT` | No | Port to run on (default: 3000) |

## Project structure

```
for-my-waffles/
├── server.js          # Express server + API proxy
├── package.json
└── public/
    ├── index.html     # Main app
    ├── about.html     # How it works
    ├── share.html     # Shared recommendation view
    ├── style.css      # All styles
    └── app.js         # Frontend logic
```
