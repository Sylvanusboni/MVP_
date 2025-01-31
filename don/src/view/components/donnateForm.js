import { useState } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const API_BASE_URL = "http://localhost:8080/api/campaign";

const DonateForm = () => {
  const { campaignId } = useParams();
  const [formData, setFormData] = useState({ amount: "", email: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.amount || formData.amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaignId,
          email: formData.email,
          amount: formData.amount,
        }),
      });
  
      const data = await response.json();
      localStorage.setItem("transactionReference", data.transactionReference);
      localStorage.setItem("amount", formData.amount);
  
      if (response.ok) {
        // Redirect user to the payment page
        window.location.href = data.paymentUrl;
      } else {
        alert(`Error: ${data.message || "Failed to initiate donation"}`);
      }
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("An error occurred while processing your donation.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, p: 3, boxShadow: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Donate to Campaign
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Amount (₦)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Donate Now
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default DonateForm;