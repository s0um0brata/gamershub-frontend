import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

import paymentService from "../../services/paymentService.js";
import StoreNavbar from "./StoreNavbar.jsx";
import StoreFooter from "./StoreFooter.jsx";

import "../../styles/payment.css";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Payment session ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await paymentService.verifyPaymentSession(sessionId);

        setPaymentData(response.data);

        if (!response.data?.isPaid) {
          setError(
            "Your payment is still being processed. Please check your order history shortly.",
          );
        }
      } catch (error) {
        setError(
          error.response?.data?.message || "Unable to verify your payment.",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <>
      <StoreNavbar />

      <main className="payment-page">
        <div className="payment-page-container">
          <div className="payment-result-card">
            {loading ? (
              <>
                <LoaderCircle size={48} className="payment-loader" />
                <h1>Verifying Your Payment</h1>
                <p>Please wait while we confirm your transaction.</p>
              </>
            ) : paymentData?.isPaid ? (
              <>
                <CheckCircle2 size={58} className="payment-success-icon" />
                <h1>Payment Successful!</h1>
                <p>Your order has been placed successfully.</p>

                <div className="payment-result-details">
                  <span>Order Number</span>
                  <strong>{paymentData.orderNumber}</strong>

                  <span>Amount Paid</span>
                  <strong>
                    ₹{Number(paymentData.totalAmount).toLocaleString("en-IN")}
                  </strong>
                </div>

                <Link to="/profile" className="payment-shop-button">
                  View Your Profile
                </Link>
              </>
            ) : (
              <>
                <XCircle size={58} className="payment-error-icon" />
                <h1>Payment Not Confirmed</h1>
                <p>{error}</p>

                <Link to="/profile" className="payment-shop-button">
                  View Your Orders
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <StoreFooter />
    </>
  );
}

export default PaymentSuccess;
