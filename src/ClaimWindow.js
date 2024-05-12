import React, { useState } from 'react';
import { Grid, Modal, Paper, TextField, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';

const NODE_ENV = process.env.NODE_ENV;

const ClaimWindow = (props) => {
  const { session, setClaimWindow, open, supabase, fetchGarageDoors } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [stage, setStage] = useState(props.stage || 0);
  const [garageDoor, setGarageDoor] = useState(props.garageDoor || {});

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    outline: 'none',
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setClaimWindow(false);
        setStage(0);
      }}
    >
      <Paper sx={style}>
        <Grid
          container
          spacing={2}
          columnSpacing={{ xs: 1, sm: 2, md: 3 }}
          alignItems="center"
          justifyContent="center"
        >
          {/* The user enters the hwid on the label attached to their Pi */}
          {stage === 0 && (
            <LinkingUserToPi
              error={error}
              serialNumber={serialNumber}
              setSerialNumber={setSerialNumber}
              loading={loading}
              setLoading={setLoading}
              session={session}
              setError={setError}
              setStage={setStage}
              setGarageDoor={setGarageDoor}
            />
          )}
          {stage === 1 && (
            <RenameGarageDoor
              garageDoor={garageDoor}
              session={session}
              setError={setError}
              supabase={supabase}
              setClaimWindow={setClaimWindow}
              fetchGarageDoors={fetchGarageDoors}
            />
          )}
        </Grid>
      </Paper>
    </Modal>
  );
};

export default ClaimWindow;

export function RenameGarageDoor(props) {
  const {
    garageDoor,
    session,
    setError,
    supabase,
    setClaimWindow,
    fetchGarageDoors,
  } = props;
  const [tempName, setTempName] = React.useState(garageDoor.garage_name);

  const renameGarageDoor = async () => {
    // Make a call to supabase to update the garage door name if the user has the id of the owner
    console.log('New Name:', tempName);
    console.log('Garage ID:', garageDoor.id);
    console.log('Owner ID:', session.user.id);

    const { data, error } = await supabase
      .from('garages')
      .update({ garage_name: tempName })
      .match({ id: garageDoor.id })
      .select();

    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error(error);
      setError('An error occurred. Please try again.');
      setTimeout(() => {
        setError('');
      }, 3000);
    } else {
      console.log('Garage Door Updated:', data);
      fetchGarageDoors();
      setClaimWindow(false);
    }
  };

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Typography variant="h6">Name Your Garage Door</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Garage Door Name"
          variant="outlined"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <LoadingButton
        sx={{ mt: 2 }}
        onClick={renameGarageDoor}
        variant="contained"
      >
        Rename Garage Door
      </LoadingButton>
    </React.Fragment>
  );
}

function LinkingUserToPi(props) {
  const {
    error,
    serialNumber,
    setSerialNumber,
    loading,
    setLoading,
    session,
    setError,
    setStage,
    setGarageDoor,
  } = props;

  const linkOwnerToPi = async () => {
    // Get the serial number from the input field
    console.log('serialNumber:', serialNumber);

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    };

    axios
      .post(
        'https://garagepi-func.azurewebsites.net/api/linkPiToUser',
        {
          hwid: serialNumber,
        },
        { headers: headers }
      )
      .then((res) => {
        setLoading(false);
        setStage(1);
        console.log('Linked Door:', res.data[0]);
        setGarageDoor(res.data[0]);
      })
      .catch((err) => {
        console.error(err);
        setError('An error occurred. Please try again.');
        setTimeout(() => {
          setError('');
        }, 3000);

        setLoading(false);
      });
  };

  return (
    <React.Fragment>
      <Grid item xs={12}>
        <Typography variant="h6">Claim GaragePi</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2">
          Enter the serial number found on the label attached to your GaragePi.
        </Typography>
      </Grid>
      {error && (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}
      <Grid item xs={12}>
        <TextField
          label="Serial Number"
          variant="outlined"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          fullWidth
          required
        />
      </Grid>
      <LoadingButton
        sx={{ mt: 2 }}
        loading={loading}
        onClick={() => {
          linkOwnerToPi();
          setLoading(true);
        }}
        variant="contained"
      >
        Claim GaragePi
      </LoadingButton>
    </React.Fragment>
  );
}
