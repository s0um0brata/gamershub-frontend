import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, LoaderCircle, ShoppingCart } from "lucide-react";

import cartService from "../../services/cartService.js";
import orderService from "../../services/orderService.js";
import paymentService from "../../services/paymentService.js";

import StoreNavbar from "./StoreNavbar.jsx";
import StoreFooter from "./StoreFooter.jsx";

import "../../styles/payment.css";

function Payment() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const idempotencyKeyRef = useRef(null);
  const location = useLocation();

  const checkoutType = location.state?.checkoutType || "cart";
  const selectedGame = location.state?.game || null;
  const gameId = location.state?.gameId || null;
  const isBuyNow = checkoutType === "buyNow";

  useEffect(() => {
    if (isBuyNow) {
      setLoading(false);
      return;
    }

    const fetchCheckoutData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await cartService.getCart();
        setCartData(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to load checkout details.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCheckoutData();
  }, [isBuyNow]);

  const handleProceedToPayment = async () => {
    try {
      setProcessing(true);
      setError("");

      // Reuse the same key if the payment session request needs retrying.
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      // Step 1: Create the order.
      const orderResponse = await orderService.createOrder(
        idempotencyKeyRef.current,
        isBuyNow ? gameId : null,
      );

      const orderId = orderResponse.data?.order?._id;

      if (!orderId) {
        throw new Error("Unable to create your order. Please try again.");
      }

      // Step 2: Create Stripe Checkout Session.
      const paymentResponse =
        await paymentService.createPaymentSession(orderId);

      const checkoutUrl = paymentResponse.data?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error("Unable to initialize secure payment.");
      }

      // Step 3: Redirect to Stripe Checkout.
      window.location.assign(checkoutUrl);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong while processing your order.",
      );

      setProcessing(false);
    }
  };

  const cartItems = isBuyNow
    ? selectedGame
      ? [selectedGame]
      : []
    : cartData?.cart || [];

  const buyNowPrice = Number(selectedGame?.price || 0);

  const buyNowFinalPrice =
    selectedGame?.discountPrice !== null &&
    selectedGame?.discountPrice !== undefined &&
    Number(selectedGame.discountPrice) < buyNowPrice
      ? Number(selectedGame.discountPrice)
      : buyNowPrice;

  const subtotal = isBuyNow ? buyNowPrice : Number(cartData?.subtotal || 0);

  const totalDiscount = isBuyNow
    ? buyNowPrice - buyNowFinalPrice
    : Number(cartData?.totalDiscount || 0);

  const totalPayable = isBuyNow
    ? buyNowFinalPrice
    : Number(cartData?.totalPayable || 0);

  return (
    <>
      <StoreNavbar />

      <main className="payment-page">
        <div className="payment-page-container">
          <div className="payment-page-heading">
            <div>
              <span className="payment-eyebrow">SECURE CHECKOUT</span>
              <h1>Complete Your Order</h1>
              <p>Review your selected games before proceeding to payment.</p>
            </div>

            <Link
              to={isBuyNow ? `/game/${selectedGame?.slug}` : "/cart"}
              className="payment-back-link"
            >
              <ArrowLeft size={17} />
              {isBuyNow ? "Back to Game" : "Back to Cart"}
            </Link>
          </div>

          {loading ? (
            <div className="payment-loading">
              <LoaderCircle size={35} className="payment-loader" />
              <p>Loading checkout details...</p>
            </div>
          ) : error ? (
            <div className="payment-error">{error}</div>
          ) : cartItems.length === 0 ? (
            <div className="payment-empty">
              <ShoppingCart size={55} />
              <h2>Your cart is empty</h2>
              <p>Add some games before proceeding to payment.</p>
              <Link to="/" className="payment-shop-button">
                Explore Games
              </Link>
            </div>
          ) : (
            <div className="payment-page-layout">
              <section className="payment-items-section">
                <div className="payment-section-heading">
                  <h2>Order Items</h2>
                  <span>{cartItems.length} Games</span>
                </div>

                <div className="payment-items-list">
                  {cartItems.map((game) => {
                    const finalPrice =
                      game.discountPrice !== null &&
                      game.discountPrice !== undefined &&
                      Number(game.discountPrice) < Number(game.price)
                        ? Number(game.discountPrice)
                        : Number(game.price);

                    return (
                      <article className="payment-item" key={game._id}>
                        <img
                          src={game.coverImage}
                          alt={game.title}
                          className="payment-item-image"
                        />

                        <div className="payment-item-details">
                          <h3>{game.title}</h3>
                          <p>{game.developer}</p>

                          <div className="payment-item-price">
                            <strong>
                              ₹{finalPrice.toLocaleString("en-IN")}
                            </strong>

                            {finalPrice < Number(game.price) && (
                              <del>
                                ₹{Number(game.price).toLocaleString("en-IN")}
                              </del>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              <aside className="payment-summary">
                <h2>Order Summary</h2>

                <div className="payment-summary-row">
                  <span>Subtotal</span>
                  <strong>₹{subtotal.toLocaleString("en-IN")}</strong>
                </div>

                <div className="payment-summary-row">
                  <span>Discount</span>
                  <strong className="payment-discount">
                    -₹{totalDiscount.toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="payment-summary-total">
                  <span>Total Payable</span>
                  <strong>₹{totalPayable.toLocaleString("en-IN")}</strong>
                </div>

                <button
                  type="button"
                  className="payment-proceed-button"
                  onClick={handleProceedToPayment}
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <LoaderCircle size={18} className="payment-loader" />
                      Processing...
                    </>
                  ) : (
                    "Continue to Secure Payment"
                  )}
                </button>

                <p className="payment-secure-note">
                  Payments securely processed by Stripe.
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

export default Payment;
