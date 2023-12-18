import React, { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { toggleDarkMode } from './utils';
import Cookies from 'universal-cookie';
import {
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Dialog,
  Snackbar,
  Button,
} from '@mui/material'; // Import Menu and MenuItem
import axios from 'axios';
import LoginPage from './LoginPage';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import DarkModeSwitch from './DarkModeSwitch';
import { Garage, Warning } from '@mui/icons-material';
import { jwtDecode } from 'jwt-decode';

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

const isDev =
  process.env.NODE_ENV === 'development' ||
  window.location.href ===
    'https://witty-rock-0978c7700.4.azurestaticapps.net/';

const HomePage = () => {
  const classes = useStyles();
  const [darkMode, setDarkMode] = useState(null);
  const [token, setToken] = useState(null);
  const [viewOnly, setViewOnly] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [distanceConfirmation, setDistanceConfirmation] = useState(false);
  const [farAway, setFarAway] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // State for managing Menu
  const [anchorEl, setAnchorEl] = useState(null);

  const { instance, accounts, inProgress } = useMsal();

  useEffect(() => {
    const darkModeCookie = cookies.get('darkMode');
    if (darkModeCookie === false) {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
    instance.addEventCallback(
      (event) => {
        // set active account after redirect
        if (
          event.eventType === InteractionStatus.LOGIN_SUCCESS &&
          event.payload.account
        ) {
          const account = event.payload.account;
          instance.setActiveAccount(account);
        }
      },
      (error) => {
        console.log('error', error);
      }
    );

    console.log('get active account', instance.getActiveAccount());

    // handle auth redirect/do all initial setup for msal
    instance
      .handleRedirectPromise()
      .then((authResult) => {
        // Check if user signed in
        const account = instance.getActiveAccount();
        if (!account) {
          // redirect anonymous user to login page
          instance.loginRedirect();
        }
      })
      .catch((err) => {
        // TODO: Handle errors
        console.log(err);
      });
    const isTokenExpired = (token) => {
      if (!token) return true;
      const expiration = jwtDecode(token).exp;
      const currentTime = Date.now() / 1000;
      return expiration < currentTime;
    };

    console.log('accounts', accounts);
    console.log('token', token);
    console.log('inProgress', inProgress);

    if (inProgress === InteractionStatus.None && accounts.length > 0) {
      if (!token || (token && isTokenExpired(token))) {
        instance
          .acquireTokenSilent({
            // Adjust scopes and account parameters as needed
            roles: ['toggle'],
            account: accounts[0],
          })
          .then((accessTokenResponse) => {
            console.log(
              'Silent token acquisition successful',
              accessTokenResponse
            );
            const newToken = accessTokenResponse.idToken;
            setToken(newToken);
          })
          .catch(async (error) => {
            console.log(
              'Silent token acquisition fails. Acquiring token using redirect'
            );
            console.log(error);
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

    //If the user is more than 300m away from the geolocation of the pi, trigger a pop up
    // for the user to confirm they want to open/close the garage door
    if (farAway) {
      const confirm = window.confirm(
        'You are more than 300m away from the garage. Are you sure you want to open/close the garage?'
      );
      if (confirm === false) {
        setLoading(false);
        setDistanceConfirmation(true);
        return;
      }
    }

    const functionAppUrl = isDev
      ? 'http://localhost:7071'
      : 'https://garagepi-func.azurewebsites.net';
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      //Make the location a json string
      location: JSON.stringify((await getCurrentPosition()).coords),
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
        setSnackbarMessage(error.message);
        setTimeout(() => {
          setShowError(false); // Hide error message after 3 seconds
        }, 3000);
      });
  };

  const handleLogout = async () => {
    await instance.logoutRedirect();
  };

  // Function to open Menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close Menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowError(false);
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
          <MenuItem disabled={!token} onClick={handleLogout}>
            Logout
          </MenuItem>
          {/* <MenuItem onClick={handleOldLogout}>Old Logout</MenuItem> */}
        </Menu>
        {!viewOnly && !token && <LoginPage setViewOnly={setViewOnly} />}
      </div>

      {/* Open and Close Buttons */}
      <div className={classes.centerContainer}>
        {viewOnly && (
          <h1 style={{ color: 'white' }}>You are in View Only Mode</h1>
        )}
        <IconButton
          sx={{ backgroundColor: showError ? 'red' : 'primary' }}
          onClick={handleAction}
          disabled={viewOnly || loading}
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
      <Dialog open={farAway}>
        <h1>
          You are more than 300m away from the garage. Are you sure you want to
          open/close the garage?
        </h1>
      </Dialog>
      <Snackbar
        open={showError}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        action={
          <React.Fragment>
            <Button
              color="secondary"
              size="small"
              onClick={handleSnackbarClose}
            >
              X
            </Button>
          </React.Fragment>
        }
      />
    </div>
  );
};

export default HomePage;
