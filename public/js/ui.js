export function skeletonCard() {
  return `
    <div class="flex items-center gap-2 p-2 bg-[color:var(--card-bg)] backdrop-blur border border-slate-800 shadow-xl">
      <div class="w-12 h-12 rounded-md bg-slate-700/50 shimmer"></div>
      <div class="flex-1">
        <div class="h-3 w-32 bg-slate-700/50 rounded shimmer"></div>
        <div class="h-2.5 w-24 bg-slate-700/40 rounded mt-1 shimmer"></div>
        <div class="h-2.5 w-20 bg-slate-700/40 rounded mt-0.5 shimmer"></div>
      </div>
      <div class="w-8 h-8 rounded-full bg-slate-700/40 shimmer"></div>
    </div>`;
}

export function renderCard({ title, artist, image, review, rating }) {
  const safeReview = (review || '').slice(0, 100);
  const ratingPercent = (rating / 10) * 100;
  return `
    <div class="relative flex items-center gap-2 p-2 pb-3 bg-[color:var(--card-bg)] backdrop-blur shadow-2xl">
      <img src="${image}" alt="Album art" class="w-12 h-12 rounded-md object-cover" />
      <div class="min-w-0 flex-1">
        <div class="text-white text-xs font-semibold leading-tight">${title}</div>
        <div class="text-slate-300 text-xs">${artist}</div>
        <div class="text-slate-300 text-xs mt-0.5"><span class="text-white/40">Comments:</span> <span class="italic">"${safeReview || '—'}"</span></div>
      </div>
      <div class="ml-auto flex flex-col items-center">
        <div class="relative w-8 h-8">
          <svg viewBox="0 0 100 100" class="w-8 h-8">
            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.15)" stroke-width="8" fill="none"></circle>
            <circle cx="50" cy="50" r="44" stroke="#34d399" stroke-width="8" fill="none" stroke-dasharray="276.46" stroke-dashoffset="${276.46 * (1 - ratingPercent / 100)}" transform="rotate(-90 50 50)"/>
            <text x="50" y="67" dy="-0.2em" text-anchor="middle" fill="#34d399" font-size="30" font-weight="bold" font-family="system-ui, -apple-system, sans-serif">${rating.toFixed(1)}</text>
          </svg>
        </div>
      </div>
    </div>`;
}


