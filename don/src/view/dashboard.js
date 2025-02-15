import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import AppTheme from '../shared-theme/AppTheme';
import { CotisationList } from './components/cotisationsPage';
import TontinePage from './components/TontinePage'
// import DonList  from './components/donPage';
import CampaignPage from './components/campaign';
import TransactionTable from './Transactions';

import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const location = useLocation();

  // Map paths to components
  const getComponent = () => {
    switch (location.pathname) {
      case '/dons':
        return <CampaignPage />;
      case '/cotisations':
        return <CotisationList />;
      case '/tontines':
        return <TontinePage />;
      case '/transactions':
        return <TransactionTable />;
      default:
        return <MainGrid />;
    }
  };
  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu />
        <AppNavbar />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {getComponent()}
            {/* <MainGrid /> */}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
