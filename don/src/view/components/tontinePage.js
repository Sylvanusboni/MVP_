import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogActions, DialogContent, DialogTitle, TextField, SpeedDial, SpeedDialAction } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PaidIcon from '@mui/icons-material/Paid';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const mockTontines = [
  { id: 1, montant: 500, date: '2025-01-01', nom: 'Tontine A', participants: ['Alice', 'Bob'] },
  { id: 2, montant: 700, date: '2025-01-10', nom: 'Tontine B', participants: ['Charlie', 'David'] },
  { id: 3, montant: 1000, date: '2025-01-15', nom: 'Tontine C', participants: ['Eva', 'Fay'] },
];

const TontineList = () => {
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openParticipantsDialog, setOpenParticipantsDialog] = useState(false);
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [paymentMontant, setPaymentMontant] = useState('');

  const handleOpenInviteDialog = () => setOpenInviteDialog(true);
  const handleCloseInviteDialog = () => setOpenInviteDialog(false);
  const handleOpenPaymentDialog = () => setOpenPaymentDialog(true);
  const handleClosePaymentDialog = () => setOpenPaymentDialog(false);
  const handleOpenParticipantsDialog = (tontine) => {
    setSelectedTontine(tontine);
    setOpenParticipantsDialog(true);

};
const handleCloseParticipantsDialog = () => {
  setOpenParticipantsDialog(false);
  setSelectedTontine(null);
};

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
          <TableCell>Nom</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {mockTontines.map((tontine) => (
          <TableRow key={tontine.id}>
            <TableCell>{tontine.id}</TableCell>
            <TableCell>{tontine.montant}</TableCell>
            <TableCell>{tontine.date}</TableCell>
            <TableCell>{tontine.nom}</TableCell>
            <TableCell>
              <Button
                onClick={() => handleOpenParticipantsDialog(tontine)}
                startIcon={<MoreHorizIcon />}
              >
                More
              </Button>
            </TableCell>
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
        tooltipTitle="Paiement Tontine"
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
      <DialogTitle>Payer Tontine</DialogTitle>
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

    {/* Participants Dialog */}
    <Dialog open={openParticipantsDialog} onClose={handleCloseParticipantsDialog}>
      <DialogTitle>Participants de {selectedTontine?.nom}</DialogTitle>
      <DialogContent>
        {selectedTontine && (
          <div>
            <ul>
              {selectedTontine.participants.map((participant, index) => (
                <li key={index}>{participant}</li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseParticipantsDialog}>Fermer</Button>
      </DialogActions>
    </Dialog>
  </>
);
};

export { TontineList };
