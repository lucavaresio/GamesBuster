/* ==========================================================================
   StarRating.jsx
   ==========================================================================
   Componente "puro" (riceve solo props, non ha stato interno): trasforma
   un numero (es. 4.5) in una fila di stelle piene/vuote più il numero
   di recensioni ("★★★★☆ 4.8 (3.1k)").
   ========================================================================== */

export default function StarRating({ rating = 0, reviewCount }) {
  const rounded = Math.round(rating);

  return (
    <span className="star-rating" aria-label={`Valutazione ${rating} su 5`}>
      <span className="star-rating__stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={index < rounded ? 'star-rating__star is-filled' : 'star-rating__star'}>
            ★
          </span>
        ))}
      </span>
      <span className="star-rating__value">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && (
        <span className="star-rating__count">({reviewCount})</span>
      )}
    </span>
  );
}
