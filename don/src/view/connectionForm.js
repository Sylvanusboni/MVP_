import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthPage = () => {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ name: "", surname: "", email: "", phone: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = tab === 0 ? "http://localhost:8080/api/user/login" : "http://localhost:8080/api/user/signup";
      const payload = tab === 0
        ? { email: form.email, password: form.password }
        : { name: form.name, surname: form.surname, email: form.email, phone: form.phone, password: form.password };

      const response = await axios.post(endpoint, payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('name', response.data.name);
      localStorage.setItem('userId', response.data._id);
      localStorage.setItem('email', response.data.email);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4">{tab === 0 ? "Connexion" : "Inscription"}</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} centered>
        <Tab label="Connexion" />
        <Tab label="Inscription" />
      </Tabs>
      <Box component="form" onSubmit={handleSubmit} mt={2}>
        {tab === 1 && (
          <>
            <TextField fullWidth label="Nom" name="name" value={form.name} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Prénom" name="surname" value={form.surname} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Téléphone" name="phone" value={form.phone} onChange={handleChange} margin="normal" />
          </>
        )}
        <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} margin="normal" />
        <TextField fullWidth label="Mot de passe" type="password" name="password" value={form.password} onChange={handleChange} margin="normal" />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          {tab === 0 ? "Se connecter" : "S'inscrire"}
        </Button>
      </Box>
    </Container>
  );
};

export default AuthPage;