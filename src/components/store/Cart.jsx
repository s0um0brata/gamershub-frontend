import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, LoaderCircle } from "lucide-react";

import cartService from "../../services/cartService.js";
import StoreNavbar from "../../pages/store/StoreNavbar.jsx";
import StoreFooter from "../../pages/store/StoreFooter.jsx";
import "../../styles/cart.css";

function Cart() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await cartService.getCart();
        setCartData(response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load your cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const cartItems = cartData?.cart || [];

  return (
    <>
      <StoreNavbar />

      <main className="cart-page">
        <div className="cart-page-container">
          <div className="cart-page-heading">
            <div>
              <span className="cart-page-eyebrow">YOUR COLLECTION</span>
              <h1>Shopping Cart</h1>
              <p>Review your selected games before proceeding.</p>
            </div>

            <Link to="/store" className="cart-continue-link">
              <ArrowLeft size={17} />
              Continue Shopping
            </Link>
          </div>

          {loading ? (
            <div className="cart-page-loading">
              <LoaderCircle size={32} className="cart-loader" />
              <p>Loading your cart...</p>
            </div>
          ) : error ? (
            <div className="cart-page-error">{error}</div>
          ) : cartItems.length === 0 ? (
            <div className="cart-page-empty">
              <ShoppingCart size={55} />
              <h2>Your cart is empty</h2>
              <p>You haven't added any games to your cart yet.</p>
              <Link to="/store" className="cart-shop-button">
                Explore Games
              </Link>
            </div>
          ) : (
            <div className="cart-page-layout">
              <section className="cart-page-items">
                <div className="cart-items-heading">
                  <h2>Your Items</h2>
                  <span>{cartData.cartCount} Games</span>
                </div>

                {cartItems.map((game) => {
                  const finalPrice =
                    game.discountPrice < game.price
                      ? game.discountPrice
                      : game.price;

                  return (
                    <article className="cart-page-item" key={game._id}>
                      <img
                        src={game.coverImage}
                        alt={game.title}
                        className="cart-page-item-image"
                      />

                      <div className="cart-page-item-details">
                        <h3>{game.title}</h3>
                        <p>{game.developer}</p>

                        <div className="cart-page-item-price">
                          <strong>₹{finalPrice.toLocaleString("en-IN")}</strong>

                          {game.discountPrice < game.price && (
                            <del>₹{game.price.toLocaleString("en-IN")}</del>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <aside className="cart-page-summary">
                <h2>Order Summary</h2>

                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <strong>₹{cartData.subtotal?.toLocaleString("en-IN")}</strong>
                </div>

                <div className="cart-summary-row">
                  <span>Discount</span>
                  <strong className="cart-discount">
                    -₹{cartData.totalDiscount?.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="cart-summary-total">
                  <span>Total Payable</span>
                  <strong>
                    ₹{cartData.totalPayable?.toLocaleString("en-IN")}
                  </strong>
                </div>

                <button type="button" className="cart-checkout-button" disabled>
                  Proceed to Checkout
                </button>

                <p className="cart-checkout-note">
                  Checkout functionality will be added later.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </>
  );
}

export default Cart;
