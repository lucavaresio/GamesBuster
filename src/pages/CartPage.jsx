/* ==========================================================================
   CartPage.jsx  
   ==========================================================================
   Pagina del carrello
   ========================================================================== */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import GameCard from '../components/GameCard';
import Loader from '../components/Loader';
import { CURRENT_USER_ID, createOrder, getGames, getUser, updateUser } from '../lib/api';
import './CartPage.css';

export default function CartPage() {
  const { items, loading, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  const [user, setUser] = useState(null);
  const [gamesById, setGamesById] = useState({});
  const [suggested, setSuggested] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  useEffect(() => {
    getUser(CURRENT_USER_ID).then(setUser).catch((err) => console.error(err));
    getGames({ _limit: 200 })
      .then((all) => {
        setGamesById(Object.fromEntries(all.map((g) => [g.id, g])));
        setSuggested(all.filter((g) => g.featured).slice(0, 4));
      })
      .catch((err) => console.error(err));
  }, []);

  const isUltra = user?.subscriptionPlan === 'ultra';

  // Sconto Ultra (10%) applicato solo alle righe il cui gioco corrispondente
  // ha un cloudPlan diverso da null (vedi nota nella documentazione API).
  const ultraDiscount = isUltra
    ? items.reduce((total, item) => {
        const relatedGame = gamesById[item.gameId];
        if (relatedGame?.cloudPlan) {
          return total + item.price * (item.quantity || 1) * 0.1;
        }
        return total;
      }, 0)
    : 0;

  const shipping = subtotal === 0 || subtotal >= 50 ? 0 : 4.99;
  const tax = (subtotal - ultraDiscount) * 0.08;
  const total = subtotal - ultraDiscount + shipping + tax;

  function handlePromoSubmit(e) {
    e.preventDefault();
    // Funzionalità dimostrativa: l'API non prevede codici promozionali,
    // quindi qui mostriamo solo un messaggio informativo invece di
    // applicare un finto sconto che non avrebbe corrispondenza reale
    // con i dati del server.
    setPromoMessage(
      promoCode.trim()
        ? 'I codici promozionali non sono ancora gestiti dal server: nessuno sconto applicato.'
        : 'Inserisci un codice prima di continuare.'
    );
  }

  async function handleCheckout() {
    if (items.length === 0) return;
    setPlacingOrder(true);
    try {
      const order = await createOrder({
        userId: CURRENT_USER_ID,
        items: items.map((item) => ({
          gameId: item.gameId,
          title: item.title,
          format: item.format,
          condition: item.condition,
          price: item.price,
        })),
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(ultraDiscount.toFixed(2)),
        total: Number(total.toFixed(2)),
        shippingAddress: user?.shippingAddress ?? 'Indirizzo non specificato',
        paymentMethod: 'Carta di credito',
        status: 'in elaborazione',
        createdAt: new Date().toISOString().slice(0, 10),
      });

      if (user) {
        await updateUser(CURRENT_USER_ID, { totalOrders: (user.totalOrders || 0) + 1 });
      }

      await clearCart();
      setOrderConfirmation(order);
    } catch (err) {
      console.error('Errore durante il checkout:', err);
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) return <Loader label="Carico il tuo carrello..." />;

  if (orderConfirmation) {
    return (
      <div className="empty-state page-container">
        <h3>✓ Ordine confermato</h3>
        <p>
          Grazie! Il tuo ordine #{orderConfirmation.id} da €{total.toFixed(2)} è stato registrato
          ed è ora "in elaborazione".
        </p>
        <Link to="/shop" className="btn btn-primary">Torna allo shop</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state page-container">
        <h3>Il tuo carrello è vuoto</h3>
        <p>Aggiungi qualche gioco dal catalogo per iniziare.</p>
        <Link to="/shop" className="btn btn-primary">Vai al catalogo</Link>
      </div>
    );
  }

  return (
    <div className="cart-page page-container">
      <div className="cart-page__header">
        <div>
          <p className="shop-page__breadcrumb">Shop / Carrello</p>
          <h1 className="cart-page__title">
            🛒 Il tuo carrello <span className="cart-page__count">({items.length} articoli)</span>
          </h1>
        </div>
        <Link to="/shop" className="btn-ghost">← Continua lo shopping</Link>
      </div>

      <div className="cart-page__layout">
        <div className="cart-page__items">
          {items.map((item) => (
            <div key={item.id} className="cart-item surface-card">
              <div className="cart-item__cover" aria-hidden="true">🎮</div>

              <div className="cart-item__info">
                <p className="cart-item__title">{item.title}</p>
                <div className="cart-item__badges">
                  <span className="badge badge-cyan">{item.platform}</span>
                  <span className="badge badge-gray">{item.format}</span>
                  <span className="badge badge-gray">{item.condition}</span>
                </div>
              </div>

              <div className="cart-item__qty" role="group" aria-label="Quantità">
                <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)} disabled={(item.quantity || 1) <= 1}>−</button>
                <span>{item.quantity || 1}</span>
                <button type="button" onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}>+</button>
              </div>

              <div className="cart-item__price">€{(item.price * (item.quantity || 1)).toFixed(2)}</div>

              <button type="button" className="btn-danger-soft" onClick={() => removeItem(item.id)}>
                Rimuovi
              </button>
            </div>
          ))}

          <form className="cart-promo surface-card" onSubmit={handlePromoSubmit}>
            <span aria-hidden="true">🏷️</span>
            <input
              type="text"
              placeholder="Inserisci un codice promo..."
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button type="submit" className="btn btn-outline">Applica codice</button>
            {promoMessage && <p className="cart-promo__message">{promoMessage}</p>}
          </form>
        </div>

        <aside className="cart-summary surface-card">
          <h2 className="cart-summary__title">📋 Riepilogo ordine</h2>

          <div className="cart-summary__row">
            <span>Subtotale</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>
          {ultraDiscount > 0 && (
            <div className="cart-summary__row cart-summary__row--discount">
              <span>Sconto Ultra (10% su titoli AAA)</span>
              <span>−€{ultraDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="cart-summary__row">
            <span>Spedizione</span>
            <span>{shipping === 0 ? 'Gratuita' : `€${shipping.toFixed(2)}`}</span>
          </div>
          <div className="cart-summary__row">
            <span>IVA stimata (8%)</span>
            <span>€{tax.toFixed(2)}</span>
          </div>

          <div className="cart-summary__total">
            <span>Totale</span>
            <span>€{total.toFixed(2)}</span>
          </div>

          {shipping === 0 && subtotal > 0 && (
            <p className="cart-summary__shipping-note">✓ Spedizione gratuita sbloccata</p>
          )}

          <button type="button" className="btn btn-primary cart-summary__checkout" onClick={handleCheckout} disabled={placingOrder}>
            {placingOrder ? 'Invio ordine...' : 'Procedi al checkout →'}
          </button>
        </aside>
      </div>

      {suggested.length > 0 && (
        <section className="cart-page__suggested">
          <div className="home-section__header">
            <div className="section-heading"><h2>Potrebbe interessarti anche</h2></div>
          </div>
          <div className="home-section__grid">
            {suggested.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
