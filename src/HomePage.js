import React, { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Cookies from 'universal-cookie';
import {
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material'; // Import Menu and MenuItem
import axios from 'axios';
import LoginPage from './LoginPage';
import ClaimWindow from './ClaimWindow';
import { Garage, Warning } from '@mui/icons-material';
import { createClient } from '@supabase/supabase-js';
import { LoadingButton } from '@mui/lab';
import GarageDoorCard from './GarageDoorCard';

const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0cXRnaW5rbHpianJodXNwcHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NDU2MDgsImV4cCI6MjAzMDEyMTYwOH0.sYFd9abYQhP7zOXCCeddULNsn6ViA7XEKwyZGZuDSQM';

const supabase = createClient(
  'https://itqtginklzbjrhusppwt.supabase.co',
  SUPABASE_KEY
);

const cookies = new Cookies();

const isDev = process.env.NODE_ENV === 'development';

const HomePage = () => {
  const [session, setSession] = useState(false);
  const [user, setUser] = useState(false);
  const [garageDoors, setGarageDoors] = useState([]);

  // State for managing Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [claimWindow, setClaimWindow] = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session && session.provider_token) {
        setUser(session.user);
        window.localStorage.setItem(
          'oauth_provider_token',
          session.provider_token
        );
      }

      if (session && session.provider_refresh_token) {
        setUser(session.user);
        window.localStorage.setItem(
          'oauth_provider_refresh_token',
          session.provider_refresh_token
        );
      }

      if (event === 'SIGNED_OUT') {
        window.localStorage.removeItem('oauth_provider_token');
        window.localStorage.removeItem('oauth_provider_refresh_token');
      }
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Once the user has logged in, get all the garage doors the user has
  useEffect(() => {
    if (user) fetchGarageDoors();
  }, [user]);

  const fetchGarageDoors = async () => {
    const { data: garageDoors, error } = await supabase
      .from('garages')
      .select('*');

    if (error) {
      console.error('Error fetching garage doors:', error.message);
    } else {
      console.log('Garage Doors:', garageDoors);
      setGarageDoors(garageDoors);
    }
  };

  // Function to open Menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to close Menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const logOut = async () => {
    handleMenuClose();
    let { error } = await supabase.auth.signOut();
    if (error) console.error('Sign out error', error.message);
  };

  const linkGaragePi = () => {
    handleMenuClose();
    setClaimWindow(true);
  };

  return (
    <div>
      {/* Dark Mode Toggle and Logout */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <SettingsIcon onClick={handleMenuOpen} />
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={linkGaragePi}>Link GaragePi</MenuItem>
          <MenuItem onClick={logOut}>Logout</MenuItem>
        </Menu>
        <LoginPage
          open={session === null}
          setUser={setUser}
          setSession={setSession}
          supabase={supabase}
        />
        <ClaimWindow
          supabase={supabase}
          open={claimWindow}
          setClaimWindow={setClaimWindow}
          session={session}
          fetchGarageDoors={fetchGarageDoors}
        />
      </div>

      {/* Open and Close Buttons */}
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        {garageDoors.length > 0 ? (
          garageDoors.map((garage) => (
            <GarageDoorCard
              key={garage.id}
              garageDoor={garage}
              session={session}
              supabase={supabase}
              fetchGarageDoors={fetchGarageDoors}
              setClaimWindow={setClaimWindow}
            />
          ))
        ) : (
          <Grid item>
            <Typography variant="h6">
              Looks like you don't have any link GaragePi's.
            </Typography>
            <Typography variant="h6">
              Click the <SettingsIcon />
              Settings then Link GaragePi
            </Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default HomePage;
