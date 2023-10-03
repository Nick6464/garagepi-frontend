import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { toggleDarkMode } from './utils';
import Cookies from 'universal-cookie';
import { Switch, Menu, MenuItem, Modal, Box } from '@mui/material'; // Import Menu and MenuItem
import axios from 'axios';
import LoginPage from './LoginPage';
import { UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import {
  InteractionRequiredAuthError,
  InteractionStatus,
} from '@azure/msal-browser';

const useStyles = makeStyles((theme) => ({
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  settingsContainer: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    alignItems: 'center',
  },
}));

const cookies = new Cookies();

const HomePage = () => {
  const classes = useStyles();
  const [darkMode, setDarkMode] = useState(null);
  const [token, setToken] = useState(null);

  // State for managing Menu
  const [anchorEl, setAnchorEl] = useState(null);

  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    const darkModeCookie = cookies.get('darkMode');
    if (darkModeCookie === 'true') {
      setDarkMode(true);
    } else if (darkModeCookie === 'false') {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      const accessTokenRequest = {
        roles: ['toggle'],
        account: accounts[0],
      };
      instance
        .acquireTokenSilent(accessTokenRequest)
        .then((accessTokenResponse) => {
          // Acquire token success
          let idToken = accessTokenResponse.idToken;
          setToken(idToken);
        })
        .catch((error) => {
          //Acquire token silent failure, and send an interactive request
          if (error instanceof InteractionRequiredAuthError) {
            instance
              .acquireTokenRedirect()
              .then((accessTokenResponse) => {
                // Acquire token interactive success
                let idToken = accessTokenResponse.idToken;
                setToken(idToken);
              })
              .catch((error) => {
                // Acquire token interactive failure
                console.error(error);
              });
          }
        });
    }
  }, [accounts, instance, inProgress]);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    toggleDarkMode(newDarkMode);
    window.location.reload();
  };

  const handleAction = () => {
    const functionAppUrl = 'http://localhost:7071';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(`${functionAppUrl}/api/toggle`, { headers })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleLogout = async () => {
    console.log('HomePage.js: handleLogout', accounts);

    const logoutRequest = {
      account: accounts[0].homeAccountId,
      postLogoutRedirectUri: '/', //your_app_logout_redirect_uri
    };
    instance.logoutRedirect(logoutRequest);
    window.location.reload();
  };

  // Function to open Menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close Menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  console.log(window);

  return (
    <div>
      {/* Dark Mode Toggle and Logout */}
      <div className={classes.settingsContainer}>
        <Switch
          checked={cookies.get('darkMode')}
          onChange={handleDarkModeToggle}
          color="primary"
        />
        <SettingsIcon onClick={handleMenuOpen} /> {/* Open Menu on click */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {/* Add a MenuItem for Logout */}
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
        {console.log('HomePage.js: Instance', instance)}
        <UnauthenticatedTemplate>
          <Modal
            onClose={handleMenuClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            open={true}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
              }}
            >
              <LoginPage />
            </Box>
          </Modal>
        </UnauthenticatedTemplate>
      </div>

      {/* Open and Close Buttons */}
      <div className={classes.centerContainer}>
        <Button variant="contained" color="primary" onClick={handleAction}>
          Toggle
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
