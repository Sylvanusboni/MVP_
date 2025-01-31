import React, { useState } from "react";
import {Menu, MenuItem, Button, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';

import Search from './Search';

const mockInvites = [
  { id: 1, groupName: "Group A" },
  { id: 2, groupName: "Group B" },
  { id: 3, groupName: "Group C" },
];

export default function Header() {

  const [anchorEl, setAnchorEl] = useState(null);
  const [invites, setInvites] = useState(mockInvites);

  const handleOpenMenu = (event) => {
    if (event.currentTarget) {
      setAnchorEl(event.currentTarget);
    }
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAcceptInvite = (id) => {
    console.log(`Accepted invite to group ${id}`);
    setInvites(invites.filter((invite) => invite.id !== id));
  };

  const handleDeclineInvite = (id) => {
    console.log(`Declined invite to group ${id}`);
    setInvites(invites.filter((invite) => invite.id !== id));
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
                <Typography variant="body1">{invite.groupName} invited you</Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <Button size="small" color="primary" onClick={() => handleAcceptInvite(invite.id)}>
                    Accept
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeclineInvite(invite.id)}>
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
