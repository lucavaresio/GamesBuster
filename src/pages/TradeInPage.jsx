/* ==========================================================================
   TradeInPage.jsx 
   ========================================================================== */

import { useEffect, useState } from 'react';
import { CURRENT_USER_ID, createTradeInRequest, getTradeInCatalog, getTradeInRequests } from '../lib/api';
import { getGameVisual, getGameImageUrl } from '../lib/gameVisuals';
import Loader from '../components/Loader';
import './TradeInPage.css';


const CONDITIONS = ['Come nuovo', 'Buono', 'Usato'];
const PLATFORMS = ['PS5', 'Xbox Series X', 'Nintendo Switch 2', 'PC'];

const STATUS_BADGE = {
  'in lavorazione': 'badge-cyan',
  completato: 'badge-green',
  rifiutato: 'badge-pink',
};

export default function TradeInPage() {
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [activeItem, setActiveItem] = useState(null); // elemento del catalogo selezionato per la richiesta
  const [condition, setCondition] = useState(CONDITIONS[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getTradeInRequests(CURRENT_USER_ID)
      .then(setRequests)
      .catch((err) => console.error(err))
      .finally(() => setLoadingRequests(false));
  }, []);

  useEffect(() => {
    let isCancelled = false;
    setLoadingCatalog(true);
    const timeoutId = setTimeout(() => {
      getTradeInCatalog({ title_like: search || undefined, platform: platform || undefined })
        .then((data) => {
          if (!isCancelled) setCatalog(data);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          if (!isCancelled) setLoadingCatalog(false);
        });
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [search, platform]);

  async function submitRequest() {
    if (!activeItem) return;
    setSubmitting(true);
    try {
      const created = await createTradeInRequest({
        userId: CURRENT_USER_ID,
        catalogItemId: activeItem.id,
        title: activeItem.title,
        platform: activeItem.platform,
        condition,
        estimatedValue: activeItem.estimatedValue,
        status: 'in lavorazione',
        creditApplied: false,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setRequests((prev) => [created, ...prev]);
      setActiveItem(null);
    } catch (err) {
      console.error('Errore nella richiesta di trade-in:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="trade-page page-container">
      <p className="shop-page__breadcrumb">Trade-in</p>
      <h1 className="shop-page__title">
        Cambia i tuoi giochi <span className="hero__title-accent">usati</span>
      </h1>
      <p className="shop-page__subtitle">
        Cerca il tuo gioco nel catalogo trade-in e scopri quanto credito puoi ottenere.
      </p>

      <div className="shop-page__toolbar">
        <input
          type="search"
          className="shop-page__search"
          placeholder="Cerca un titolo da permutare..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="shop-page__pills">
          <button
            type="button"
            className={`shop-pill${platform === '' ? ' shop-pill--active' : ''}`}
            onClick={() => setPlatform('')}
          >
            Tutte le piattaforme
          </button>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              className={`shop-pill${platform === p ? ' shop-pill--active' : ''}`}
              onClick={() => setPlatform(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loadingCatalog ? (
        <Loader label="Cerco nel catalogo trade-in..." />
      ) : catalog.length === 0 ? (
        <div className="empty-state">
          <h3>Nessun risultato</h3>
          <p>Provare con un altro titolo o un&apos;altra piattaforma.</p>
        </div>
      ) : (
        <div className="trade-catalog-grid">
          {catalog.map((item) => {
            const visual = getGameVisual(item.genre);
            const localImageSrc = getGameImageUrl(item.title);

            return (
              <article key={item.id} className="trade-card surface-card">
                {/* Usiamo un sotto-componente isolato per gestire l'immagine di ciascuna card senza causare re-render massivi della griglia */}
                <TradeInCardImage 
                  localImageSrc={localImageSrc} 
                  title={item.title} 
                  visual={visual} 
                />
                
                <div className="trade-card__body">
                  <p className="trade-card__title">{item.title}</p>
                  <span className="badge badge-cyan">{item.platform}</span>
                  <p className="trade-card__value">Valore stimato: <strong>€{item.estimatedValue}</strong></p>
                  <button type="button" className="btn btn-outline" onClick={() => setActiveItem(item)}>
                    Richiedi trade-in
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Mini modulo di conferma quando l'utente seleziona un gioco da permutare */}
      {activeItem && (
        <div className="trade-modal-backdrop" role="dialog" aria-modal="true" aria-label="Conferma trade-in">
          <div className="trade-modal surface-card">
            <h3>Richiedi trade-in: {activeItem.title}</h3>
            <p className="trade-modal__value">Credito stimato: €{activeItem.estimatedValue}</p>

            <label className="trade-modal__label" htmlFor="condition-select">Condizione del gioco</label>
            <select id="condition-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="trade-modal__actions">
              <button type="button" className="btn btn-outline" onClick={() => setActiveItem(null)}>Annulla</button>
              <button type="button" className="btn btn-primary" onClick={submitRequest} disabled={submitting}>
                {submitting ? 'Invio...' : 'Confermo la richiesta'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="trade-requests">
        <div className="section-heading"><h2>Le tue richieste</h2></div>

        {loadingRequests ? (
          <Loader label="Carico le tue richieste..." />
        ) : requests.length === 0 ? (
          <p className="home-section__empty">Non hai ancora effettuato richieste di trade-in.</p>
        ) : (
          <ul className="trade-requests__list">
            {requests.map((req) => (
              <li key={req.id} className="trade-request-item surface-card">
                <div>
                  <p className="trade-request-item__title">{req.title}</p>
                  <p className="trade-request-item__meta">{req.platform} · {req.condition} · €{req.estimatedValue}</p>
                </div>
                <span className={`badge ${STATUS_BADGE[req.status] ?? 'badge-gray'}`}>{req.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/**
 * Sotto-componente helper interno per mantenere lo stato di caricamento corretto 
 * dell'immagine per ogni singolo articolo del catalogo senza interferire con gli altri.
 */
function TradeInCardImage({ localImageSrc, title, visual }) {
  const [showImage, setShowImage] = useState(Boolean(localImageSrc));

  useEffect(() => {
    setShowImage(Boolean(localImageSrc));
  }, [localImageSrc]);

  return (
    <div 
      className="trade-card__cover" 
      style={{ backgroundImage: showImage ? 'none' : visual.gradient }}
    >
      {showImage ? (
        <img
          src={localImageSrc}
          alt={title}
          className="game-card__img" /* Riutilizziamo lo stile di ridimensionamento standard delle immagini */
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          onError={() => setShowImage(false)}
        />
      ) : (
        <span aria-hidden="true" style={{ fontSize: '2.5rem' }}>{visual.emoji}</span>
      )}
    </div>
  );
}