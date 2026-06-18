/* ==========================================================================
   NotFoundPage.jsx
   ==========================================================================
   Pagina mostrata quando l'URL non corrisponde a nessuna rotta definita
   in App.jsx (route "*" di fallback). Utile anche per chi digita
   manualmente un URL verso una pagina esclusa dal progetto (es. /forum
   o /profile): invece di un errore bianco, l'utente vede un messaggio
   chiaro e un link per tornare alla home.
   ========================================================================== */

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="empty-state page-container" style={{ minHeight: '50vh', justifyContent: 'center' }}>
      <h3>404 — Pagina non trovata</h3>
      <p>La pagina che cerchi non esiste o non è (ancora) disponibile in questa versione del sito.</p>
      <Link to="/" className="btn btn-primary">Torna alla home</Link>
    </div>
  );
}
