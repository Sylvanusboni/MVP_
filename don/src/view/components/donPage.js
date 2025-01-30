import React, { useState } from 'react';
import { Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

// Mock data
const mockDons = [
  { id: 1, montant: 50, date: '2025-01-10', donateur: 'Alice' },
  { id: 2, montant: 100, date: '2025-01-12', donateur: 'Bob' },
  { id: 3, montant: 200, date: '2025-01-15', donateur: 'Charlie' },
];


const DonList = () => {
  const [selectedDon, setSelectedDon] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);

  const handleOpenDetails = (don) => {
    setSelectedDon(don);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedDon(null);
  };

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Montant</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Donateur</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockDons.map((don) => (
            <TableRow key={don.id}>
              <TableCell>{don.id}</TableCell>
              <TableCell>{don.montant}</TableCell>
              <TableCell>{don.date}</TableCell>
              <TableCell>{don.donateur}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenDetails(don)}>Voir Détails</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDetails} onClose={handleCloseDetails} fullWidth={"sm"}
        maxWidth={"sm"}>
      <DialogTitle sx={{textAlign:"center"}}>Don details</DialogTitle>
      <DialogContent>
        <div>
          {selectedDon && (
            <>
              <h2>Détails du Don</h2>
              <p>ID: {selectedDon.id}</p>
              <p>Montant: {selectedDon.montant}</p>
              <p>Date: {selectedDon.date}</p>
              <p>Donateur: {selectedDon.donateur}</p>
            </>
          )}
        </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonList;
