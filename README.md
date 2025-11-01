# MonkMusic - Spotify Clip Generator

A single-file HTML application that generates 5-second video overlay mocks from Spotify track URLs.

## Features

- Paste a Spotify track URL to fetch real song data (title, artist, album art)
- Enter a short text review (max 100 characters)
- Set a custom rating (0-10 scale)
- Generate a video overlay preview with all information

## Setup for Spotify API Integration

To enable real Spotify data fetching, you need to set up a Spotify API application:

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in:
   - App name: `MonkMusic` (or any name)
   - Description: `Generate video overlays from Spotify tracks`
   - Redirect URI: `http://localhost:3000` (for local development)
5. Click **"Save"**
6. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your credentials:
   ```
   SPOTIFY_CLIENT_ID=your_actual_client_id
   SPOTIFY_CLIENT_SECRET=your_actual_client_secret
   ```

### 3. Run with Next.js

The app requires a Next.js API route to securely handle Spotify API calls.

**Option A: Next.js App Router (recommended)**

1. Create `app/api/spotify/route.js` (already created)
2. Install dependencies:
   ```bash
   npm install next react react-dom
   ```
3. Add to `package.json`:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     }
   }
   ```
4. Move `index.html` to `app/page.tsx` or serve it as a static file
5. Run:
   ```bash
   npm run dev
   ```

**Option B: Standalone HTML (fallback mode)**

If you don't set up the API route, the app will automatically fall back to mock data.

## Tech Stack

- HTML/CSS/JavaScript (single-file app)
- Tailwind CSS (via CDN)
- Next.js API routes (for Spotify integration)
- Spotify Web API

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
4. Deploy

The API route at `/api/spotify` will be automatically available.

