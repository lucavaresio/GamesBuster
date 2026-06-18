/* ==========================================================================
   Footer.jsx
   ==========================================================================
   Footer del sito, presente in fondo a ogni pagina. 
   ========================================================================== */

import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_COLUMNS = [
  {
    title: 'Negozio',
    links: [
      { label: 'Catalogo giochi', to: '/shop' },
      { label: 'Cloud Gaming', to: '/cloud-gaming' },
      { label: 'Trade-in', to: '/trade-in' },
      { label: 'Carrello', to: '/cart' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Forum', to: '#' },
      { label: 'Eventi & Torneo', to: '#' },
      { label: 'Blog', to: '#' },
    ],
  },
  {
    title: 'Assistenza',
    links: [
      { label: 'Centro assistenza', to: '#' },
      { label: 'Sicurezza compravendita', to: '#' },
      { label: 'Termini di servizio', to: '#' },
    ],
  },
];

export default function Footer() {

  return (
    <footer className="footer">
      <div className="footer__main page-container">
        <div className="footer__brand">
          <span className="footer__wordmark">
            Games<span className="navbar__wordmark-accent">Buster</span>
          </span>
          <p className="footer__tagline">
            La piattaforma che unisce e-commerce di videogiochi, cloud gaming e compravendita
            tra utenti in un&apos;unica esperienza.
          </p>
          <div className="footer__socials">
            <a href="#" className="footer__social-link" aria-label="Discord">💬</a>
            <a href="#" className="footer__social-link" aria-label="X / Twitter">🐦</a>
            <a href="#" className="footer__social-link" aria-label="Instagram">📷</a>
            <a href="#" className="footer__social-link" aria-label="YouTube">▶️</a>
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav className="footer__column" key={column.title} aria-label={column.title}>
            <h4 className="footer__column-title">{column.title}</h4>
            <ul className="footer__list">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer__bottom page-container">
        <p>&copy; 2026 GamesBuster.</p>
        <div className="footer__bottom-links">
          <Link to="#">Privacy</Link>
          <Link to="#">Termini</Link>
          <Link to="#">Cookie</Link>
        </div>
      </div>
    </footer>
  );
}
