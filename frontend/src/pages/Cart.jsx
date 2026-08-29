import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function Cart() {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${user?.token}` }
  });

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart', getAuthHeader());
      setCart(res.data);

      const productDetails = {};
      for (const item of res.data.items) {
        try {
          const productRes = await api.get(`/products/${item.productId}`);
          productDetails[item.productId] = productRes.data;
        } catch (productErr) {
          console.warn(`Product ID ${item.productId} could not be loaded:`, productErr.message);
          productDetails[item.productId] = null;
        }
      }
      setProducts(productDetails);
    } catch (err) {
      console.error("Cart API Error:", err.response?.data || err.message);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchCart();
    }
  }, [user, authLoading]);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity: newQuantity }, getAuthHeader());
      fetchCart();
    } catch (err) {
      setError('Failed to update quantity');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`, getAuthHeader());
      fetchCart();
    } catch (err) {
      setError('Failed to remove item');
    }
  };

  const handleMockPurchase = () => {
    setCheckoutSuccess(true);
  };

  if (checkoutSuccess) {
    return (
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <span className="badge" style={{ background: 'var(--success)', color: '#fff', marginBottom: '1.5rem', padding: '0.5rem 1.2rem' }}>Success</span>
        <h1 className="section-title">Thank You for Your Purchase!</h1>
        <p className="section-subtitle">This is a demo checkout simulation. Your payment was successfully received and mock processed.</p>
        <button className="btn btn-primary" onClick={() => setCheckoutSuccess(false)}>Shop More</button>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="container">
        <p className="section-subtitle">Verifying authorization status...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <p className="error-text">Please log in to view your shopping cart.</p>
      </div>
    );
  }

  if (loading || !cart) {
    return (
      <div className="container">
        <p className="section-subtitle">Loading cart...</p>
      </div>
    );
  }

  const total = cart.items.reduce((sum, item) => {
    const product = products[item.productId];
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <h1 className="section-title">Your Cart</h1>
      <p className="section-subtitle">Review items before mock processing</p>

      {cart.items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p className="section-subtitle">Your shopping cart is currently empty.</p>
        </div>
      ) : (
        <>
          <div>
            {cart.items.map((item) => {
              const product = products[item.productId];
              if (!product) return null;

              return (
                <div key={item.id} className="cart-item">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>{product.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>${product.price.toFixed(2)} each</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label htmlFor={`qty-${item.id}`} style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>QTY</label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                      />
                    </div>
                    <span style={{ fontWeight: '800', width: '80px', textAlign: 'right' }}>
                      ${(product.price * item.quantity).toFixed(2)}
                    </span>
                    <button onClick={() => handleRemove(item.id)} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {error && <p className="error-text" style={{ marginTop: '1rem' }}>{error}</p>}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '2rem' }}>
            <div className="cart-total">
              <span style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-muted)', marginRight: '1rem' }}>Order Total:</span>
              ${total.toFixed(2)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={handleMockPurchase} className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.05rem' }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;