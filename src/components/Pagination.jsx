/* ==========================================================================
   Pagination.jsx
   ==========================================================================
   Controlli "pagina precedente / successiva" usati nel catalogo Shop,
   che usa i parametri _page e _limit dell'API (vedi documentazione:
   GET /games?_page=1&_limit=12).

   Riceve il numero di pagina corrente e il totale di pagine disponibili
   (calcolato dalla pagina che lo usa, in base al numero di risultati),
   e notifica il cambio pagina con onPageChange.
   ========================================================================== */

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Paginazione risultati">
      <button
        type="button"
        className="pagination__btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Precedente
      </button>
      <span className="pagination__status">
        Pagina {page} di {totalPages}
      </span>
      <button
        type="button"
        className="pagination__btn"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Successiva →
      </button>
    </nav>
  );
}
