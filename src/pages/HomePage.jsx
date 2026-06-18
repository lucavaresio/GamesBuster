/* ==========================================================================
   HomePage.jsx  →  corrisponde alla "Landing Page" del Figma
   ==========================================================================
   Compone le sezioni della home:
   1. Hero (statico)
   2. Stats (statico)
   3. Giochi in evidenza   -> GET /games?featured=true
   4. Piani in abbonamento -> GET /plans (versione "teaser", il confronto
      completo dei piani vive nella pagina Cloud Gaming)
   ========================================================================== */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import GameCard from '../components/GameCard';
import Loader from '../components/Loader';
import { getGames, getPlans } from '../lib/api';
import { useCart } from '../context/CartContext';
import './HomePage.css';

export default function HomePage() {
  const { addItem } = useCart();

  const [featuredGames, setFeaturedGames] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lancia le due richieste in parallelo con Promise.all invece che
    // una dopo l'altra: la pagina è pronta non appena ARRIVA LA PIÙ LENTA
    // delle due, non la somma dei tempi di entrambe.
    let isCancelled = false;

    async function loadHomeData() {
      try {
        const [games, plansData] = await Promise.all([
          getGames({ featured: true, _limit: 4 }),
          getPlans(),
        ]);
        if (!isCancelled) {
          setFeaturedGames(games);
          setPlans(plansData);
        }
      } catch (err) {
        console.error('Errore nel caricamento della home:', err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadHomeData();

    // Cleanup: se l'utente cambia pagina prima che la fetch finisca,
    // evita di aggiornare lo stato di un componente non più montato.
    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <>
      <Hero />
      <Stats />

      <section className="home-section page-container">
        <div className="home-section__header">
          <div className="section-heading">
            <h2>Giochi in evidenza</h2>
          </div>
          <Link to="/shop" className="btn-ghost">Vedi tutto il catalogo →</Link>
        </div>

        {loading ? (
          <Loader label="Carico i giochi in evidenza..." />
        ) : featuredGames.length === 0 ? (
          <p className="home-section__empty">Nessun gioco in evidenza al momento.</p>
        ) : (
          <div className="home-section__grid">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} onAddToCart={addItem} />
            ))}
          </div>
        )}
      </section>

      <section className="home-section page-container">
        <div className="home-section__header">
          <div className="section-heading">
            <h2>Scegli il tuo piano</h2>
          </div>
          <Link to="/cloud-gaming" className="btn-ghost">Confronta i piani →</Link>
        </div>

        {!loading && (
          <div className="home-plans">
            {plans.map((plan) => (
              <article key={plan.id} className={`home-plan-card surface-card${plan.name?.toLowerCase() === 'ultra' ? ' home-plan-card--highlight' : ''}`}>
                <h3 className="home-plan-card__name">{plan.name}</h3>
                <p className="home-plan-card__price">
                  {plan.price === 0 ? 'Gratis' : `€${plan.price}`}
                  {plan.price > 0 && <span className="home-plan-card__period">/mese</span>}
                </p>
                <Link to="/cloud-gaming" className="btn btn-outline home-plan-card__cta">
                  Scopri di più
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
