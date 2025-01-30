import { useState } from "react";
import { useParams } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

const DonateForm = () => {
  const { campaignId } = useParams();
  const [formData, setFormData] = useState({ amount: "", email: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Donation submitted:", { ...formData, campaignId });
    // Add API call logic here
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