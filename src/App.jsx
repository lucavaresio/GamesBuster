import { Routes, Route } from 'react-router-dom';
import './App.css';

import NavBar from './components/NavBar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import GameDetailPage from './pages/GameDetailPage';
import CloudGamingPage from './pages/CloudGamingPage';
import CartPage from './pages/CartPage';
import TradeInPage from './pages/TradeInPage';
import NotFoundPage from './pages/NotFoundPage';

/* ==========================================================================
   App.jsx — Layout generale + definizione delle rotte
   ==========================================================================
   Ogni pagina del sito condivide la stessa "cornice": NavBar in alto e
   Footer in fondo. Invece di importare NavBar/Footer in OGNI pagina,
   li mettiamo una sola volta qui, e cambiamo solo il contenuto centrale
   in base all'URL corrente grazie a <Routes>/<Route>.

   Corrispondenza pagina ↔ frame Figma (i 3 frame esclusi dal lavoro non
   hanno una rotta corrispondente, come richiesto):
   - "/"              -> Landing Page
   - "/shop"          -> Shop Page (catalogo con filtri)
   - "/shop/:gameId"  -> Single game page (dettaglio prodotto)
   - "/cloud-gaming"  -> Cloud Gaming Homepage
   - "/cart"          -> Cart Page
   - "/trade-in"      -> Trade-in Page
   ========================================================================== */

export default function App() {
  return (
    <>
      <NavBar />

      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/shop/:gameId" element={<GameDetailPage />} />
          <Route path="/cloud-gaming" element={<CloudGamingPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/trade-in" element={<TradeInPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}
