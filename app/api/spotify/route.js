import { NextResponse } from 'next/server';

// Spotify API endpoint to get access token
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
// Spotify Web API endpoint for track details
const SPOTIFY_API_URL = 'https://api.spotify.com/v1/tracks';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get('trackId');

  if (!trackId) {
    return NextResponse.json(
      { error: 'Track ID is required' },
      { status: 400 }
    );
  }

  // Log the requested track ID for debugging
  console.log('[Spotify API] Requested track ID:', trackId);

  // Get Spotify credentials from environment variables
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Spotify credentials not configured' },
      { status: 500 }
    );
  }

  try {
    // Get access token using Client Credentials flow
    const tokenResponse = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Spotify token error:', error);
      return NextResponse.json(
        { error: 'Failed to authenticate with Spotify' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Fetch track details with market parameter to get preview URLs
    // Market parameter helps ensure preview_url is included when available
    const market = searchParams.get('market') || 'US'; // Default to US market
    const trackResponse = await fetch(`${SPOTIFY_API_URL}/${trackId}?market=${market}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!trackResponse.ok) {
      const error = await trackResponse.text();
      console.error('Spotify API error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch track details' },
        { status: trackResponse.status }
      );
    }

    const trackData = await trackResponse.json();

    // Verify that the returned track ID matches what we requested
    // This ensures we got the exact track, not a different version or remix
    if (trackData.id && trackData.id !== trackId) {
      console.error('[Spotify API] Track ID mismatch!', {
        requested: trackId,
        received: trackData.id,
        name: trackData.name,
        artists: trackData.artists?.map(a => a.name)
      });
      // Still return the data, but log the mismatch for debugging
    } else {
      console.log('[Spotify API] Track data retrieved successfully:', {
        id: trackData.id,
        name: trackData.name,
        artists: trackData.artists?.map(a => a.name),
        hasPreview: !!trackData.preview_url
      });
    }

    // If Spotify's own preview_url is missing, try spotify-preview-finder as a fallback
    try {
      if (!trackData.preview_url) {
        const spotifyPreviewFinder = (await import('spotify-preview-finder')).default;
        const query = `${trackData.name} ${trackData.artists?.map(a => a.name).join(' ') || ''}`.trim();
        const finder = await spotifyPreviewFinder(query, 1);
        if (finder && finder.success && finder.results && finder.results.length > 0) {
          const first = finder.results[0];
          if (first.previewUrls && first.previewUrls.length > 0) {
            trackData.preview_url = first.previewUrls[0];
          }
        }
      }
    } catch (e) {
      console.warn('spotify-preview-finder fallback failed:', e?.message || e);
    }

    return NextResponse.json(trackData);
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

