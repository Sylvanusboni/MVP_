// import React, { useState } from 'react';
// import { Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, TextField, SpeedDial, SpeedDialAction } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
// import PaidIcon from '@mui/icons-material/Paid';
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// const mockTontines = [
//   { id: 1, montant: 500, date: '2025-01-01', nom: 'Tontine A', participants: ['Alice', 'Bob'] },
//   { id: 2, montant: 700, date: '2025-01-10', nom: 'Tontine B', participants: ['Charlie', 'David'] },
//   { id: 3, montant: 1000, date: '2025-01-15', nom: 'Tontine C', participants: ['Eva', 'Fay'] },
// ];

// const TontineList = () => {
//   const [openInviteDialog, setOpenInviteDialog] = useState(false);
//   const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
//   const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
//   const [selectedTontine, setSelectedTontine] = useState(null);
//   const [inviteEmail, setInviteEmail] = useState('');
//   const [paymentMontant, setPaymentMontant] = useState('');

//   const handleOpenInviteDialog = () => setOpenInviteDialog(true);
//   const handleCloseInviteDialog = () => setOpenInviteDialog(false);
//   const handleOpenPaymentDialog = () => setOpenPaymentDialog(true);
//   const handleClosePaymentDialog = () => setOpenPaymentDialog(false);
//   const handleOpenParticipantsDialog = (tontine) => {
//     setSelectedTontine(tontine);
//     setOpenParticipantsDialog(true);

// };
// const handleCloseParticipantsDialog = () => {
//   setOpenParticipantsDialog(false);
//   setSelectedTontine(null);
// };

// const handleInviteSubmit = (e) => {
//   e.preventDefault();
//   // Handle invitation logic
//   console.log('Invite:', inviteEmail);
//   setOpenInviteDialog(false);
// };

// const handlePaymentSubmit = (e) => {
//   e.preventDefault();
//   // Handle payment logic
//   console.log('Payment Montant:', paymentMontant);
//   setOpenPaymentDialog(false);
// };

// return (
//   <>
//     <Table>
//       <TableHead>
//         <TableRow>
//           <TableCell>ID</TableCell>
//           <TableCell>Montant</TableCell>
//           <TableCell>Date</TableCell>
//           <TableCell>Nom</TableCell>
//           <TableCell>Actions</TableCell>
//         </TableRow>
//       </TableHead>
//       <TableBody>
//         {mockTontines.map((tontine) => (
//           <TableRow key={tontine.id}>
//             <TableCell>{tontine.id}</TableCell>
//             <TableCell>{tontine.montant}</TableCell>
//             <TableCell>{tontine.date}</TableCell>
//             <TableCell>{tontine.nom}</TableCell>
//             <TableCell>
//               <Button
//                 onClick={() => handleOpenParticipantsDialog(tontine)}
//                 startIcon={<MoreHorizIcon />}
//               >
//                 More
//               </Button>
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>

//     <SpeedDial
//       ariaLabel="SpeedDial"
//       icon={<AddIcon />}
//       direction="left"
//       style={{ position: 'fixed', bottom: 16, right: 16 }}
//     >
//       <SpeedDialAction
//         icon={<PersonAddAlt1Icon />}
//         tooltipTitle="Inviter Membre"
//         onClick={handleOpenInviteDialog}
//       />
//       <SpeedDialAction
//         icon={<PaidIcon />}
//         tooltipTitle="Paiement Tontine"
//         onClick={handleOpenPaymentDialog}
//       />
//     </SpeedDial>

//     {/* Invite Member Dialog */}
//     <Dialog open={openInviteDialog} onClose={handleCloseInviteDialog}>
//       <DialogTitle>Inviter un Membre</DialogTitle>
//       <DialogContent>
//         <form onSubmit={handleInviteSubmit}>
//           <TextField
//             label="Email"
//             variant="outlined"
//             fullWidth
//             value={inviteEmail}
//             onChange={(e) => setInviteEmail(e.target.value)}
//             required
//           />
//           <DialogActions>
//             <Button onClick={handleCloseInviteDialog}>Annuler</Button>
//             <Button type="submit">Inviter</Button>
//           </DialogActions>
//         </form>
//       </DialogContent>
//     </Dialog>

//     {/* Cotisation Payment Dialog */}
//     <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
//       <DialogTitle>Payer Tontine</DialogTitle>
//       <DialogContent>
//         <form onSubmit={handlePaymentSubmit}>
//           <TextField
//             label="Montant"
//             variant="outlined"
//             fullWidth
//             value={paymentMontant}
//             onChange={(e) => setPaymentMontant(e.target.value)}
//             required
//           />
//           <DialogActions>
//             <Button onClick={handleClosePaymentDialog}>Annuler</Button>
//             <Button type="submit">Payer</Button>
//           </DialogActions>
//         </form>
//       </DialogContent>
//     </Dialog>

//     {/* Participants Dialog */}
//     <Dialog open={openParticipantsDialog} onClose={handleCloseParticipantsDialog}>
//       <DialogTitle>Participants de {selectedTontine?.nom}</DialogTitle>
//       <DialogContent>
//         {selectedTontine && (
//           <div>
//             <ul>
//               {selectedTontine.participants.map((participant, index) => (
//                 <li key={index}>{participant}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handleCloseParticipantsDialog}>Fermer</Button>
//       </DialogActions>
//     </Dialog>
//   </>
// );
// };

// export { TontineList };
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Grid,
  Card,
  CardContent,
  Container,
  CircularProgress
} from '@mui/material';

// Mock Data
const mockTontines = [
  { id: 1, name: "Tontine Alpha", members: 12, contributionAmount: 100, cycleDuration: 30, status: "active" },
  { id: 2, name: "Tontine Beta", members: 20, contributionAmount: 150, cycleDuration: 45, status: "pending" },
  { id: 3, name: "Tontine Gamma", members: 10, contributionAmount: 200, cycleDuration: 60, status: "completed" },
];

const mockTontineDetails = {
  1: { id: 1, name: "Tontine Alpha", members: ["Alice", "Bob", "Charlie"], totalMembers: 12, contributionAmount: 100, cycleDuration: 30, status: "active" },
  2: { id: 2, name: "Tontine Beta", members: ["David", "Eva"], totalMembers: 20, contributionAmount: 150, cycleDuration: 45, status: "pending" },
  3: { id: 3, name: "Tontine Gamma", members: ["Fay", "George"], totalMembers: 10, contributionAmount: 200, cycleDuration: 60, status: "completed" },
};

const TontineList = () => {
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSelectTontine = (tontineId) => {
    setSelectedTontine(mockTontineDetails[tontineId]);
  };

  const handleJoin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpenJoinDialog(false);
      setSelectedTontine(null);
      alert("You have successfully joined the tontine!");
    }, 2000);
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">Tontines</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Create Tontine
        </Button>
      </Box>
      {selectedTontine ? (
        <Card sx={{ p: 3 }}>
          <Typography variant="h5">{selectedTontine.name}</Typography>
          <Typography variant="body1">Members: {selectedTontine.totalMembers}</Typography>
          <Typography variant="body1">Contribution Amount: ${selectedTontine.contributionAmount}</Typography>
          <Typography variant="body1">Cycle Duration: {selectedTontine.cycleDuration} days</Typography>
          <Typography variant="body1">Status: {selectedTontine.status}</Typography>
          <ul>
            {selectedTontine.members.map((member, index) => (
              <li key={index}>{member}</li>
            ))}
          </ul>
          <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setSelectedTontine(null)}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenJoinDialog(true)}>
            Join
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {mockTontines.map((tontine) => (
            <Grid item xs={12} sm={6} md={4} key={tontine.id}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6">{tontine.name}</Typography>
                  <Typography variant="body2">Members: {tontine.members}</Typography>
                  <Typography variant="body2">Contribution: ${tontine.contributionAmount}</Typography>
                  <Typography variant="body2">Cycle: {tontine.cycleDuration} days</Typography>
                  <Typography variant="body2">Status: {tontine.status}</Typography>
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleSelectTontine(tontine.id)}>
                    View
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Tontine Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
        <DialogTitle>Join {selectedTontine?.name}?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to join this tontine?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoin} variant="contained" color="primary">
            {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Tontine Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create a New Tontine</DialogTitle>
        <DialogContent>
          <Typography>Create tontine functionality coming soon!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export { TontineList };