import React, { useState, useEffect } from "react";
import { Menu, MenuItem, Button, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import axios from 'axios';
import Search from './Search';

const API_BASE_URL = "http://localhost:8080/api/invitation";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [invites, setInvites] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/?userId=${userId}`);
        setInvites(response.data);
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    };

    if (userId) {
      fetchInvites();
    }
  }, [userId]);

  const handleOpenMenu = (event) => {
    if (event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAcceptInvite = async (id) => {
    console.log(`Accepting invite to group ${id}`);
    try {
      await axios.post(`${API_BASE_URL}/reply`, {
        invitationId: id,
        status: 'accepted',
      });
      setInvites(invites.filter((invite) => invite.id !== id));
      console.log(`Accepted invite to group ${id}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleDeclineInvite = async (id) => {
    console.log(`Declining invite to group ${id}`);
    try {
      await axios.post(`${API_BASE_URL}/reply`, {
        invitationId: id,
        status: 'declined',
      });
      setInvites(invites.filter((invite) => invite.id !== id));
      console.log(`Declined invite to group ${id}`);
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: '100%',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        pt: 1.5,
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        <Search />
        <CustomDatePicker />
        <MenuButton showBadge onClick={handleOpenMenu} aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
      {/* Notifications Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {invites.length > 0 ? (
          invites.map((invite) => (
            <MenuItem key={invite.id}>
              <Stack direction="column">
                <Typography variant="body1">{invite.invitedBy.name} invited you to join {invite.groupId.name}</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" color="primary" onClick={() => handleAcceptInvite(invite._id)}>
                    Accept
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeclineInvite(invite._id)}>
                    Decline
                  </Button>
                </Stack>
              </Stack>
            </MenuItem>
          ))
        ) : (
          <MenuItem>
            <Typography variant="body2" color="textSecondary">
              No new invites
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
}

