export function parseSpotify(url) {
  try {
    const cleanUrl = url.trim();
    if (!cleanUrl) return null;
    const u = new URL(cleanUrl);
    const isTrack = /(?:www\.)?open\.spotify\.com/.test(u.hostname) && u.pathname.startsWith('/track/');
    if (!isTrack) return null;
    const pathParts = u.pathname.split('/').filter(p => p);
    const trackIndex = pathParts.indexOf('track');
    if (trackIndex === -1 || trackIndex === pathParts.length - 1) return null;
    const trackId = pathParts[trackIndex + 1];
    const cleanedId = trackId.split('?')[0].split('#')[0].trim();
    return cleanedId || null;
  } catch {
    return null;
  }
}

export async function fetchSongData(spotifyUrl, userReview) {
  const trackId = parseSpotify(spotifyUrl);
  if (!trackId) throw new Error('Invalid Spotify URL');
  const response = await fetch(`/api/spotify?trackId=${encodeURIComponent(trackId)}`);
  if (!response.ok) throw new Error('Failed to fetch from Spotify API');
  const data = await response.json();
  return {
    title: data.name,
    artist: data.artists.map(a => a.name).join(', '),
    image: data.album.images[0]?.url || data.album.images[data.album.images.length - 1]?.url || '',
    review: userReview,
    previewUrl: data.preview_url
  };
}

export function computeRating(text) {
  const base = Math.min(10, Math.max(0, 3 + text.length / 12));
  const positives = ['love','amazing','great','best','fire','incredible','awesome','perfect','beautiful','vibe'];
  const negatives = ['bad','meh','boring','worst','terrible','mid','hate'];
  const lower = (text || '').toLowerCase();
  let score = base + positives.reduce((s,w)=> s + (lower.includes(w) ? 0.8 : 0), 0) - negatives.reduce((s,w)=> s + (lower.includes(w) ? 1.0 : 0), 0);
  score = Math.min(10, Math.max(0, score));
  return Math.round(score * 10) / 10;
}


