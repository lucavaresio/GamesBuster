/* ==========================================================================
   Hero.jsx
   ==========================================================================
   Sezione di apertura della Home page, componente di presentazione nella
   pagina introduttiva
   ========================================================================== */

import { Link } from 'react-router-dom';
import HomeBackground from '../images/home-background.png';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" style={{ backgroundImage: `url(${HomeBackground})` }}>
      <div className="hero__overlay" />
      <div className="hero__content page-container">
        <span className="hero__eyebrow">Piattaforma Online</span>
        <h1 className="hero__title">
          Porta il tuo gaming
          <br />
          <span className="hero__title-accent">al livello successivo</span>
        </h1>
        <p className="hero__description">
          L&apos;unica piattaforma che unisce e-commerce e cloud gaming: compra, vendi e gioca
          senza limiti, in un&apos;unica esperienza.
        </p>
        <div className="hero__actions">
          <Link to="/shop" className="btn btn-primary">
            Esplora lo shop 
          </Link>
          <Link to="/cloud-gaming" className="btn btn-outline">
            Prova il Cloud
          </Link>
        </div>
      </div>
    </section>
  );
}
