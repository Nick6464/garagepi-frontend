import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { makeStyles } from '@mui/styles';
import { toggleDarkMode } from './utils';
import Cookies from 'universal-cookie';
import { Switch, Menu, MenuItem } from '@mui/material'; // Import Menu and MenuItem
import axios from 'axios';
import { useMSAL } from './MSALProvider';

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
  const [jwtToken, setJwtToken] = useState(null);

  // State for managing Menu
  const [anchorEl, setAnchorEl] = useState(null);

  const { logout } = useMSAL();

  useEffect(() => {
    const darkModeCookie = cookies.get('darkMode');
    if (darkModeCookie === 'true') {
      setDarkMode(true);
    } else if (darkModeCookie === 'false') {
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const jwtToken = cookies.get('jwtToken');
    setJwtToken(jwtToken);
  }, [jwtToken]);

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
      Authorization: `Bearer ${jwtToken}`,
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

  const handleLogout = () => {
    logout();
    cookies.remove('jwtToken');
    window.location.href = '/login';
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
