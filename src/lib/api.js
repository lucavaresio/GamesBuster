/* ==========================================================================
   api.js 
   ==========================================================================
   Questo file è l'UNICO punto del progetto che conosce l'URL del server.
   Ogni pagina importa da qui le funzioni di cui ha bisogno (getGames,
   getPlans, addToCart, ...) invece di scrivere fetch() sparsi ovunque:
   se in futuro l'URL del backend cambia, lo aggiorniamo in un solo posto.
   ========================================================================== */

const BASE_URL = 'https://cors-anywhere.herokuapp.com/https://mock-api-server-production-7f5d.up.railway.app/gamebuster/api';

/**
 * ID dell'utente "loggato" per questa demo.
 * Il progetto non prevede ancora una vera pagina di login/registrazione
 * (la "Profile Page" è stata esclusa da questo lavoro), quindi per poter
 * mostrare comunque carrello, wishlist, ordini e trade-in funzionanti
 * simuliamo un utente già autenticato con id = 1, esattamente come fa
 * il mockup Figma che mostra sempre un profilo nell'header (mai un
 * bottone "Accedi").
 */
export const CURRENT_USER_ID = 1;

/**
 * Funzione helper di basso livello: costruisce l'URL con eventuali query
 * string e gestisce gli errori HTTP in modo uniforme.
 *
 * @param {string} path - es. '/games' oppure '/games/3'
 * @param {object} [params] - query string, es. { platform: 'PS5' }
 */
async function apiGet(path, params) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      // Ignoriamo i parametri vuoti/undefined così non sporchiamo l'URL
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Errore ${response.status} chiamando ${path}`);
  }
  return response.json();
}

async function apiSend(method, path, body) {
  const response = await fetch(BASE_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Errore ${response.status} chiamando ${method} ${path}`);
  }
  // Le DELETE a volte non hanno un body da parsare
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/* ------------------------------- Plans ---------------------------------- */

export function getPlans() {
  return apiGet('/plans');
}

export function getPlan(id) {
  return apiGet(`/plans/${id}`);
}

/* ------------------------------- Users ------------------------------------ */

export function getUser(id) {
  return apiGet(`/users/${id}`);
}

export function updateUser(id, patch) {
  return apiSend('PATCH', `/users/${id}`, patch);
}

/* ------------------------------- Games ------------------------------------ */

/**
 * Recupera il catalogo giochi applicando i filtri supportati dal server
 * (vedi sezione "Games" della documentazione API).
 * @param {object} filters - platform, genre, featured, heroFeatured,
 *                            title_like, cloudPlan, _sort, _order,
 *                            _page, _limit
 */
export function getGames(filters = {}) {
  return apiGet('/games', filters);
}

/**
 * Variante di getGames che restituisce anche il numero totale di
 * risultati che soddisfano il filtro (header X-Total-Count inviato da
 * json-server), necessario per calcolare il numero di pagine nello
 * Shop. La teniamo separata da apiGet perché qui ci serve leggere
 * gli HEADER della risposta, non solo il body JSON.
 */
export async function getGamesWithCount(filters = {}) {
  const url = new URL(BASE_URL + '/games');
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Errore ${response.status} chiamando /games`);
  }
  const data = await response.json();
  const totalHeader = response.headers.get('X-Total-Count');
  return { data, totalCount: totalHeader ? Number(totalHeader) : data.length };
}

export function getGame(id) {
  return apiGet(`/games/${id}`);
}

/* ---------------------------- Cloud Games ---------------------------------- */

export function getCloudGames(plan) {
  return apiGet('/cloud_games', plan ? { plan } : undefined);
}

/* ------------------------------- Reviews ----------------------------------- */

export function getReviewsByGame(gameId) {
  return apiGet('/reviews', { gameId });
}

export function createReview(review) {
  return apiSend('POST', '/reviews', review);
}

/* ------------------------------- Orders ------------------------------------ */

export function getOrdersByUser(userId, extra = {}) {
  return apiGet('/orders', { userId, ...extra });
}

export function createOrder(order) {
  return apiSend('POST', '/orders', order);
}

export function updateOrder(id, patch) {
  return apiSend('PATCH', `/orders/${id}`, patch);
}

/* ----------------------------- Cart Items ----------------------------------- */

export function getCartItems(userId) {
  return apiGet('/cart_items', { userId });
}

export function addCartItem(item) {
  return apiSend('POST', '/cart_items', item);
}

export function updateCartItem(id, patch) {
  return apiSend('PATCH', `/cart_items/${id}`, patch);
}

export function removeCartItem(id) {
  return apiSend('DELETE', `/cart_items/${id}`);
}

/* --------------------------- Wishlist Items ---------------------------------- */

export function getWishlist(userId) {
  return apiGet('/wishlist_items', { userId });
}

export function addToWishlist(item) {
  return apiSend('POST', '/wishlist_items', item);
}

export function removeFromWishlist(id) {
  return apiSend('DELETE', `/wishlist_items/${id}`);
}

/* ------------------------- Marketplace Listings ------------------------------- */

export function getMarketplaceListings(filters = {}) {
  return apiGet('/marketplace_listings', filters);
}

export function createListing(listing) {
  return apiSend('POST', '/marketplace_listings', listing);
}

/* --------------------------- Trade-in Catalog --------------------------------- */

export function getTradeInCatalog(filters = {}) {
  return apiGet('/trade_in_catalog', filters);
}

/* -------------------------- Trade-in Requests ---------------------------------- */

export function getTradeInRequests(userId, extra = {}) {
  return apiGet('/trade_in_requests', { userId, ...extra });
}

export function createTradeInRequest(request) {
  return apiSend('POST', '/trade_in_requests', request);
}

/* -------------------------------- Reports --------------------------------------- */

export function createReport(report) {
  return apiSend('POST', '/reports', report);
}
