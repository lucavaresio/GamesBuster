/* ==========================================================================
   gameVisuals.js
   ==========================================================================
   Questo helper è usato da GameCard, dalla pagina di dettaglio e dal
   catalogo trade-in.
   ========================================================================== */

const GENRE_VISUALS = {
  rpg: { emoji: '⚔️', gradient: 'linear-gradient(160deg, #2d1b4e 0%, #120a24 100%)' },
  azione: { emoji: '🔥', gradient: 'linear-gradient(160deg, #4a1212 0%, #1a0808 100%)' },
  action: { emoji: '🔥', gradient: 'linear-gradient(160deg, #4a1212 0%, #1a0808 100%)' },
  sparatutto: { emoji: '🎯', gradient: 'linear-gradient(160deg, #0d2a4a 0%, #081222 100%)' },
  fps: { emoji: '🎯', gradient: 'linear-gradient(160deg, #0d2a4a 0%, #081222 100%)' },
  sport: { emoji: '⚽', gradient: 'linear-gradient(160deg, #0d3a22 0%, #08160f 100%)' },
  strategia: { emoji: '🧠', gradient: 'linear-gradient(160deg, #1b2a4e 0%, #0a1224 100%)' },
  avventura: { emoji: '🗺️', gradient: 'linear-gradient(160deg, #0d3a3a 0%, #081616 100%)' },
  corse: { emoji: '🏎️', gradient: 'linear-gradient(160deg, #4a3a0d 0%, #221a08 100%)' },
  racing: { emoji: '🏎️', gradient: 'linear-gradient(160deg, #4a3a0d 0%, #221a08 100%)' },
  horror: { emoji: '👻', gradient: 'linear-gradient(160deg, #3a0d1f 0%, #16080d 100%)' },
  indie: { emoji: '✨', gradient: 'linear-gradient(160deg, #3a0d3a 0%, #160816 100%)' },
  puzzle: { emoji: '🧩', gradient: 'linear-gradient(160deg, #0d2a3a 0%, #081622 100%)' },
  picchiaduro: { emoji: '🥊', gradient: 'linear-gradient(160deg, #4a1212 0%, #1a0808 100%)' },
  default: { emoji: '🎮', gradient: 'linear-gradient(160deg, #12243f 0%, #0a1424 100%)' },
};

export function getGameVisual(genre) {
  const key = (genre || '').toLowerCase().trim();
  return GENRE_VISUALS[key] || GENRE_VISUALS.default;
}

/** Piccole icone testuali per piattaforma, usate nei badge delle card. */
const PLATFORM_ICONS = {
  ps5: '🎮',
  'playstation 5': '🎮',
  'xbox series x': '🟩',
  xbox: '🟩',
  'nintendo switch 2': '🔴',
  switch: '🔴',
  pc: '🖥️',
};

export function getPlatformIcon(platform) {
  const key = (platform || '').toLowerCase().trim();
  return PLATFORM_ICONS[key] || '🕹️';
}


export function getGameImageUrl(title) {
  if (!title) return '';

  // Trasforma il titolo in uno "slug" pulito per i file di sistema
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Rimuove caratteri speciali come apostrofi o accenti
    .replace(/[\s_-]+/g, '-'); // Sostituisce spazi e trattini bassi con un singolo trattino

  // Risolve dinamicamente il percorso rispetto alla posizione di questo file helper
  return new URL(`../images/${slug}.avif`, import.meta.url).href;
}