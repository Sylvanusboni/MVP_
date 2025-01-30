import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "http://localhost:8080/api/transaction";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const transactionReference = localStorage.getItem("transactionReference");
  const amount = localStorage.getItem("amount");

  console.log("Transaction Reference:", transactionReference);
  console.log("Amount:", amount);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionReference,
            amount,
          }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.removeItem("transactionReference");
            localStorage.removeItem("amount");
            alert("Payment confirmed");
          // Payment is confirmed, redirect to /dons
          navigate("/dons");
        } else {
          alert(`Payment failed: ${data.message || "Please try again."}`);
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        alert("An error occurred while verifying your payment.");
      }
    };

    // Verify the payment when the component mounts
    if (transactionReference && amount) {
      verifyPayment();
    }
  }, [transactionReference, amount, navigate]);

  return <div>Processing your payment...</div>;
};

export default PaymentCallback;
