# ⚡ GearKai — Tactical Scouter

A premium, gamified nutrition and fitness tracking application with a tactical sci-fi dashboard aesthetic.

---

## 🚀 Deploy to Vercel (Recommended)

### Option A — Drag & Drop (No account needed for CLI)
1. Run `npm run build` to generate the `dist/` folder
2. Go to [vercel.com](https://vercel.com)
3. Drag the `dist/` folder onto the Vercel dashboard
4. Live URL generated instantly ✅

### Option B — Connect GitHub for Auto-Deploy
1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → Add New Project → Import from GitHub
3. Leave all settings default — Vercel detects Vite automatically
4. Every `git push` triggers an automatic redeploy ✅

---

## 💻 Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## 🏗 Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder — deploy this anywhere.

---

## 🌐 Deploy to Other Platforms

### Netlify
- Drag & drop the `dist/` folder at [netlify.com/drop](https://netlify.com/drop)

### GitHub Pages
```bash
npm install -D gh-pages
npx gh-pages -d dist
```

---

## 📁 Project Structure

```
gearkai/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        ← Main GearKai application
│   ├── main.jsx       ← React entry point
│   └── index.css      ← Global styles
├── index.html
├── vite.config.js
├── vercel.json        ← SPA routing fix for Vercel
├── package.json
└── .gitignore
```

---

## 🔮 Adding Firebase & Gemini (Next Steps)

Create a `.env` file in the root:

```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_gemini_key
```

Access in code via `import.meta.env.VITE_FIREBASE_API_KEY`

Add these same variables in Vercel → Project Settings → Environment Variables before deploying.

---

## ⚙️ Tech Stack

- **React 18** — UI framework
- **Vite** — Build tool
- **Framer Motion** — Animations
- **Lucide React** — Icons
- **Orbitron + Inter** — Typography (Google Fonts, loaded via CSS)
