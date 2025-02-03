import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";

const API_BASE_URL = "http://localhost:8080/api/transaction";

const TransactionTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user-transactions?userId=${userId}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (transactionReference, amount) => {
    try {
      const response = await fetch(`${API_BASE_URL}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionReference, amount }),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Payment confirmed");
        fetchTransactions(); // Refresh transaction list
      } else {
        alert(`Payment failed: ${data.message || "Please try again."}`);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      alert("An error occurred while verifying the payment.");
    }
  };

  return (
    <TableContainer component={Paper}>
      {loading ? (
        <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Reference</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction._id}>
                <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell>{transaction.amount}</TableCell>
                <TableCell>{transaction.transactionReference}</TableCell>
                <TableCell>{transaction.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={transaction.status === "completed"}
                    onClick={() => verifyPayment(transaction.transactionReference, transaction.amount)}
                  >
                    Validate
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};

export default TransactionTable;
