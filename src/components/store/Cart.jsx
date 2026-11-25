import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, LoaderCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { setCartCount } from "../../features/cart/cartSlice.js";

import cartService from "../../services/cartService.js";
import StoreNavbar from "../../pages/store/StoreNavbar.jsx";
import StoreFooter from "../../pages/store/StoreFooter.jsx";
import "../../styles/cart.css";

function Cart() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingGameId, setRemovingGameId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await cartService.getCart();
        setCartData(response.data);

        dispatch(setCartCount(response.data.cartCount));
      } catch (error) {
        setError(error.response?.data?.message || "Unable to load your cart.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);

  const cartItems = cartData?.cart || [];

  const handleProceedToCheckout = () => {
    navigate("/payment");
  };

  const handleRemoveFromCart = async (gameId) => {
    try {
      setRemovingGameId(gameId);
      setError("");

      const response = await cartService.removeFromCart(gameId);

      // Update Redux cart count.
      dispatch(setCartCount(response.data.cartCount));

      // Refresh cart data and order summary.
      const updatedCart = await cartService.getCart();

      setCartData(updatedCart.data);
      dispatch(setCartCount(updatedCart.data.cartCount));
    } catch (error) {
      console.error("Remove cart error:", error);
      console.error("Error response:", error.response?.data);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to remove game from cart.",
      );
    } finally {
      setRemovingGameId(null);
    }
  };

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
                  const originalPrice = Number(game.price) || 0;
                  const discountPrice = Number(game.discountPrice) || 0;

                  const hasDiscount =
                    discountPrice > 0 && discountPrice < originalPrice;

                  const finalPrice = hasDiscount
                    ? discountPrice
                    : originalPrice;

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

                          {hasDiscount && (
                            <del>₹{originalPrice.toLocaleString("en-IN")}</del>
                          )}

                          <button
                            type="button"
                            className="cart-remove-button"
                            onClick={() => handleRemoveFromCart(game._id)}
                            disabled={removingGameId === game._id}
                          >
                            {removingGameId === game._id
                              ? "Removing..."
                              : "Remove"}
                          </button>
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
                  <strong>
                    ₹{(Number(cartData.subtotal) || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="cart-summary-row">
                  <span>Discount</span>
                  <strong className="cart-discount">
                    -₹
                    {(Number(cartData.totalDiscount) || 0).toLocaleString(
                      "en-IN",
                    )}
                  </strong>
                </div>

                <div className="cart-summary-total">
                  <span>Total Payable</span>
                  <strong>
                    ₹
                    {(Number(cartData.totalPayable) || 0).toLocaleString(
                      "en-IN",
                    )}
                  </strong>
                </div>

                <button
                  type="button"
                  className="cart-checkout-button"
                  onClick={handleProceedToCheckout}
                >
                  Proceed to Checkout
                </button>
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
