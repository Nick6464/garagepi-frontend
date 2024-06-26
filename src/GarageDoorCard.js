import React, { useEffect, useState } from 'react';
import {
  Circle,
  Garage,
  Warning,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import {
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import axios from 'axios';
import './styles.css';
import ClaimWindow from './ClaimWindow';
import ShareAccess from './ShareAccess';

function GarageDoorCard(props) {
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [claimWindow, setClaimWindow] = useState(false);
  const [shareWindow, setShareWindow] = useState(false);

  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [pairing, setPairing] = useState(false);

  const [status, setStatus] = React.useState('Loading...');

  const { garageDoor, session, supabase, fetchGarageDoors } = props;
  const { id, garage_name, ip_address } = garageDoor;

  const handleButtonClick = async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        'bypass-tunnel-reminder': 'true',
      };

      // Send a request to the server to open the garage which will include the token
      const response = await axios.get(`${garageDoor.ip_address}/press`, {
        headers,
      });

      // If the response is an error then throw an error
      if (response.error) {
        throw response.error;
      }

      // Log the response
      console.log(response);
    } catch (error) {
      console.error(error);
      setShowError(true);
      // Add a call back to make the error disappear after 2 seconds
      setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
    setLoading(false);
  };

  const enterPairingMode = async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        'bypass-tunnel-reminder': 'true',
      };

      // Send a request to the server to open the garage which will include the token
      const response = await axios.get(`${garageDoor.ip_address}/pairingMode`, {
        headers,
      });

      // If the response is an error then throw an error
      if (response.error) {
        throw response.error;
      }

      // Enable the pairing mode for 10 seconds
      setPairing(true);
      setTimeout(() => {
        setPairing(false);
      }, 10000);

      // Log the response
      console.log(response);
    } catch (error) {
      setPairing(false);
      console.error(error);
      setShowError(true);
      // Add a call back to make the error disappear after 2 seconds
      setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
  };

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const blockingMode = () => {
    if (pairing || fetchingStatus || status !== 'Online') {
      return true;
    }
    return false;
  };

  return (
    <Grid item key={id}>
      <ClaimWindow
        garageDoor={garageDoor}
        supabase={supabase}
        open={claimWindow}
        setClaimWindow={setClaimWindow}
        session={session}
        fetchGarageDoors={fetchGarageDoors}
        stage={1}
      />
      <ShareAccess
        open={shareWindow}
        setShareWindow={setShareWindow}
        session={session}
        garageDoor={garageDoor}
      />
      <Paper elevation={3} sx={{ pb: 2, pl: 2 }}>
        <Grid
          justifyContent="space-between"
          container
          sx={{ pt: 2, width: '90vw', maxWidth: 400 }}
        >
          <Grid item>
            <Grid
              container
              justifyContent="left"
              alignContent="center"
              spacing={2}
            >
              <Grid item sx={{ height: 120, width: 120 }}>
                <IconButton
                  disabled={blockingMode()}
                  disableFocusRipple
                  sx={{
                    color: '#fff',
                    border: 'none',
                    height: '100%',
                    width: '100%',
                    boxShadow: '0 2px 4px darkslategray',
                    fontSize: 50,
                  }}
                  style={{
                    backgroundColor: showError
                      ? 'red'
                      : blockingMode()
                      ? 'secondary'
                      : '#003892',
                  }}
                  className="garageButton"
                  onClick={handleButtonClick}
                >
                  {showError ? ( // Conditional rendering for the button
                    <Warning fontSize="inherit" /> // Show warning icon in red
                  ) : loading ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <Garage fontSize="inherit" />
                  )}
                </IconButton>
              </Grid>
              <Grid item>
                <Grid
                  container
                  justifyContent={'center'}
                  direction={'column'}
                  sx={{ height: '100%' }}
                >
                  <Grid item>
                    <Typography sx={{ overflowX: 'hidden' }} variant="h4">
                      {garage_name}
                    </Typography>
                    <Status
                      status={status}
                      setStatus={setStatus}
                      pairing={pairing}
                      fetchGarageDoors={fetchGarageDoors}
                      fetchingStatus={fetchingStatus}
                      setFetchingStatus={setFetchingStatus}
                      session={session}
                      ip={ip_address}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {session &&
            session.user &&
            session.user.id === garageDoor.owner_id && (
              <Grid item>
                <IconButton
                  sx={{ ml: -5, mt: -2, position: 'absolute' }}
                  aria-controls={open ? 'basic-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  onClick={handleClick}
                >
                  <MoreVert />
                </IconButton>
                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                  <MenuItem
                    onClick={() => {
                      setAnchorEl(undefined);
                      setShareWindow(true);
                    }}
                  >
                    Manage Access
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setClaimWindow(true);
                      setAnchorEl(undefined);
                    }}
                  >
                    Rename
                  </MenuItem>
                  <MenuItem
                    disabled={blockingMode()}
                    onClick={() => {
                      setAnchorEl(undefined);
                      enterPairingMode();
                    }}
                  >
                    Enter Pairing Mode
                  </MenuItem>
                  {/* If the users ID matches the OwnerID of the Garage Door,
              allow the user to manage access */}
                </Menu>
              </Grid>
            )}
        </Grid>
      </Paper>
    </Grid>
  );
}

export default GarageDoorCard;

function Status(props) {
  const {
    ip,
    session,
    setFetchingStatus,
    fetchingStatus,
    pairing,
    status,
    setStatus,
    fetchGarageDoors,
  } = props;

  const checkStatus = async () => {
    try {
      if (fetchingStatus || pairing) return;
      setStatus('Loading...');

      setFetchingStatus(true);
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
        'bypass-tunnel-reminder': 'true',
      };

      await axios.get(`${ip}/test`, { headers });
      setStatus('Online');

      setFetchingStatus(false);
    } catch (error) {
      setFetchingStatus(false);
      console.error(error); // Log the error for debugging purposes
      setStatus('Offline');
    }
  };

  useEffect(() => {
    if (pairing || fetchingStatus || status !== 'Loading...') return;
    checkStatus();
  });

  return (
    <Typography
      variant="subtitle1"
      color={
        status === 'Loading...'
          ? 'primary'
          : status === 'Online'
          ? 'green'
          : 'error'
      }
    >
      <Circle fontSize="inherit" color="inherit" />{' '}
      {pairing ? 'Pairing...' : status}
      <IconButton
        size="small"
        onClick={async () => {
          if (status !== 'Loading...' && status !== 'Offline') {
            setStatus('Loading...');
            checkStatus();
          } else {
            await fetchGarageDoors();
            checkStatus();
          }
        }}
        style={{ marginLeft: 5 }}
      >
        <Refresh color="#000000" fontSize="inherit" />
      </IconButton>
    </Typography>
  );
}
