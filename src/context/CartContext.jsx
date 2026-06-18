/* ==========================================================================
   CartContext.jsx
   ==========================================================================
   Perché un Context e non semplici useState in ogni pagina?
   Il numero di articoli nel carrello deve essere visibile nella NavBar
   (che sta nel Layout, sopra a tutte le pagine) E nella CartPage. Senza
   un Context dovremmo "far risalire" lo stato fino al componente comune
   più vicino (App.jsx) e poi passarlo in giù con le props — scomodo e
   difficile da mantenere quando l'albero di componenti cresce.

   Il Context risolve questo: chi ha bisogno dei dati del carrello chiama
   semplicemente l'hook `useCart()` e li trova già pronti, da qualunque
   punto dell'app si trovi.
   ========================================================================== */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENT_USER_ID, addCartItem, getCartItems, removeCartItem, updateCartItem } from '../lib/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carichiamo il carrello dell'utente "loggato" non appena l'app parte,
  // così la NavBar mostra subito il numero corretto di articoli.
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCartItems(CURRENT_USER_ID);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // NOTA: la regola eslint "react-hooks/set-state-in-effect" segnalerebbe
    // questa chiamata, ma il pattern "refresh() al mount" è esattamente
    // quello documentato da React per il data-fetching dentro un Effect
    // (vedi https://react.dev/learn/synchronizing-with-effects). La
    // disabilitiamo qui in modo puntuale e motivato, invece di riscrivere
    // un codice corretto solo per accontentare il linter.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  // Aggiunge un articolo al carrello. Se lo stesso gioco/formato è già
  // presente, alziamo semplicemente la quantità invece di duplicare la riga.
  const addItem = useCallback(async (item) => {
    const existing = items.find(
      (i) => i.gameId === item.gameId && i.format === item.format && i.condition === item.condition
    );
    if (existing) {
      const updated = await updateCartItem(existing.id, { quantity: (existing.quantity || 1) + 1 });
      setItems((prev) => prev.map((i) => (i.id === existing.id ? { ...i, ...updated } : i)));
    } else {
      const created = await addCartItem({ ...item, userId: CURRENT_USER_ID, quantity: 1 });
      setItems((prev) => [...prev, created]);
    }
  }, [items]);

  const updateQuantity = useCallback(async (id, quantity) => {
    if (quantity < 1) return;
    const updated = await updateCartItem(id, { quantity });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
  }, []);

  const removeItem = useCallback(async (id) => {
    await removeCartItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(async () => {
    await Promise.all(items.map((item) => removeCartItem(item.id)));
    setItems([]);
  }, [items]);

  // itemCount/subtotal vengono ricalcolati solo quando `items` cambia
  // (useMemo evita di rifare il calcolo ad ogni render inutilmente).
  const itemCount = useMemo(
    () => items.reduce((total, item) => total + (item.quantity || 1), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * (item.quantity || 1), 0),
    [items]
  );

  const value = {
    items,
    loading,
    error,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refresh,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Hook di comodo: invece di importare CartContext + useContext ovunque,
 *  i componenti scrivono semplicemente `const { items } = useCart();`
 *  (eslint-disable: è normalissimo, nei file di Context, esportare sia
 *  il Provider-componente sia l'hook di accesso dallo stesso file; la
 *  regola "fast refresh" lo segnala solo per ottimizzare l'Hot Module
 *  Replacement in sviluppo, non indica un errore reale). */
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart deve essere usato dentro un <CartProvider>');
  }
  return ctx;
}
