import { Link, useSearchParams } from "react-router-dom";
import { XCircle, RefreshCw } from "lucide-react";

import StoreNavbar from "./StoreNavbar.jsx";
import StoreFooter from "./StoreFooter.jsx";

import "../../styles/payment.css";

function PaymentCancel() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <>
      <StoreNavbar />

      <main className="payment-page">
        <div className="payment-page-container">
          <div className="payment-result-card">
            <XCircle size={58} className="payment-error-icon" />

            <h1>Payment Cancelled</h1>

            <p>
              Your payment was cancelled or not completed. No successful payment
              has been recorded.
            </p>

            {orderId && (
              <p className="payment-cancel-note">
                Your pending order has not been automatically cancelled. You can
                retry payment from your order details.
              </p>
            )}

            <div className="payment-cancel-actions">
              <Link to="/profile" className="payment-shop-button">
                View Your Orders
              </Link>

              <Link to="/cart" className="payment-retry-link">
                <RefreshCw size={16} />
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </>
  );
}

export default PaymentCancel;
