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
  const [distanceConfirmation, setDistanceConfirmation] = useState(false);
  const [farAway, setFarAway] = useState(false);

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
    const isTokenExpired = (token) => {
      const expiration = jwtDecode(token).exp;
      const currentTime = Date.now() / 1000;
      return expiration < currentTime;
    };

    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      if (!token || isTokenExpired(token)) {
        instance
          .acquireTokenSilent({
            // Adjust scopes and account parameters as needed
            roles: ['toggle'],
            account: accounts[0],
          })
          .then((accessTokenResponse) => {
            const newToken = accessTokenResponse.idToken;
            setToken(newToken);
          })
          .catch((error) => {
            if (error instanceof InteractionRequiredAuthError) {
              console.log('Interaction Required Error');
              instance
                .acquireTokenRedirect({
                  scopes: ['your_scope'],
                  account: accounts[0],
                })
                .then((accessTokenResponse) => {
                  const newToken = accessTokenResponse.idToken;
                  setToken(newToken);
                })
                .catch((error) => {
                  console.error('Error acquiring token interactively:', error);
                });
            } else {
              console.error('Error acquiring token silently:', error);
            }
          });
      }
    }
  }, [accounts, token, instance, inProgress]);

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    toggleDarkMode(newDarkMode);
    window.location.reload();
  };

  function getCurrentPosition() {
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
    });
  }

  const handleAction = async () => {
    setLoading(true);
    const functionAppUrl = isDev
      ? 'http://localhost:7071'
      : 'https://garagepi-func.azurewebsites.net';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      locations: await getCurrentPosition(),
      distanceConfirmation: distanceConfirmation,
    };

    axios
      .get(`${functionAppUrl}/api/toggle`, { headers })
      .then((response) => {
        console.log(response.data);
        setLoading(false);
        if (response.data.distanceWarning === true) {
          setFarAway(true);
        }
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
