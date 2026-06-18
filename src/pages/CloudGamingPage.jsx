/* ==========================================================================
   CloudGamingPage.jsx  →  corrisponde a "Cloud Gaming Homepage" del Figma
   ==========================================================================
   Dati reali da API:
   - GET /cloud_games oppure /cloud_games?plan=premium|ultra  -> libreria
   - GET /plans                                                -> piani
   ========================================================================== */

import { useEffect, useState } from 'react';
import GameCard from '../components/GameCard';
import Loader from '../components/Loader';
import { getCloudGames, getPlans } from '../lib/api';
import './CloudGamingPage.css';

// Fallback (vedi commento sopra) basato sulla slide della presentazione.
const FALLBACK_FEATURES = {
  standard: ['Accesso e-commerce completo', 'Acquisto digitale e fisico', 'Trade-in giochi usati'],
  premium: ['Tutto del piano Standard', 'Cloud Gaming — giochi extra', 'Vendite ID2I illimitate', 'Sconti mensili su titoli selezionati'],
  ultra: ['Tutto del piano Premium', 'Cloud Gaming — catalogo completo', 'Sconti su migliori AAA', 'Accesso prioritario alle novità', 'Supporto clienti dedicato'],
};

const HIGHLIGHTS = [
  { icon: '⚡', title: 'Zero installazioni', text: 'Gioca istantaneamente dal browser: nessun download richiesto.' },
  { icon: '🔄', title: 'Catalogo in rotazione', text: 'Nuovi titoli selezionati ogni mese.' },
  { icon: '📱', title: 'Multi-device', text: 'PC, smartphone, tablet: il tuo profilo si sincronizza ovunque.' },
  { icon: '🔓', title: 'Tutto sbloccato con Ultra', text: 'Accesso illimitato a tutto il catalogo cloud.' },
];

export default function CloudGamingPage() {
  const [planFilter, setPlanFilter] = useState('');
  const [cloudGames, setCloudGames] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([getCloudGames(planFilter || undefined), getPlans()])
      .then(([gamesData, plansData]) => {
        if (isCancelled) return;
        setCloudGames(gamesData);
        setPlans(plansData);
      })
      .catch((err) => console.error('Errore nel caricamento della pagina Cloud Gaming:', err))
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [planFilter]);

  return (
    <div className="cloud-page">
      <section className="cloud-hero page-container">
        <div className="cloud-hero__text">
          <p className="shop-page__breadcrumb">Cloud Gaming</p>
          <h1 className="cloud-hero__title">
            Gioca ovunque,
            <br />
            <span className="hero__title-accent">senza limiti</span>
          </h1>
          <p className="cloud-hero__description">
            Streaming diretto dal cloud. Zero download, zero attese. Accedi con Premium o Ultra.
          </p>

          <ul className="cloud-hero__highlights">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="cloud-highlight surface-card">
                <span className="cloud-highlight__icon" aria-hidden="true">{item.icon}</span>
                <div>
                  <p className="cloud-highlight__title">{item.title}</p>
                  <p className="cloud-highlight__text">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="cloud-hero__panel surface-card">
          <p className="cloud-hero__panel-label">● In riproduzione — Cloud</p>
          {cloudGames.slice(0, 4).map((game) => (
            <div key={game.id} className="cloud-hero__panel-item">
              <span>{game.title}</span>
              <span className={`badge ${game.plan === 'ultra' ? 'badge-purple' : 'badge-cyan'}`}>
                {game.plan === 'ultra' ? 'Ultra' : 'Premium'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container cloud-library">
        <div className="home-section__header">
          <div className="section-heading"><h2>Libreria Cloud Gaming</h2></div>
          <div className="shop-page__pills">
            {[
              { value: '', label: 'Tutti' },
              { value: 'premium', label: 'Premium' },
              { value: 'ultra', label: 'Ultra' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`shop-pill${planFilter === opt.value ? ' shop-pill--active' : ''}`}
                onClick={() => setPlanFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Loader label="Carico la libreria cloud..." />
        ) : cloudGames.length === 0 ? (
          <p className="home-section__empty">Nessun gioco disponibile per questo piano.</p>
        ) : (
          <div className="home-section__grid">
            {cloudGames.map((game) => (
              // I dati di /cloud_games non hanno tutti i campi di /games
              // (es. manca "featured"): GameCard gestisce già la loro
              // assenza con valori opzionali, quindi possiamo riusarla.
              <GameCard key={game.id} game={{ ...game, cloudPlan: game.plan }} variant="cloud" />
            ))}
          </div>
        )}
      </section>

      <section className="page-container cloud-plans">
        <div className="section-heading"><h2>Scegli il tuo piano</h2></div>
        <p className="cloud-plans__subtitle">Da gratuito a Ultra premium. Più giochi, più sconti, più libertà.</p>

        <div className="cloud-plans__grid">
          {plans.map((plan) => {
            const key = plan.name?.toLowerCase();
            const features = plan.features ?? FALLBACK_FEATURES[key] ?? [];
            return (
              <article
                key={plan.id}
                className={`cloud-plan-card surface-card${key === 'ultra' ? ' cloud-plan-card--ultra' : key === 'premium' ? ' cloud-plan-card--premium' : ''}`}
              >
                <h3 className="cloud-plan-card__name">{plan.name}</h3>
                <p className="cloud-plan-card__price">
                  {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                  {plan.price > 0 && <span>/mese</span>}
                </p>
                <ul className="cloud-plan-card__features">
                  {features.map((feature) => (
                    <li key={feature}>✓ {feature}</li>
                  ))}
                </ul>
                <button type="button" className={`btn ${key === 'standard' ? 'btn-outline' : 'btn-primary'} cloud-plan-card__cta`}>
                  {key === 'standard' ? 'Piano attuale' : `Passa a ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
