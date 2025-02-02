import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Grid, Card, CardContent, Container, CircularProgress, TextField} from '@mui/material';

const API_BASE_URL = "http://localhost:8080/api/contribution";

const CotisationList = () => {
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedTontine, setSelectedTontine] = useState(null);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [emailsToInvite, setEmailsToInvite] = useState('');
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');
  const [isAdmin1, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); 

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: '',
    contributionAmount: '',
    admin: userId,
  });  
 
  const fetchUserGroups = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, { params: { userId: userId } });
      setUserGroups(response.data);
      console.log('Fetched user groups:', response.data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }, []);

    useEffect(() => {
      fetchUserGroups();
    }, [ fetchUserGroups]);

    const handleSelectGroup = (groupId, num) => {
      if (!userGroups) {
        console.error("userGroups is undefined");
        return;
      }
    
      // Ensure groups and admins are arrays before accessing them
      const groupsArray = Array.isArray(userGroups.groups) ? userGroups.groups : [];
      const adminsArray = Array.isArray(userGroups.admins) ? userGroups.admins : [];
    
      console.log("Searching for groupId:", groupId);
      console.log("Available groups:", groupsArray.map(group => group._id));
      console.log("Available admins:", adminsArray.map(admin => admin._id));
    
      // Search in both groups and admins
      const selected = [...groupsArray, ...adminsArray].find(group => String(group._id) === String(groupId));
    
      if (!selected) {
        console.warn("No group found with ID:", groupId);
        return;
      }

      // Check if the user is an admin or a member
      setIsAdmin(adminsArray.some(admin => admin._id === groupId));
      setIsMember(groupsArray.some(group => group._id === groupId));

      if (num === 2) setOpenDialog(true); 
      setSelectedGroup(selected);
      console.log("Selected Group:", selected);
    };
    
    // Determine if the current user is an admin for the selected group 
    const isAdmin = (group) => {
      console.log('Checking if user is admin:', group.admin._id, userGroups.userId);
      return group.admin._id === userGroups.userId;
    };
      
    const handleInvite = async () => {
      console.log('Inviting members:', emailsToInvite);
      setOpenInviteDialog(true);
    
      if (!selectedGroup || !selectedGroup._id) {
        console.error("No selected group or missing group ID:", selectedGroup);
        return;
      }
    
      const emailsArray = emailsToInvite.split(',').map(email => email.trim());
      console.log('Emails Array:', emailsArray);
    
      try {
        console.log('Sending invitations...');
        setLoading(true);
    
        // Make sure the request is correct
        const response = await axios.post(`${API_BASE_URL}/invite`, {
          groupId: selectedGroup._id,
          emails: emailsArray,
          userId: userId,
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

  const handlePayCotisation = async () => {
    const userId = localStorage.getItem("userId");
  
    if (!selectedGroup || !selectedGroup._id) {
      console.error("No group selected");
      return;
    }
  
    const amount = selectedGroup.contributionAmount; // Ensure amount is correct
  
    console.log("Processing payment for cotisation...");
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/pay/?userId=${userId}`,
        {
          amount,
          groupId: selectedGroup._id,
        }
      );
  
      console.log("Payment Response:", response.data);
      localStorage.setItem("amount", response.data.amount);
      localStorage.setItem("transactionReference", response.data.transactionReference);
  
      // If Interswitch returns a payment URL, redirect the user
      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl; // Redirect to payment gateway
      } else {
        alert("Payment initiated successfully!");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to process payment. Please try again.");
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
     
      <Grid container spacing={3}>
        {/* Display groups where the user is a member */}
        {(userGroups.groups?.length > 0 ? userGroups.groups : []).map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group._id}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2">Members: {group.members?.length || 0}</Typography>
                <Typography variant="body2">Frequency: {group.frequency}</Typography>
                <Typography variant="body2">Contribution: ${group.contributionAmount}</Typography>

                <Typography variant="body2" color="textSecondary">
                  You are a Member
                </Typography>

                <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleSelectGroup(group._id, 2)}>
                  View
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Display groups where the user is an admin */}
        {(userGroups.admins?.length > 0 ? userGroups.admins : []).map((group) => (
          <Grid item xs={12} sm={6} md={4} key={group._id}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6">{group.name}</Typography>
                <Typography variant="body2">Members: {group.members?.length || 0}</Typography>
                <Typography variant="body2">Frequency: {group.frequency}</Typography>
                <Typography variant="body2">Contribution: ${group.contributionAmount}</Typography>

                <Typography variant="body2" color="primary">
                  You are an Admin
                </Typography>

                <Button
                  variant="outlined"
                  sx={{ mt: 1, mr: 1 }}
                  onClick={() => {
                    handleSelectGroup(group._id, 1);
                    setTimeout(() => handleInvite(group._id), 100);
                  }}
                >
                  Invite
                </Button>

                <Button variant="contained" sx={{ mt: 1 }} onClick={() => handleSelectGroup(group._id, 2)}>
                  View
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>



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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
    <DialogTitle>{selectedGroup?.name}</DialogTitle>
    <DialogContent>
      <Typography variant="body1">Description: {selectedGroup?.description}</Typography>
      <Typography variant="body1">Frequency: {selectedGroup?.frequency}</Typography>
      <Typography variant="body1">Contribution Amount: ${selectedGroup?.contributionAmount}</Typography>
      <Typography variant="body1">Total Collected: ${selectedGroup?.totalCollected}</Typography>

      {isAdmin && (
        <Typography variant="body2" color="primary">
          You are an Admin of this group.
        </Typography>
      )}

      {isMember && (
        <Typography variant="body2" color="secondary">
          You are a Member of this group.
        </Typography>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={() => setOpenDialog(false)} color="primary">
        Close
      </Button>
      {isMember && (
        <Button onClick={handlePayCotisation} color="success" variant="contained">
          Pay Cotisation
        </Button>
      )}
    </DialogActions>
  </Dialog>
    </Container>
  );
};

export { CotisationList };
