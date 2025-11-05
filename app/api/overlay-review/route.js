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

    const prompt = `Review "${title}" by ${artist}${genres.length > 0 ? ` (${genres.join(', ')})` : ''}.

Provide:
1. A single witty, concise comment (max 100 chars) for the "Comments:" field
2. A score from 0.0 to 10.0 (one decimal place)

Format your response EXACTLY as:
Comment: [your comment here]
Score: [0.0-10.0]

Example:
Comment: This track slaps harder than a monk's sandal on a dusty floor.
Score: 7.5`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${systemStyle}\n\n${prompt}`,
      generationConfig: {
        temperature: 0.9,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 200
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

    // Parse comment and score
    const commentMatch = candidate.match(/Comment:\s*(.+?)(?:\n|Score:|$)/i);
    const scoreMatch = candidate.match(/Score:\s*(\d+\.?\d*)/i);

    const comment = commentMatch ? commentMatch[1].trim().slice(0, 100) : 'hmm… nothing to say?';
    const score = scoreMatch ? Math.max(0, Math.min(10, parseFloat(scoreMatch[1]))) : 7.0;

    if (isNaN(score)) {
      return NextResponse.json({ comment: 'hmm… nothing to say?', score: 7.0 });
    }

    return NextResponse.json({ comment, score });
  } catch (error) {
    console.error('Overlay review API error:', error);
    return NextResponse.json({ comment: 'hmm… nothing to say?', score: 7.0 });
  }
}

