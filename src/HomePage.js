import React, { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { toggleDarkMode } from './utils';
import Cookies from 'universal-cookie';
import { Menu, MenuItem, IconButton, CircularProgress } from '@mui/material'; // Import Menu and MenuItem
import axios from 'axios';
import LoginPage from './LoginPage';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import {
  InteractionRequiredAuthError,
  InteractionStatus,
} from '@azure/msal-browser';
import DarkModeSwitch from './DarkModeSwitch';
import { Garage, Warning } from '@mui/icons-material';

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

const isDev = process.env.NODE_ENV === 'development';

const HomePage = () => {
  const classes = useStyles();
  const [darkMode, setDarkMode] = useState(null);
  const [token, setToken] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for managing Menu
  const [anchorEl, setAnchorEl] = useState(null);

  const { instance, accounts, inProgress } = useMsal();

  const isAuthed = useIsAuthenticated();

  useEffect(() => {
    const darkModeCookie = cookies.get('darkMode');
    if (darkModeCookie === false) {
      setDarkMode(false);
    } else {
      setDarkMode(true);
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
          console.log('Silent token acquisition successful');
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
    setLoading(true);
    const functionAppUrl = isDev
      ? 'http://localhost:7071'
      : 'https://garagepi-func.azurewebsites.net';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(`${functionAppUrl}/api/toggle`, { headers })
      .then((response) => {
        console.log(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
        setShowError(true); // Show error message
        setTimeout(() => {
          setShowError(false); // Hide error message after 3 seconds
        }, 3000);
      });
  };

  const handleLogout = async () => {
    const currentAccount = instance.getActiveAccount();
    console.log(currentAccount);
    // logout
    const logoutHint = currentAccount.idTokenClaims.login_hint;
    await instance.logoutRedirect({ logoutHint: logoutHint });
  };

  // Function to open Menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close Menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // const handleOldLogout = async () => {
  //   // Check if there is an active account
  //   const activeAccount = instance.getActiveAccount();
  //   if (activeAccount) {
  //     // Clear tokens from local storage based on the cache location
  //     const cacheLocation = activeAccount.tokenCache.cacheLocation;
  //     localStorage.removeItem(`msal.idtoken.${cacheLocation}`);
  //     localStorage.removeItem(`msal.accessToken.${cacheLocation}`);
  //   }
  //   await instance.logoutRedirect(config);
  // };

  return (
    <div>
      {/* Dark Mode Toggle and Logout */}
      <div className={classes.settingsContainer}>
        <DarkModeSwitch
          sx={{ m: 1 }}
          checked={darkMode}
          onChange={handleDarkModeToggle}
        />
        <SettingsIcon onClick={handleMenuOpen} />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem disabled={!isAuthed} onClick={handleLogout}>
            Logout
          </MenuItem>
          {/* <MenuItem onClick={handleOldLogout}>Old Logout</MenuItem> */}
        </Menu>
        {!viewOnly && !isAuthed && <LoginPage setViewOnly={setViewOnly} />}
      </div>

      {/* Open and Close Buttons */}
      <div className={classes.centerContainer}>
        {viewOnly && (
          <h1 style={{ color: 'white' }}>You are in View Only Mode</h1>
        )}
        <IconButton
          sx={{ backgroundColor: showError ? 'red' : 'primary' }}
          onClick={handleAction}
          disableFocusRipple
        >
          {showError ? ( // Conditional rendering for the button
            <Warning /> // Show warning icon in red
          ) : loading ? (
            <CircularProgress color="inherit" />
          ) : (
            <Garage />
          )}
        </IconButton>
      </div>
    </div>
  );
};

export default HomePage;
