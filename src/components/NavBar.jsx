/* ==========================================================================
   NavBar.jsx
   ==========================================================================
   Barra di navigazione fissa in alto, presente in ogni pagina (viene
   renderizzata una sola volta dentro App.jsx, fuori dalle singole pagine).

   Contenuto, da sinistra a destra (replica 1:1 l'header del Figma):
   - logo + wordmark "GamesBuster"
   - link di navigazione (Shop, Forum, Cloud Gaming, Trade-in)
   - icona ricerca, icona carrello con badge quantità, avatar utente
   ========================================================================== */

import { NavLink, Link } from 'react-router-dom';
import Logo from '../images/logo.png';
import Profile from '../images/profile.avif';
import { useCart } from '../context/CartContext';
import './NavBar.css';

const NAV_LINKS = [
  { label: 'Shop', to: '/shop' },
  { label: 'Cloud Gaming', to: '/cloud-gaming' },
  { label: 'Trade-in', to: '/trade-in' },
];

export default function NavBar() {
  const { itemCount } = useCart();

  return (
    <header className="navbar">
      <div className="navbar__inner page-container">
        {/* Logo + nome del brand, cliccabile per tornare alla home */}
        <Link to="/" className="navbar__brand">
          <span className="navbar__logo-frame">
            <img src={Logo} alt="" className="navbar__logo" />
          </span>
          <span className="navbar__wordmark">
            Games<span className="navbar__wordmark-accent">Buster</span>
          </span>
        </Link>

        {/* Link di navigazione principali */}
        <nav className="navbar__links" aria-label="Navigazione principale">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `navbar__link${isActive ? ' navbar__link--active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Azioni rapide a destra */}
        <div className="navbar__actions">
          <Link to="/shop" className="navbar__icon-btn" aria-label="Cerca giochi nel catalogo">
            🔍
          </Link>
          <Link to="/cart" className="navbar__icon-btn navbar__icon-btn--cart" aria-label={`Carrello, ${itemCount} articoli`}>
            🛒
            {itemCount > 0 && <span className="navbar__cart-badge">{itemCount}</span>}
          </Link>
          <span className="navbar__divider" aria-hidden="true" />
          <div className="navbar__profile">
            <img src={Profile} alt="" className="navbar__avatar" />
            <span className="navbar__username">User</span>
          </div>
        </div>
      </div>
    </header>
  );
}
