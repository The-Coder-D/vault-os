# 🧠 Vault OS

**Your codebase, finally documented.**

Paste a code snippet in, and Vault OS uses Google's Gemini model to summarize what it does, detect its time complexity, flag security vulnerabilities, and tag it — then permanently saves the analysis to a searchable, per-user history ("the Vault") backed by PostgreSQL. You can also ask it to refactor/optimize the snippet, and export your entire history as a clean HTML documentation manual.

![Vault OS landing page](./client/src/assets/hero.png)

## 🎥 Demo

- **Live demo:** https://vault-os-ruby.vercel.app/
- **Demo GIF:** [record a 15–20s clip of pasting a snippet → seeing the analysis → checking the saved history]

## 🤔 Why I built this

Every team has snippets, utils, and scripts nobody wants to document — and reading unfamiliar code to figure out what it does, how fast it runs, and whether it's safe takes real time. Vault OS automates that first pass: it reads the code, gives you a plain-English summary, a Big-O estimate, and a vulnerability check, and keeps a permanent record so you're not re-analyzing the same file twice. Along the way this project involved wrangling structured JSON output from an LLM reliably (including a subtle double-escaped-newline bug in Gemini's responses), adding retry/backoff for transient model errors, and wiring up per-user auth end-to-end with Clerk.

## ✨ Features

- **AI code analysis** — plain-English summary, detected language, Big-O time complexity, and vulnerability flags for any pasted snippet
- **AI refactoring** — one-click optimized rewrite of a snippet with an explanation of what changed
- **Persistent Vault** — every analysis is saved to Postgres per user, with a searchable sidebar of past snippets
- **Delete & manage history** — remove old snippets from your Vault
- **Export to docs** — generate a rendered HTML manual of your entire snippet history (via EJS)
- **Authentication** — Clerk-powered sign-in gates the workspace; the landing page stays public
- **Resilient AI calls** — automatic retry with exponential backoff on transient Gemini overload/rate-limit errors, plus schema-enforced JSON output so the model can't return malformed responses

## 🛠️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router
- Clerk (`@clerk/clerk-react`) for auth
- Monaco Editor (`@monaco-editor/react`) for the code input
- `react-markdown` for rendering AI explanations
- Framer Motion (`motion`), Lucide icons

**Backend**
- Node.js + Express 5
- Prisma ORM + PostgreSQL
- Google Gemini (`@google/genai`, model `gemini-2.5-flash`) with a fixed JSON response schema
- EJS for the exported documentation view

## 🚀 Run Locally

You'll need Node.js, a PostgreSQL database (e.g. a free [Prisma Postgres](https://www.prisma.io/postgres) or [Neon](https://neon.tech) instance), a [Gemini API key](https://ai.google.dev/), and a [Clerk](https://clerk.com) application.

```bash
git clone https://github.com/The-Coder-D/vault-os.git
cd vault-os
```

**1. Backend**

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
DATABASE_URL=your_postgres_connection_string
DIRECT_URL=your_postgres_direct_connection_string   # used for migrations
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

```bash
npx prisma migrate dev
npm run dev   # or: node server.js
```

**2. Frontend**

```bash
cd ../client
npm install
```

Create a `.env.local` file in `client/`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
```

The app will be running at `http://localhost:5173` (frontend) with the API on `http://localhost:3000`.

## 📡 API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/analyze` | Analyze a code snippet and save it to the Vault |
| `POST` | `/api/refactor` | Return an AI-optimized rewrite of a snippet |
| `GET` | `/api/snippets` | Fetch a user's saved snippet history |
| `DELETE` | `/api/snippets/:id` | Delete a saved snippet |
| `GET` | `/api/export` | Render the full history as an HTML doc manual |

## 🔮 Future Improvements

- Support for uploading full files/folders, not just single snippets
- Team/shared Vaults instead of strictly per-user
- Exportable PDF in addition to HTML
- Syntax-aware diffing between original and refactored code

---

Built by [The-Coder-D](https://github.com/The-Coder-D)
