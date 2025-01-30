import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Dialog, DialogActions, DialogContent, DialogTitle, SpeedDial, SpeedDialAction } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import PaidIcon from '@mui/icons-material/Paid';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
const mockCotisations = [
  { id: 1, montant: 20, date: '2025-01-05', membre: 'David', statut: 'Payée' },
  { id: 2, montant: 30, date: '2025-01-08', membre: 'Eva', statut: 'En attente' },
  { id: 3, montant: 40, date: '2025-01-11', membre: 'Fay', statut: 'Payée' },
];

const CotisationList = () => {
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [paymentMontant, setPaymentMontant] = useState('');

  const handleOpenInviteDialog = () => setOpenInviteDialog(true);
  const handleCloseInviteDialog = () => setOpenInviteDialog(false);
  const handleOpenPaymentDialog = () => setOpenPaymentDialog(true);
  const handleClosePaymentDialog = () => setOpenPaymentDialog(false);

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    // Handle invitation logic
    console.log('Invite:', inviteEmail);
    setOpenInviteDialog(false);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // Handle payment logic
    console.log('Payment Montant:', paymentMontant);
    setOpenPaymentDialog(false);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Montant</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Membre</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockCotisations.map((don) => (
            <TableRow key={don.id}>
              <TableCell>{don.id}</TableCell>
              <TableCell>{don.montant}</TableCell>
              <TableCell>{don.date}</TableCell>
              <TableCell>{don.membre}</TableCell>
              <TableCell>{don.statut}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SpeedDial
        ariaLabel="SpeedDial"
        icon={<AddIcon />}
        direction="left"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <SpeedDialAction
          icon={<PersonAddAlt1Icon />}
          tooltipTitle="Inviter Membre"
          onClick={handleOpenInviteDialog}
        />
        <SpeedDialAction
          icon={<PaidIcon />}
          tooltipTitle="Paiement Cotisation"
          onClick={handleOpenPaymentDialog}
        />
      </SpeedDial>

      {/* Invite Member Dialog */}
      <Dialog open={openInviteDialog} onClose={handleCloseInviteDialog}>
        <DialogTitle>Inviter un Membre</DialogTitle>
        <DialogContent>
          <form onSubmit={handleInviteSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <DialogActions>
              <Button onClick={handleCloseInviteDialog}>Annuler</Button>
              <Button type="submit">Inviter</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cotisation Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog}>
        <DialogTitle>Payer Cotisation</DialogTitle>
        <DialogContent>
          <form onSubmit={handlePaymentSubmit}>
            <TextField
              label="Montant"
              variant="outlined"
              fullWidth
              value={paymentMontant}
              onChange={(e) => setPaymentMontant(e.target.value)}
              required
            />
            <DialogActions>
              <Button onClick={handleClosePaymentDialog}>Annuler</Button>
              <Button type="submit">Payer</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { CotisationList };
