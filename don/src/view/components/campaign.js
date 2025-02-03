import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Container, Grid, Card, CardContent, CardMedia, Typography, Button,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, CircularProgress, Box, Tabs,Tab,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {CardHeader, CardActions, Collapse, Avatar, IconButton} from "@mui/material";
import { red } from "@mui/material/colors";
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const API_BASE_URL = "http://localhost:8080/api/campaign";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
}));

 function CampaignCard({ campaign, isTabOne}) {
  console.log('Campaign contributors:', campaign.contributors);
  const [expanded, setExpanded] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [open, setOpen] = useState(false);
  const [openDonate, setOpenDonate] = useState(false);
  const [amount, setAmount] = useState("");
  const user = localStorage.getItem("userId");
  const [loading, setLoading] = useState(false);
  const [openCollect, setOpenCollect] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountType, setAccountType] = useState("");

  const handleDonateClick = () => {
    setOpenDonate(true);
  };

  const handleShare = () => {
    // Generate the shareable link
    const link = `${window.location.origin}/donate/${campaign._id}`;
    setShareLink(link);
    setOpen(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    alert("Link copied to clipboard!");
  };
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCollectFunds = async () => {
    if (!accountNumber || !bankCode || !amount  || !accountType) {
      alert("Please provide all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/collect/?userId=${user}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          accountNumber,
          bankCode,
          amount,
          accountType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Funds collected successfully!");
        setOpenCollect(false);
      } else {
        alert(`Error: ${data.message || "Failed to collect funds"}`);
      }
    } catch (error) {
      console.error("Error collecting funds:", error);
      alert("An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }
  };

const handleDonate = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Send request to backend to initiate payment
      const response = await fetch(`${API_BASE_URL}/donate/?userId=${user}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: campaign._id,
          amount: amount,
        }),
      });
  
      const data = await response.json();
      localStorage.setItem('amount', data.amount);
      localStorage.setItem('transactionReference', data.transactionReference);

  
      if (response.ok) {
        setOpen(false);
        // Step 2: Redirect user to the payment page URL
        window.location.href = data.paymentUrl; // Redirect to payment gateway
      } else {
        alert(`Error: ${data.message || "Failed to initiate donation"}`);
      }
    } catch (error) {
      console.error("Error during donation initiation:", error);
      alert("An error occurred while processing your donation.");
    }
};

  // Function to format large numbers
  const formatNumber = (num) => {
    if (num == null) return "₦0"; // Handle null/undefined values
    
    if (num >= 1e12) return `₦${(num / 1e12).toFixed(2)}T`; // Trillions
    if (num >= 1e9) return `₦${(num / 1e9).toFixed(2)}B`;  // Billions
    if (num >= 1e6) return `₦${(num / 1e6).toFixed(2)}M`;  // Millions
    if (num >= 1e3) return `₦${(num / 1e3).toFixed(2)}K`;  // Thousands
  
    return `₦${num.toLocaleString()}`; // Default formatted number
  };  
  
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: red[500] }}>{campaign.createdBy?campaign.createdBy.name[0] : ""}</Avatar>}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={campaign.title}
        subheader={new Date(campaign.createdAt).toLocaleDateString()}
      />
      <CardMedia
        component="img"
        height="194"
        image={(campaign.images || []).length > 0 ? campaign.images[0] : "https://images.unsplash.com/photo-1471357674240-e1a485acb3e1"}
        alt={campaign.title}
        sx={{marginTop: 2, marginBottom: 2}}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {campaign.description}
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 1, marginBottom: 1 }}>
          Raised: {formatNumber(campaign.collectedAmount)} / {formatNumber(campaign.goalAmount)}
        </Typography>
      </CardContent>
      <CardActions disableSpacing>
        <Box sx={{ gap: 1, display: "flex", alignItems: "center" }}>
        <IconButton aria-label="add to favorites" onClick={handleDonateClick}>
          <VolunteerActivismIcon />
        </IconButton>
        <IconButton aria-label="share" onClick={handleShare}>
          <ShareIcon />
        </IconButton>
        {isTabOne && (
          <Button variant="contained" color="primary" onClick={() => setOpenCollect(true)}>
            Collect Funds
          </Button>
        )}
        </Box>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
        
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography sx={{ marginBottom: 2, marginTop: 2 }} variant="h6">
            Contributors:
          </Typography>
          {(campaign.contributors || []).length > 0 ? (
            campaign.contributors.map((contributor, index) => (
              <Typography key={index} variant="body2">
                {contributor.name} - {contributor.email}
              </Typography>
            ))
          ) : (
            <Typography variant="body2">No contributors yet.</Typography>
          )}
          <Typography sx={{ marginTop: 2 }} variant="h6">
            External Contributions:
          </Typography>
          {(campaign.externalContributions || []).length > 0 ? (
            campaign.externalContributions.map((external, index) => (
              <Typography key={index} variant="body2">
                {external.name} - {external.amount}
              </Typography>
            ))
          ) : (
            <Typography variant="body2">No external contributions.</Typography>
          )}
        </CardContent>
      </Collapse>
           {/* Share Dialog */}
           <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Share this Campaign</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={shareLink}
            variant="outlined"
            sx={{ mt: 2, mb: 2 }}
            InputProps={{
                readOnly: true,
                sx: { pr: 1 }, // Adds padding to prevent overlap
                endAdornment: (
                <IconButton onClick={handleCopy} edge="end">
                    <ContentCopyIcon />
                </IconButton>
                ),
            }}
            />
        </DialogContent>
      </Dialog>
      {/* Donate Dialog */}
      <Dialog open={openDonate} onClose={() => setOpenDonate(false)}>
        <DialogTitle>Donate to {campaign.title}</DialogTitle>
        <DialogContent>
            <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="dense"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenDonate(false)} color="secondary">
            Cancel
            </Button>
            <Button 
              onClick={handleDonate} 
              variant="contained" 
              color="primary" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="primary" /> : "Donate"}
            </Button>
        </DialogActions>
        </Dialog>
        {/* Collect Funds Dialog */}
      <Dialog open={openCollect} onClose={() => setOpenCollect(false)}>
        <DialogTitle>Collect Funds</DialogTitle>
        <DialogContent>
          <TextField
            label="Account Number"
            type="text"
            fullWidth
            margin="dense"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <TextField
            label="Bank Code"
            type="text"
            fullWidth
            margin="dense"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
          />
          <TextField
            label="Amount"
            type="number"
            fullWidth
            margin="dense"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <TextField
            label="Account Type"
            type="text"
            fullWidth
            margin="dense"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCollect(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCollectFunds} variant="contained" color="primary" disabled={loading}>
            {loading ? "Processing..." : "Collect"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [userCampaigns, setUserCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [newCampaign, setNewCampaign] = useState({
    title: "",
    description: "",
    goalAmount: "",
    images: [],
  });

  const user = localStorage.getItem("userId");

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE_URL);
      setCampaigns(res.data || []);
      console.log('All Campaigns',res.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserCampaigns = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/user/?userId=${user}`);
      setUserCampaigns(res.data || []);
      console.log('User Campaigns',res.data);
    } catch (error) {
      console.error("Error fetching user campaigns:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
    fetchUserCampaigns();
  }, [fetchCampaigns, fetchUserCampaigns]);

  const handleCreateCampaign = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/create/?userId=${user}`, {
        ...newCampaign,
      });

      setCampaigns((prev) => [...prev, res.data.data]);
      setUserCampaigns((prev) => [...prev, res.data.data]);
      setOpen(false);
      setNewCampaign({ title: "", description: "", goalAmount: "" });
    } catch (error) {
      console.error("Error creating campaign:", error);
    }
  };

  const isTabOne = tab === 1;
  const campaignsToDisplay = tab === 0 ? campaigns : userCampaigns;

  return (
    <Container>
      <Box sx={{ display: "flex", justifyContent: "space-between", my: 3 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Create Campaign
        </Button>
      </Box>

      <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="All Campaigns" />
        <Tab label="My Campaigns" />
      </Tabs>

      {loading ? (
      <Box display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
        ) : (campaignsToDisplay || []).length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 3 }}>
            No data available
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {(campaignsToDisplay || []).map((campaign) => (
              <Grid item xs={12} sm={6} md={4} key={campaign._id}>
                <CampaignCard campaign={campaign} isTabOne={isTabOne} />
              </Grid>
            ))}
          </Grid>
        )}

      {/* Create Campaign Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create a Campaign</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={newCampaign.title}
            onChange={(e) => setNewCampaign((prev) => ({ ...prev, title: e.target.value }))}
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            value={newCampaign.description}
            onChange={(e) => setNewCampaign((prev) => ({ ...prev, description: e.target.value }))}
          />
          <TextField
            label="Goal Amount"
            type="number"
            fullWidth
            margin="dense"
            value={newCampaign.goalAmount}
            onChange={(e) => setNewCampaign((prev) => ({ ...prev, goalAmount: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleCreateCampaign} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
