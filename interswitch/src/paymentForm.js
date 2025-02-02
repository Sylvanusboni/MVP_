import { useState } from "react";
import axios from "axios";

function PaymentForm() {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState(null);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setTransactionId(null);

    try {
      const response = await axios.post("http://localhost:8080/pay", {
        userId: userId, 
        amount: parseFloat(amount),
      });

      const data = response.data; // Correct way to access response data
      setTransactionId(data.transactionReference);
      localStorage.setItem("transactionReference", data.transactionReference);
      localStorage.setItem("amount", amount);

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl; // Redirect to payment page
      } else {
        setError(`Error: ${data.message || "Payment URL missing"}`);
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
      console.error("Payment error:", err);
    }
  };

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Make a Payment</h1>
      <form onSubmit={handlePayment} className="space-y-4">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
          Pay Now
        </button>
      </form>
      {transactionId && <p className="mt-4 text-green-600">Transaction ID: {transactionId}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}

export default PaymentForm;
