export function appendChatMessage(chatMessagesEl, { user, color = '#a970ff', badges = [], text }) {
  if (!chatMessagesEl) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'twitch-msg flex items-start';
  const badgeEls = badges.includes('verified') ? '<span class="twitch-badge">✓</span>' : '';
  wrapper.innerHTML = `${badgeEls}<span class="twitch-username" style="color:${color}">${user}</span><span class="whitespace-pre-wrap">${text}</span>`;
  chatMessagesEl.appendChild(wrapper);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

export async function playChatMessagesSequentially(chatMessagesEl, appendFn, messages, delayMs = 1000) {
  if (!Array.isArray(messages) || messages.length === 0) return;
  if (chatMessagesEl) chatMessagesEl.innerHTML = '';
  for (let i = 0; i < messages.length; i++) {
    appendFn(chatMessagesEl, messages[i]);
    if (i < messages.length - 1) await new Promise(r => setTimeout(r, delayMs));
  }
}

export async function generateMonkThoughtsForUrl(url, { parseSpotify, chatStatusEl, chatMessagesEl, appendFn }) {
  try {
    if (!url) return;
    const trackId = parseSpotify(url);
    if (!trackId) return;
    if (chatStatusEl) chatStatusEl.textContent = 'typing…';

    const response = await fetch(`/api/spotify?trackId=${encodeURIComponent(trackId)}`);
    if (!response.ok) throw new Error('spotify lookup failed');
    const data = await response.json();
    const payload = {
      title: data?.name,
      artist: Array.isArray(data?.artists) ? data.artists.map(a => a.name).join(', ') : '',
      genres: Array.isArray(data?.album?.genres) ? data.album.genres : [],
      spotifyUrl: url,
      previewUrl: data?.preview_url || null
    };

    const ai = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!ai.ok) throw new Error('ai review failed');
    const { messages = [] } = await ai.json();

    if (messages.length === 0) {
      appendFn(chatMessagesEl, { user: 'monk', text: 'hmm… nothing to say?', color: '#a970ff' });
    } else {
      await playChatMessagesSequentially(chatMessagesEl, appendFn, messages, 1000);
    }
    if (chatStatusEl) chatStatusEl.textContent = 'ready';
  } catch (err) {
    if (chatStatusEl) chatStatusEl.textContent = 'error';
    appendFn(chatMessagesEl, { user: 'monk', text: 'cant think rn 🤔', color: '#a970ff' });
  }
}


