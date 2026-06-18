/* ==========================================================================
   GameCard.jsx
   ========================================================================== */

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getGameVisual, getPlatformIcon, getGameImageUrl } from '../lib/gameVisuals';
import StarRating from './StarRating';
import './GameCard.css';

export default function GameCard({ game, variant = 'shop', onAddToCart }) {
  const visual = getGameVisual(game.genre);
  
  // Genera dinamicamente il percorso dell'immagine locale .avif partendo dal titolo
  const localImageSrc = getGameImageUrl(game.title);
  
  // Gestiamo lo stato dell'immagine basandoci sul percorso generato
  const [showImage, setShowImage] = useState(Boolean(localImageSrc));
  const hasDiscount = game.priceUsed && game.priceFisico && game.priceUsed < game.priceFisico;
  const displayPrice = game.priceFisico ?? game.priceDigitale ?? game.priceBundle;

  // Se il gioco cambia dinamicamente, resettiamo lo stato di visualizzazione dell'immagine
  useEffect(() => {
    setShowImage(Boolean(localImageSrc));
  }, [localImageSrc]);

  return (
    <article className="game-card surface-card">
      <Link
        to={`/shop/${game.id}`}
        className="game-card__cover"
        style={{ backgroundImage: showImage ? 'none' : visual.gradient }}
      >
        {showImage ? (
          <img
            src={localImageSrc}
            alt={game.title}
            className="game-card__img"
            // Se l'immagine .avif non esiste ancora nella cartella, passa all'emoji + gradiente
            onError={() => setShowImage(false)}
          />
        ) : (
          <span className="game-card__emoji" aria-hidden="true">{visual.emoji}</span>
        )}

        <div className="game-card__cover-badges">
          {game.featured && <span className="badge badge-cyan">In evidenza</span>}
          {hasDiscount && <span className="badge badge-pink">Sconto</span>}
          {variant === 'cloud' && game.cloudPlan && (
            <span className={`badge ${game.cloudPlan === 'ultra' ? 'badge-purple' : 'badge-cyan'}`}>
              {game.cloudPlan === 'ultra' ? 'Piano Ultra' : 'Piano Premium'}
            </span>
          )}
        </div>
      </Link>

      <div className="game-card__body">
        <div className="game-card__platform-row">
          <span className="game-card__platform">
            {getPlatformIcon(game.platform)} {game.platform}
          </span>
          {game.rating > 0 && <StarRating rating={game.rating} reviewCount={game.reviewCount} />}
        </div>

        <Link to={`/shop/${game.id}`} className="game-card__title">
          {game.title}
        </Link>
        <p className="game-card__genre">{game.genre} · {game.studio}</p>

        <div className="game-card__footer">
          {variant === 'cloud' ? (
            <Link to={`/shop/${game.id}`} className="btn btn-primary game-card__cta">
              Gioca ora
            </Link>
          ) : (
            <>
              <div className="game-card__price">
                <span className="game-card__price-current">€{displayPrice?.toFixed(2)}</span>
                {hasDiscount && (
                  <span className="game-card__price-old">€{game.priceFisico.toFixed(2)}</span>
                )}
              </div>
              <button
                type="button"
                className="game-card__add-btn"
                aria-label={`Aggiungi ${game.title} al carrello`}
                onClick={() =>
                  onAddToCart?.({
                    gameId: game.id,
                    title: game.title,
                    platform: game.platform,
                    format: game.formats?.[0] ?? 'Digitale',
                    condition: 'Nuovo',
                    price: displayPrice,
                  })
                }
              >
                +
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}