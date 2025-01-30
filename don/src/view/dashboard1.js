import React from "react";
import { Container, Typography, Box, Grid, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" mt={5}>
        <Typography variant="h4">Tableau de Bord</Typography>
      </Box>
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Montant Total Collecté</Typography>
              <Typography variant="h4">$10,000</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Transactions Récentes</Typography>
              <Typography variant="body1">5 nouvelles transactions</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Notifications Importantes</Typography>
              <Typography variant="body1">2 paiements en retard</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} sm={4}>
          <Card onClick={() => navigate("/dons")}>
            <CardContent>
              <Typography variant="h6">Dons</Typography>
              <Typography variant="body2">Gérer et consulter les dons</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card onClick={() => navigate("/cotisations")}>
            <CardContent>
              <Typography variant="h6">Cotisations</Typography>
              <Typography variant="body2">Suivi des cotisations</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card onClick={() => navigate("/tontines")}>
            <CardContent>
              <Typography variant="h6">Tontines</Typography>
              <Typography variant="body2">Gérer vos tontines</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;