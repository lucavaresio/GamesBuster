/* ==========================================================================
   Loader.jsx
   ==========================================================================
   Indicatore di caricamento usato mentre aspettiamo una risposta dalle
   API (fetch dei giochi, del carrello, ecc.). 
   ========================================================================== */

export default function Loader({ label = 'Caricamento in corso...' }) {
  return (
    <div className="loader" role="status">
      <span className="loader__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
