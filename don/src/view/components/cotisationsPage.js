import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import axios to handle the HTTP request
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Grid, Card, CardContent, Container, CircularProgress, TextField} from '@mui/material';

// Updated Mock Data
// const mockGroups = [
//   { id: 1, name: "Groupe A", description: "Monthly savings group", admin: "Alice", frequency: "monthly", contributionAmount: 100, totalCollected: 1000, members: [{ userId: 1, status: "accepted" }, { userId: 2, status: "pending" }] },
//   { id: 2, name: "Groupe B", description: "Weekly investment club", admin: "Bob", frequency: "weekly", contributionAmount: 50, totalCollected: 500, members: [{ userId: 3, status: "accepted" }] },
//   { id: 3, name: "Groupe C", description: "Daily emergency fund", admin: "Charlie", frequency: "daily", contributionAmount: 10, totalCollected: 200, members: [{ userId: 4, status: "accepted" }, { userId: 5, status: "accepted" }] },
// ];

const API_BASE_URL = "http://localhost:8080/api/contribution";

const CotisationList = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailsToInvite, setEmailsToInvite] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: '',
    contributionAmount: '',
    admin: userId,  // Add userId here
  });  
 
  const fetchUserGroups = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, { params: { userId: userId } });
      setUserGroups(response.data);

    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }, []);

    useEffect(() => {
      fetchUserGroups();
    }, [ fetchUserGroups]);


    const handleSelectGroup = (groupId) => {
      if (!userGroups || !Array.isArray(userGroups.admins)) {
        console.error("userGroups.admins is not an array:", userGroups);
        return;
      }
    
      console.log("Searching for groupId:", groupId);
      console.log("Available groups:", userGroups.admins.map(group => group._id));
    
      const selected = userGroups.admins.find(group => String(group._id) === String(groupId));
    
      if (!selected) {
        console.warn("No group found with ID:", groupId);
        return;
      }
    
      setSelectedGroup(selected);
      console.log("Selected Group:", selected);
    };
    
    
    
  const handleInvite = async () => {
    console.log('Inviting members:', emailsToInvite);
    setOpenInviteDialog(true);
    const emailsArray = emailsToInvite.split(',').map(email => email.trim());
    console.log('Emails Array:', emailsArray);
    try {
      console.log('Sending invitations...');
      setLoading(true);
      await axios.post(`${API_BASE_URL}/invite`, { groupId: selectedGroup._id, emails: emailsArray });
      console.log('Invitations sent successfully!');
      setLoading(false);
      setOpenInviteDialog(false);
      alert('Invitations sent successfully!');
    } catch (error) {
      setLoading(false);
      setError('Error sending invitations');
    }
  };
  

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/create`, {
        ...formData,
      });
  
      setLoading(false);
      setOpen(false);
      alert(response.data.message);
      fetchUserGroups(); // Refresh list after creating
    } catch (error) {
      setLoading(false);
      alert('Error creating group');
    }
  };
  

  // Handle joining a group
  const handleJoin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpenJoinDialog(false);
      setSelectedGroup(null);
      alert("You have successfully joined the group!");
    }, 2000);
  };

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">Cotisation</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Create Cotisation Group
        </Button>
      </Box>
      {selectedGroup ? (
        <Card sx={{ p: 3 }}>
          <Typography variant="h5">{selectedGroup.name}</Typography>
          <Typography variant="body1">Description: {selectedGroup.description}</Typography>
          <Typography variant="body1">Admin ID: {selectedGroup.admin}</Typography>
          <Typography variant="body1">Frequency: {selectedGroup.frequency}</Typography>
          <Typography variant="body1">Contribution Amount: ${selectedGroup.contributionAmount}</Typography>
          <Typography variant="body1">Total Collected: ${selectedGroup.totalCollected}</Typography>
          <Typography variant="body2">Members:</Typography>
          <ul>
            {selectedGroup.members?.length > 0 ? (
              selectedGroup.members.map((member, index) => (
                <li key={index}>User {member.userId} - {member.status}</li>
              ))
            ) : (
              <Typography variant="body2">No members yet</Typography>
            )}
          </ul>
          <Button variant="outlined" sx={{ mr: 2 }} onClick={() => setSelectedGroup(null)}>
            Close
          </Button>
          <Button variant="contained" color="primary" onClick={() => setOpenJoinDialog(true)}>
            Join
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {(userGroups.admins?.length > 0 ? userGroups.admins : []).map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group._id}>
              <Card sx={{ p: 2 }}>
                <CardContent>
                  <Typography variant="h6">{group.name}</Typography>
                  <Typography variant="body2">Members: {group.members?.length || 0}</Typography>
                  <Typography variant="body2">Frequency: {group.frequency}</Typography>
                  <Typography variant="body2">Contribution: ${group.contributionAmount}</Typography>
                  <Button variant="outlined" sx={{ mt: 1, mr: 1 }} onClick={handleInvite}>
                    Invite
                  </Button>
                  <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleSelectGroup(group._id)}>
                    View
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Join Group Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
        <DialogTitle>Join {selectedGroup?.name}?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to join this group?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Cancel</Button>
          <Button onClick={handleJoin} variant="contained" color="primary">
            {loading ? <CircularProgress size={24} color="inherit" /> : "Confirm"}
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

      {/* Create Group Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogContent>
          <TextField
            label="Group Name"
            fullWidth
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Frequency"
            fullWidth
            name="frequency"
            value={formData.frequency}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Contribution Amount"
            fullWidth
            type="number"
            name="contributionAmount"
            value={formData.contributionAmount}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={handleCreateGroup} variant="contained" color="primary">
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Group"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export { CotisationList };
