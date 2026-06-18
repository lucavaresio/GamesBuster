/* ==========================================================================
   Stats.jsx
   ==========================================================================
   Riga di numeri-chiave sotto l'hero della Home page
   ========================================================================== */

import './Stats.css';

const STATS = [
  { value: '8K+', label: 'Titoli disponibili' },
  { value: '4', label: 'Piattaforme supportate' },
  { value: '50K+', label: 'Utenti attivi' },
];

export default function Stats() {
  return (
    <section className="stats">
      <div className="stats__row page-container">
        {STATS.map((stat) => (
          <div className="stats__item" key={stat.label}>
            <span className="stats__value">{stat.value}</span>
            <span className="stats__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
