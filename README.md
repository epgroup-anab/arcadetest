# Pocket Arcade

A colourful, mobile-first browser arcade with eight complete games:

- Snake Trail
- Block Drop
- Word Pop
- Merge 2048
- Flip Friends
- Mine Garden
- Brick Bounce
- Star Catch

Scores and settings are stored locally in the player's browser. There are no accounts, external services, ads, or backend requirements.

## Run locally

```bash
npm install
npm run dev
```

Open the local address shown in the terminal.

## Deploy to Netlify

This project includes `netlify.toml`. Import the project into Netlify from a Git repository, or upload the unzipped source and use:

- Build command: `npx next build`
- Publish directory: `.next`
- Node version: `22`

Netlify's Next.js support handles the site automatically.
