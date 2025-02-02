import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, CircularProgress } from '@mui/material';

const TransferPage = () => {
  const userId = localStorage.getItem('userId');
  const [formData, setFormData] = useState({
    userId: userId,
    amount: '',
    accountNumber: '',
    accountType: '',
    lastname: '',
    othernames: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTransfer = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await axios.post('http://localhost:8080/transfer', formData);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Transfer failed');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>Transfer Money</Typography>
      {/* <TextField label="User ID" name="userId" fullWidth margin="normal" onChange={handleChange} /> */}
      <TextField label="Amount" name="amount" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Account Number" name="accountNumber" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Account Type" name="accountType" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Beneficiary Last Name" name="lastname" fullWidth margin="normal" onChange={handleChange} />
      <TextField label="Beneficiary Other Names" name="othernames" fullWidth margin="normal" onChange={handleChange} />

      <Button variant="contained" color="primary" fullWidth onClick={handleTransfer} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Send Transfer'}
      </Button>

      {message && <Typography variant="body1" color="error" style={{ marginTop: 10 }}>{message}</Typography>}
    </Container>
  );
};

export default TransferPage;
