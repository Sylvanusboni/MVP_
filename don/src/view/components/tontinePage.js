// import React, { useState } from 'react';

// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Container,
//   CircularProgress
// } from '@mui/material';

// // Mock Data
// const mockTontines = [
//   { id: 1, name: "Tontine Alpha", members: 12, contributionAmount: 100, cycleDuration: 30, status: "active" },
//   { id: 2, name: "Tontine Beta", members: 20, contributionAmount: 150, cycleDuration: 45, status: "pending" },
//   { id: 3, name: "Tontine Gamma", members: 10, contributionAmount: 200, cycleDuration: 60, status: "completed" },
// ];

// const mockTontineDetails = {
//   1: { id: 1, name: "Tontine Alpha", members: ["Alice", "Bob", "Charlie"], totalMembers: 12, contributionAmount: 100, cycleDuration: 30, status: "active" },
//   2: { id: 2, name: "Tontine Beta", members: ["David", "Eva"], totalMembers: 20, contributionAmount: 150, cycleDuration: 45, status: "pending" },
//   3: { id: 3, name: "Tontine Gamma", members: ["Fay", "George"], totalMembers: 10, contributionAmount: 200, cycleDuration: 60, status: "completed" },
// };

// const TontineList = () => {
//   const [selectedTontine, setSelectedTontine] = useState(null);
//   const [openJoinDialog, setOpenJoinDialog] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);

//   const handleSelectTontine = (tontineId) => {
//     setSelectedTontine(mockTontineDetails[tontineId]);
//   };

//   const handleJoin = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLoading(false);
//       setOpenJoinDialog(false);
//       setSelectedTontine(null);
//       alert("You have successfully joined the tontine!");
//     }, 2000);
//   };

//   return (
//     <Container>
//       <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
//         <Typography variant="h4">Tontines</Typography>
//         <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
//           Create Tontine
//         </Button>
//       </Box>
//       {selectedTontine ? (
//         <Card sx={{ p: 3 }}>
//           <Typography variant="h5">{selectedTontine.name}</Typography>
//           <Typography variant="body1">Members: {selectedTontine.totalMembers}</Typography>
//           <Typography variant="body1">Contribution Amount: ${selectedTontine.contributionAmount}</Typography>
//           <Typography variant="body1">Cycle Duration: {selectedTontine.cycleDuration} days</Typography>
//           <Typography variant="body1">Status: {selectedTontine.status}</Typography>
//           <ul>
//             {selectedTontine.members.map((member, index) => (
//               <li key={index}>{member}</li>
//             ))}
//           </ul>
//           <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setSelectedTontine(null)}>
//             Close
//           </Button>
//           <Button variant="contained" color="primary" onClick={() => setOpenJoinDialog(true)}>
//             Join
//           </Button>
//         </Card>
//       ) : (
//         <Grid container spacing={3}>
//           {mockTontines.map((tontine) => (
//             <Grid item xs={12} sm={6} md={4} key={tontine.id}>
//               <Card sx={{ p: 2 }}>
//                 <CardContent>
//                   <Typography variant="h6">{tontine.name}</Typography>
//                   <Typography variant="body2">Members: {tontine.members}</Typography>
//                   <Typography variant="body2">Contribution: ${tontine.contributionAmount}</Typography>
//                   <Typography variant="body2">Cycle: {tontine.cycleDuration} days</Typography>
//                   <Typography variant="body2">Status: {tontine.status}</Typography>
//                   <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleSelectTontine(tontine.id)}>
//                     View
//                   </Button>
//                 </CardContent>
//               </Card>
//             </Grid>
//           ))}
//         </Grid>
//       )}

//       {/* Join Tontine Dialog */}
//       <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
//         <DialogTitle>Join {selectedTontine?.name}?</DialogTitle>
//         <DialogContent>
//           <Typography>Are you sure you want to join this tontine?</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
//           <Button onClick={handleJoin} variant="contained" color="primary">
//             {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Create Tontine Dialog */}
//       <Dialog open={open} onClose={() => setOpen(false)}>
//         <DialogTitle>Create a New Tontine</DialogTitle>
//         <DialogContent>
//           <Typography>Create tontine functionality coming soon!</Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Container>
//   );
// };

// export { TontineList };

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  getUserTontine,
  createTontine,
  startTontine,
  inviteMembers,
  getCycle,
  updateCycle,
  getMembers,
  payTontine,
  collectTontine,
} from "./services/tontineService";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { IconButton } from "@mui/material";

const API_BASE_URL = "http://localhost:8080/api/tontine";

export default function TontinePage() {
  const [tontines, setTontines] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
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

  useEffect(() => {
    loadTontines();
  }, []);

  const loadTontines = async () => {
    try {
      const data = await getUserTontine();
      console.log('data',data);
      setTontines(data.groups || []);
      setAdmins(data.admins || []);
    } catch (error) {
      console.error("Error loading Tontines:", error);
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

  // const handleInviteMembers = async () => {
  //   try {
  //     await inviteMembers(selectedTontine._id, members);
  //     setMembers([]);
  //     loadTontines();
  //   } catch (error) {
  //     console.error("Error inviting members:", error);
  //   }
  // };

  const handleInvite = async () => {
    console.log('Inviting members:', emailsToInvite);
    setOpenInviteDialog(true);
  
    // if (!selectedTontine || !selectedTontine._id) {
    //   console.error("No selected group or missing group ID:", selectedTontine);
    //   return;
    // }
  
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

  const handlePayTontine = async () => {
    try {
      await payTontine(selectedTontine._id, contributionAmount);
      setContributionAmount("");
      loadTontines();
    } catch (error) {
      console.error("Error paying into Tontine:", error);
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

                <Button variant="outlined" onClick={() => setSelectedTontine(tontine)} sx={{ mt: 1 }}>
                  View
                </Button>

                {admins.length > 0 ? (
                  <Button variant="contained" onClick={() => handleStartTontine(tontine._id)} sx={{ ml: 1, mt: 1 }}>
                    Start
                  </Button>
                ) : (
                  <Button variant="contained" onClick={() => payTontine(tontine._id)} sx={{ ml: 1, mt: 1 }}>
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
    </Container>
  );
}
