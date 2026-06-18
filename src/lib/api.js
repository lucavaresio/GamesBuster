/* ==========================================================================
   api.js - Versione Corretta per Localhost e Vercel
   ========================================================================== */

// Usiamo il percorso relativo puro. I browser capiranno da soli di chiamare il dominio corrente.
const BASE_URL = '/api'; 

export const CURRENT_USER_ID = 1;

/**
 * Funzione helper di basso livello: costruisce l'URL con eventuali query
 * string e gestisce gli errori HTTP in modo uniforme.
 */
async function apiGet(path, params) {
  // Costruiamo la stringa dell'URL unendo semplicemente i pezzi (es: /api + /games -> /api/games)
  let urlString = `${BASE_URL}${path}`;
  
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.set(key, value);
      }
    });
    
    // Se ci sono filtri, appendiamo la query string alla fine del percorso
    const queryString = queryParams.toString();
    if (queryString) {
      urlString += `?${queryString}`;
    }
  }

  const response = await fetch(urlString);
  if (!response.ok) {
    throw new Error(`Errore ${response.status} chiamando ${path}`);
  }
  return response.json();
}

async function apiSend(method, path, body) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`Errore ${response.status} chiamando ${method} ${path}`);
  }
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
  let urlString = `${BASE_URL}/games`;

  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.set(key, value);
    }
  });

  const queryString = queryParams.toString();
  if (queryString) {
    urlString += `?${queryString}`;
  }

  const response = await fetch(urlString);
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
