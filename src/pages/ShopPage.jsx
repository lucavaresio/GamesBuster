/* ==========================================================================
   ShopPage.jsx  →  corrisponde alla "Shop Page" del Figma
   ==========================================================================
   Catalogo giochi con filtri, ricerca, ordinamento e paginazione, tutti
   implementati usando delle API:
     - platform=...                  (filtro piattaforma)
     - genre=...                     (filtro genere)
     - title_like=...                (ricerca testuale)
     - _sort=rating|priceFisico &
       _order=asc|desc               (ordinamento)
     - _page=...&_limit=12           (paginazione)
   ========================================================================== */

import { useEffect, useMemo, useState } from 'react';
import GameCard from '../components/GameCard';
import Loader from '../components/Loader';
import Pagination from '../components/Pagination';
import { getGames, getGamesWithCount } from '../lib/api';
import { useCart } from '../context/CartContext';
import './ShopPage.css';

// Piattaforme documentate esplicitamente in gamebuster-api-docs.md
const PLATFORMS = ['PS5', 'Xbox Series X', 'Nintendo Switch 2', 'PC'];

const SORT_OPTIONS = [
  { value: '', label: 'Più rilevanti' },
  { value: 'rating-desc', label: 'Valutazione: più alta' },
  { value: 'priceFisico-asc', label: 'Prezzo: dal più basso' },
  { value: 'priceFisico-desc', label: 'Prezzo: dal più alto' },
];

const PAGE_SIZE = 12;

export default function ShopPage() {
  const { addItem } = useCart();

  // Stato dei filtri attivi. Tenerli in un unico oggetto rende più
  // semplice resettare la pagina a 1 ogni volta che uno di essi cambia.
  const [platform, setPlatform] = useState('');
  const [genre, setGenre] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);

  const [games, setGames] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  // Al primo caricamento, legge un campione ampio del catalogo per
  // estrarre la lista REALE dei generi disponibili 
  useEffect(() => {
    getGames({ _limit: 200 })
      .then((all) => {
        const genres = [...new Set(all.map((g) => g.genre).filter(Boolean))].sort();
        setAvailableGenres(genres);
      })
      .catch((err) => console.error('Errore nel recupero dei generi:', err));
  }, []);

  // Ricarica il catalogo ogni volta che cambia un filtro, l'ordine
  // oppure la pagina. Il "debounce" sulla ricerca testuale evita di
  // interrogare il server ad ogni singolo tasto premuto: aspettiamo
  // 350ms di pausa nella digitazione prima di lanciare la richiesta.
  useEffect(() => {
    let isCancelled = false;
    // Pattern di data-fetching raccomandato da React (vedi nota in
    // CartContext.jsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      const [sortField, sortOrder] = sort ? sort.split('-') : [undefined, undefined];

      try {
        const { data, totalCount: count } = await getGamesWithCount({
          platform: platform || undefined,
          genre: genre || undefined,
          title_like: search || undefined,
          _sort: sortField,
          _order: sortOrder,
          _page: page,
          _limit: PAGE_SIZE,
        });

        if (!isCancelled) {
          setGames(data);
          setTotalCount(count);
        }
      } catch (err) {
        console.error('Errore nel caricamento del catalogo:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [platform, genre, search, sort, page]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), [totalCount]);

  // Ogni volta che l'utente cambia un filtro diverso dalla pagina,
  // torna automaticamente a pagina 1 
  function updateFilter(setter) {
    return (value) => {
      setter(value);
      setPage(1);
    };
  }

  return (
    <div className="shop-page page-container">
      <p className="shop-page__breadcrumb">Shop</p>
      <h1 className="shop-page__title">
        Videogiochi &amp; <span className="hero__title-accent">Console</span>
      </h1>
      <p className="shop-page__subtitle">
        Nuovi, usati, digitali o fisici. Filtra per piattaforma e genere, oppure cerca per titolo.
      </p>

      <div className="shop-page__toolbar">
        <div className="shop-page__pills" role="group" aria-label="Filtra per piattaforma">
          <button
            type="button"
            className={`shop-pill${platform === '' ? ' shop-pill--active' : ''}`}
            onClick={() => updateFilter(setPlatform)('')}
          >
            Tutte
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              className={`shop-pill${platform === p ? ' shop-pill--active' : ''}`}
              onClick={() => updateFilter(setPlatform)(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <input
          type="search"
          className="shop-page__search"
          placeholder="Cerca un titolo..."
          value={search}
          onChange={(e) => updateFilter(setSearch)(e.target.value)}
          aria-label="Cerca un gioco per titolo"
        />
      </div>

      <div className="shop-page__toolbar shop-page__toolbar--secondary">
        <div className="shop-page__pills" role="group" aria-label="Filtra per genere">
          <button
            type="button"
            className={`shop-pill${genre === '' ? ' shop-pill--active' : ''}`}
            onClick={() => updateFilter(setGenre)('')}
          >
            Tutti i generi
          </button>
          {availableGenres.map((g) => (
            <button
              key={g}
              type="button"
              className={`shop-pill${genre === g ? ' shop-pill--active' : ''}`}
              onClick={() => updateFilter(setGenre)(g)}
            >
              {g}
            </button>
          ))}
        </div>

        <select
          className="shop-page__sort"
          value={sort}
          onChange={(e) => updateFilter(setSort)(e.target.value)}
          aria-label="Ordina i risultati"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader label="Carico il catalogo..." />
      ) : games.length === 0 ? (
        <div className="empty-state">
          <h3>Nessun gioco trovato</h3>
          <p>Provare a modificare i filtri o il termine di ricerca.</p>
        </div>
      ) : (
        <>
          <div className="shop-page__grid">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onAddToCart={addItem} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
