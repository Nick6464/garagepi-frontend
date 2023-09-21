import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { useMsal } from '@azure/msal-react';
import { toggleDarkMode } from './utils';
import Cookies from 'universal-cookie';
import { Switch } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh', // Center vertically on the screen
  },
  largeButton: {
    fontSize: '2rem',
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
  const { instance, accounts } = useMsal();
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    // Check if dark mode preference is stored in a cookie
    const darkModeCookie = cookies.get('darkMode');
    if (darkModeCookie === 'true') {
      setDarkMode(true);
    } else if (darkModeCookie === 'false') {
      setDarkMode(false);
    }
  }, [darkMode]); // Add darkMode as a dependency

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    toggleDarkMode(newDarkMode); // Update the cookie
    window.location.reload(); // Reload the page to apply the new theme
  };

  const handleLogout = () => {
    if (accounts.length > 0) {
      instance.logoutRedirect();
    }
  };

  return (
    <div>
      {/* Dark Mode Toggle and Logout */}
      <div className={classes.settingsContainer}>
        <Switch
          checked={cookies.get('darkMode')}
          onChange={handleDarkModeToggle}
          color="primary"
        />
        <SettingsIcon onClick={handleLogout} />
      </div>

      {/* Centered Large Button */}
      <div className={classes.centerContainer}>
        <Button
          variant="contained"
          color="primary"
          className={classes.largeButton}
        >
          Very Large Button
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
