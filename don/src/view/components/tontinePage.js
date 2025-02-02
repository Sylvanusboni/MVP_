import React, { useEffect, useState } from "react";
import axios from "axios";
import {  Container, Typography, Button, Card, CardContent, Grid, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, List, ListItem, ListItemText,
} from "@mui/material";
import { getUserTontine, createTontine, startTontine, collectTontine, getCycle} from "./services/tontineService";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { IconButton } from "@mui/material";

const API_BASE_URL = "http://localhost:8080/api/tontine";

export default function TontinePage() {
  const [tontines, setTontines] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [selectedTontineView, setSelectedTontineView] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
   const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [emailsToInvite, setEmailsToInvite] = useState('');
  const [newTontine, setNewTontine] = useState({
    name: "",
    contributionAmount: 0,
    cycleDuration: 0,
    startDate: "",
  });
  // const [members, setMembers] = useState([]);
  const [contributionAmount, setContributionAmount] = useState("");
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  const fetchCycles = async (tontineId) => {
    try {
      const response = await getCycle(tontineId);
      setCycles(response.data);
    } catch (error) {
      console.error("Error fetching cycles:", error);
    }
  };


  useEffect(() => {
    loadTontines();
  }, []);

  const loadTontines = async () => {
    try {
      const data = await getUserTontine();
      console.log('data',data);
      setTontines(data.tontines  || []);
      setAdmins(data.admins || []);
    } catch (error) {
      console.error("Error loading Tontines:", error);
    }
  };

  const handlePayTontine = async () => {
    try {
      const user = localStorage.getItem("userId");
      if (!selectedCycleId) {
        throw new Error("No cycle selected for payment.");
      }
  
      const paymentResponse = await axios.post(`${API_BASE_URL}/pay/?userId=${user}`, {
        cycleId: selectedCycleId,
        amount: contributionAmount,
      });
  
      setOpenPaymentDialog(false);
      localStorage.setItem("amount", paymentResponse.data.amount);
      localStorage.setItem("transactionReference", paymentResponse.data.transactionReference);
  
      console.log("Payment successful:", paymentResponse.data);
      window.location.href = paymentResponse.data.paymentUrl;
    } catch (error) {
      console.error("Error processing payment:", error);
    }
  };
  
  const handleCreateTontine = async () => {
    try {
      await createTontine(newTontine);
      setOpenDialog(false);
      loadTontines();
    } catch (error) {
      console.error("Error creating Tontine:", error);
    }
  };

  const handleStartTontine = async (tontineId) => {
    try {
      await startTontine(tontineId);
      loadTontines();
    } catch (error) {
      console.error("Error starting Tontine:", error);
    }
  };

  const handleInvite = async () => {
    console.log('Inviting members:', emailsToInvite);
    setOpenInviteDialog(true);
  
    const emailsArray = emailsToInvite.split(',').map(email => email.trim());
    console.log('Emails Array:', emailsArray);
  
    try {
      console.log('Sending invitations...');
      setLoading(true);
      const userId = localStorage.getItem('userId');
  
      // Make sure the request is correct
      const response = await axios.post(`${API_BASE_URL}/invite/?userId=${userId}`, {
        groupId: selectedTontine,
        emails: emailsArray,
      });
  
      console.log('Invitations sent successfully!', response.data);
      
      setLoading(false);
      setOpenInviteDialog(false);
      alert('Invitations sent successfully!');
    } catch (error) {
      setLoading(false);
      console.error('Error sending invitations:', error);
      setError('Error sending invitations');
    }
  };


  const handleCollectTontine = async (tontineId) => {
    try {
      await collectTontine(tontineId);
      loadTontines();
    } catch (error) {
      console.error("Error collecting Tontine funds:", error);
    }
  };
  
  const handleViewClick = async (tontine) => {
    setSelectedTontineView(tontine);
    fetchCycles(tontine._id);
  };

  const handleClose = () => {
    setSelectedTontineView(null);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Tontine Management
      </Typography>

      <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mb: 2 }}>
        Create Tontine
      </Button>
       {/* Display Tontines Based on Role */}
       {tontines.length > 0 ? (
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Tontines You Are A Member Of
        </Typography>
      ) : admins.length > 0 ? (
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Tontines You Administer
        </Typography>
      ) : (
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          No Tontines Found
        </Typography>
      )}

      <Grid container spacing={3}>
        {(tontines.length > 0 ? tontines : admins).map((tontine) => (
          <Grid item xs={12} sm={6} md={4} key={tontine._id}>
            <Card>
              {/* Invite Icon Positioned at Top-Right */}
            <IconButton
              onClick={() => { setOpenInviteDialog(true); setSelectedTontine(tontine._id); }}
              sx={{ display: 'flex', top: 0, right: 8 }}
              color="primary"
            >
              <PersonAddIcon />
            </IconButton>
              <CardContent>
                <Typography variant="h6">{tontine.name}</Typography>
                <Typography variant="body2">
                  Contribution: ${tontine.contributionAmount}
                </Typography>
                <Typography variant="body2">
                  Cycle Duration: {tontine.cycleDuration} days
                </Typography>
                <Typography variant="body2">
                  Start Date: {new Date(tontine.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">Status: {tontine.status}</Typography>
                {admins.length > 0 && (
                  <Typography variant="body2">Total Collected: ${tontine.totalCollected}</Typography>
                )}

                <Button variant="outlined"  onClick={() => handleViewClick(tontine)} sx={{ mt: 1 }}>
                  View
                </Button>

                {admins.length > 0 ? (
                  <Button variant="contained" onClick={() => handleStartTontine(tontine._id)} sx={{ ml: 1, mt: 1 }}>
                    Start
                  </Button>
                ) : (
                  <Button 
                  variant="contained" 
                  onClick={() => { 
                    setSelectedTontine(tontine);
                    setOpenPaymentDialog(true);
                  }} 
                  sx={{ mt: 1 }}
                >
                  Pay Contribution
                </Button>
                )}

                {admins.length > 0 && (
                  <Button variant="contained" color="error" onClick={() => collectTontine(tontine._id)} sx={{ ml: 1, mt: 1 }}>
                    Collect Funds
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

       {/* Create Tontine Dialog */}
       <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create Tontine</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tontine Name"
            value={newTontine.name}
            onChange={(e) => setNewTontine({ ...newTontine, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contribution Amount"
            type="number"
            value={newTontine.contributionAmount}
            onChange={(e) => setNewTontine({ ...newTontine, contributionAmount: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Cycle Duration (days)"
            type="number"
            value={newTontine.cycleDuration}
            onChange={(e) => setNewTontine({ ...newTontine, cycleDuration: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={newTontine.startDate}
            onChange={(e) => setNewTontine({ ...newTontine, startDate: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTontine} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      {/* Invite Members Dialog */}
          <Dialog open={openInviteDialog} onClose={() => setOpenInviteDialog(false)}>
            <DialogTitle>Invite Members</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="Enter Emails (comma separated)"
                value={emailsToInvite}
                onChange={(e) => setEmailsToInvite(e.target.value)}
                // error={Boolean(error)}
                helperText={error || "Enter emails separated by commas"}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenInviteDialog(false)}>Close</Button>
              <Button onClick={handleInvite} variant="contained" color="primary" disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Invitations"}
              </Button>
            </DialogActions>
          </Dialog>
           {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Pay Contribution for Cycle</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Contribution Amount"
            type="number"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Cancel</Button>
          <Button onClick={handlePayTontine} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm Payment"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Tontine Dialog */}
      <Dialog open={Boolean(selectedTontineView)} onClose={handleClose} fullWidth maxWidth="sm">
        <Typography variant="h6" sx={{ marginTop: 2 }}>Cycles</Typography>
          <List>
            {cycles.map((cycle) => (
              <ListItem key={cycle._id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                <Typography variant="body1">
                  <strong>Cycle {cycle.cycleNumber}</strong> - Status: {cycle.status}
                </Typography>
                <Typography variant="body2">Due Date: {new Date(cycle.dueDate).toDateString()}</Typography>
                <Typography variant="body2">Collected Amount: {cycle.collectedAmount}</Typography>
                <Typography variant="body2">Collected: {cycle.collected ? "Yes" : "No"}</Typography>
                
                <Typography variant="body2" sx={{ marginTop: 1 }}>Members:</Typography>
                <List sx={{ paddingLeft: 2 }}>
                  {cycle.members.map((member) => (
                    <ListItem key={member._id}>
                      <ListItemText
                        primary={`${member.userId.name} (${member.userId.email})`}
                        secondary={`Paid: ${member.payed} - Remaining: ${member.rest}`}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button 
                  variant="contained" 
                  onClick={() => {
                    setSelectedCycleId(cycle._id);
                    setOpenPaymentDialog(true);
                  }}
                >
                  Pay for Cycle
                </Button>
              </ListItem>
            ))}
          </List>

      </Dialog>
    </Container>
  );
}
