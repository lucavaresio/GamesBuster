/* ==========================================================================
   GameDetailPage.jsx 
   ========================================================================== */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import GameCard from '../components/GameCard';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import { getGame, getReviewsByGame, createReview, getGames } from '../lib/api';
import { getGameVisual, getPlatformIcon, getGameImageUrl } from '../lib/gameVisuals'; // Importiamo getGameImageUrl
import { useCart } from '../context/CartContext';
import './GameDetailPage.css';

// Formato -> campo prezzo corrispondente nello schema /games
const FORMAT_PRICE_FIELD = {
  Fisico: 'priceFisico',
  Digitale: 'priceDigitale',
  Usato: 'priceUsed',
};

export default function GameDetailPage() {
  const { gameId } = useParams();
  const { addItem } = useCart();

  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarGames, setSimilarGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Generiamo il percorso dinamico dell'immagine locale .avif partendo dal titolo del gioco
  const localImageSrc = game ? getGameImageUrl(game.title) : '';
  const [showImage, setShowImage] = useState(false);

  const [selectedFormat, setSelectedFormat] = useState(null);
  const [reviewForm, setReviewForm] = useState({ username: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setNotFound(false);

    async function loadGame() {
      try {
        const gameData = await getGame(gameId);
        if (isCancelled) return;
        setGame(gameData);
        setSelectedFormat(gameData.formats?.[0] ?? 'Digitale');
        
        // Calcoliamo e impostiamo lo stato iniziale dell'immagine basandoci sul titolo caricato
        const imagePath = getGameImageUrl(gameData.title);
        setShowImage(Boolean(imagePath));

        const [reviewsData, similar] = await Promise.all([
          getReviewsByGame(gameId),
          getGames({ genre: gameData.genre, _limit: 5 }),
        ]);
        if (isCancelled) return;
        setReviews(reviewsData);
        setSimilarGames(similar.filter((g) => String(g.id) !== String(gameId)).slice(0, 4));
      } catch (err) {
        console.error('Errore nel caricamento del gioco:', err);
        if (!isCancelled) setNotFound(true);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadGame();
    return () => {
      isCancelled = true;
    };
  }, [gameId]);

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewForm.username.trim() || !reviewForm.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const created = await createReview({
        gameId: Number(gameId),
        userId: 1,
        username: reviewForm.username,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
        createdAt: new Date().toISOString().slice(0, 10),
      });
      setReviews((prev) => [created, ...prev]);
      setReviewForm({ username: '', rating: 5, comment: '' });
    } catch (err) {
      console.error('Errore nell\'invio della recensione:', err);
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) return <Loader label="Carico la scheda del gioco..." />;

  if (notFound || !game) {
    return (
      <div className="empty-state page-container">
        <h3>Gioco non trovato</h3>
        <p>Il gioco che cerchi potrebbe essere stato rimosso dal catalogo.</p>
        <Link to="/shop" className="btn btn-primary">Torna al catalogo</Link>
      </div>
    );
  }

  const visual = getGameVisual(game.genre);
  const priceField = FORMAT_PRICE_FIELD[selectedFormat];
  const currentPrice = game[priceField] ?? game.priceFisico ?? game.priceDigitale;

  return (
    <div className="game-detail">
      {/* L'hero background cambia dinamicamente: mostra il gradiente solo se l'immagine fallisce o è assente */}
      <div 
        className="game-detail__hero" 
        style={{ backgroundImage: showImage ? 'none' : visual.gradient }}
      >
        <div className="page-container game-detail__hero-inner">
          {showImage ? (
            <img
              src={localImageSrc}
              alt={game.title}
              className="game-detail__hero-img"
              // Fallback automatico: se il file .avif non c'è, mostra l'emoji + gradiente
              onError={() => setShowImage(false)}
            />
          ) : (
            <span className="game-detail__hero-emoji" aria-hidden="true">{visual.emoji}</span>
          )}

          <div className="game-detail__info">
            <p className="game-detail__breadcrumb">
              <Link to="/shop">Shop</Link> / {game.genre} / {game.title}
            </p>
            <h1 className="game-detail__title">{game.title}</h1>
            <div className="game-detail__meta">
              <span>{getPlatformIcon(game.platform)} {game.platform}</span>
              <span>·</span>
              <span>{game.studio}</span>
              <span>·</span>
              <StarRating rating={game.rating} reviewCount={game.reviewCount} />
            </div>

            {game.cloudPlan && (
              <Link to="/cloud-gaming" className="badge badge-cyan game-detail__cloud-badge">
                ☁ Disponibile su Cloud Gaming ({game.cloudPlan === 'ultra' ? 'piano Ultra' : 'piano Premium'})
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="page-container game-detail__body">
        <div className="game-detail__main">
          <section>
            <div className="section-heading"><h2>Descrizione</h2></div>
            <p className="game-detail__description">{game.description}</p>
          </section>

          <section className="game-detail__reviews">
            <div className="section-heading"><h2>Recensioni ({reviews.length})</h2></div>

            {reviews.length === 0 ? (
              <p className="game-detail__no-reviews">Ancora nessuna recensione: scrivi la prima!</p>
            ) : (
              <ul className="review-list">
                {reviews.map((review) => (
                  <li key={review.id} className="review-item surface-card">
                    <div className="review-item__header">
                      <span className="review-item__username">{review.username}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="review-item__comment">{review.comment}</p>
                    <span className="review-item__date">{review.createdAt}</span>
                  </li>
                ))}
              </ul>
            )}

            <form className="review-form surface-card" onSubmit={handleReviewSubmit}>
              <h3 className="review-form__title">Lascia una recensione</h3>
              <div className="review-form__row">
                <input
                  type="text"
                  placeholder="Il tuo nome utente"
                  value={reviewForm.username}
                  onChange={(e) => setReviewForm((f) => ({ ...f, username: e.target.value }))}
                  required
                />
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} stelle</option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Cosa ne pensi di questo gioco?"
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                rows={3}
                required
              />
              <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                {submittingReview ? 'Invio...' : 'Pubblica recensione'}
              </button>
            </form>
          </section>
        </div>

        <aside className="game-detail__sidebar surface-card">
          {game.formats?.length > 1 && (
            <div className="game-detail__format-select" role="group" aria-label="Scegli il formato">
              {game.formats.map((format) => (
                <button
                  key={format}
                  type="button"
                  className={`shop-pill${selectedFormat === format ? ' shop-pill--active' : ''}`}
                  onClick={() => setSelectedFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          )}

          <p className="game-detail__price">€{currentPrice?.toFixed(2)}</p>

          <button
            type="button"
            className="btn btn-primary game-detail__buy-btn"
            onClick={() =>
              addItem({
                gameId: game.id,
                title: game.title,
                platform: game.platform,
                format: selectedFormat,
                condition: selectedFormat === 'Usato' ? 'Usato' : 'Nuovo',
                price: currentPrice,
              })
            }
          >
            Aggiungi al carrello
          </button>

          <dl className="game-detail__specs">
            <div><dt>Studio</dt><dd>{game.studio}</dd></div>
            <div><dt>Uscita</dt><dd>{game.releaseDate}</dd></div>
            <div><dt>Genere</dt><dd>{game.genre}</dd></div>
            <div><dt>Piattaforma</dt><dd>{game.platform}</dd></div>
          </dl>
        </aside>
      </div>

      {similarGames.length > 0 && (
        <section className="page-container game-detail__similar">
          <div className="section-heading"><h2>Potrebbe interessarti anche</h2></div>
          <div className="home-section__grid">
            {similarGames.map((g) => (
              <GameCard key={g.id} game={g} onAddToCart={addItem} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}