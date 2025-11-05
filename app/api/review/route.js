import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GOOGLE_API_KEY' }, { status: 500 });
    }

    const body = await request.json();
    const { title, artist, genres = [], spotifyUrl, previewUrl } = body || {};

    if (!title || !artist) {
      return NextResponse.json({ error: 'Missing required fields: title, artist' }, { status: 400 });
    }

    const systemStyle = `You are Master Shifu of Sound, an ancient monk who meditated for decades atop the mountains of Melody where vinyls spin like prayer wheels and beats echo through bamboo. You now work as a senior A&R consultant at a massive modern label.

Your job: review new songs and artists as a wise, slightly jaded monk who secretly knows the industry.

Tone: funny, sharp, philosophical, and a little savage — but calm and balanced. Think Master Shifu, Mr. Miyagi, with a touch of Rick Rubin enlightenment. Use plain text (no emojis/emotes).`;

    const prompt = `Write a critique as Master Shifu of Sound.
Include: overall vibe, production quality, vocals/instrumentation, songwriting, originality/market fit, and one specific standout moment or flaw. Reference the metadata naturally. No emojis.

Format strictly as 6-10 separate short lines, each < 120 chars, no bullets or numbering. Put each thought on its own line so it can be displayed line-by-line in chat.

Track: ${title}
Artist(s): ${artist}
Genres/tags: ${Array.isArray(genres) ? genres.join(', ') : ''}
Spotify URL: ${spotifyUrl || ''}
Audio preview available: ${previewUrl ? 'yes' : 'no'}`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemStyle}\n\n${prompt}`,
      generationConfig: {
        temperature: 0.9,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 600
      }
    });

    const candidate = (
      response?.text ??
      response?.output_text ??
      (Array.isArray(response?.candidates)
        ? (response.candidates[0]?.content?.parts || [])
            .map(p => (typeof p?.text === 'string' ? p.text : ''))
            .join(' ').trim()
        : '')
    ).toString();
    const clean = candidate.trim();
    const lines = clean
      .split(/\r?\n+/)
      .map(s => s.replace(/^[-•\d\.\)\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 10);
    const messages = lines.map((text, i) => ({
      id: `${Date.now()}_${i}`,
      user: 'monk',
      color: '#a970ff',
      badges: i === 0 ? ['verified'] : [],
      text
    }));

    return NextResponse.json({ messages });
  } catch (e) {
    console.error('Review route error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


