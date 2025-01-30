import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Home', icon: <HomeRoundedIcon />, route: '/dashboard' },
  { text: 'Dons', icon: <AnalyticsRoundedIcon />, route: '/dons' },
  { text: 'Cotisations', icon: <PeopleRoundedIcon />, route: '/cotisations' },
  { text: 'Tontines', icon: <AssignmentRoundedIcon />, route: '/tontines' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, route: '/settings' },
  { text: 'About', icon: <InfoRoundedIcon />, route: '/about' },
  { text: 'Transactions', icon: <HelpRoundedIcon />, route: '/transactions' },
];

export default function MenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const getIndex = () => {
    switch (location.pathname) {
      case '/dons':
        return 1;
      case '/cotisations':
        return 2;
      case '/tontines':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block', marginBottom: 1 }}>
            <ListItemButton selected={index === getIndex()}  onClick={() => navigate(item.route)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <List dense>
        {secondaryListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: 'block' }}>
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}
