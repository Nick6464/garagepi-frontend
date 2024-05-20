import { LoadingButton } from '@mui/lab';
import {
  Button,
  Grid,
  Modal,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

function ShareAccess(props) {
  const { open, garageDoor, session, setShareWindow } = props;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

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

  const sendShareRequest = async () => {
    setLoading(true);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      };

      // Send a request to the server to open the garage which will include the token
      const response = await axios.post(
        'https://garagepi-func.azurewebsites.net/api/shareAccess',
        {
          hwid: garageDoor.hwid,
          email: email,
        },
        { headers: headers }
      );

      // If the response is an error then throw an error
      if (response.error) {
        throw response.error;
      }

      // Log the response
      console.log(response);
    } catch (error) {
      console.error(error);
      setError(error.response.data);
      setLoading(false);
      // Add a call back to make the error disappear after 2 seconds
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setShareWindow(false);
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
          <Grid item xs={12}>
            <Typography variant="h5">Share Access</Typography>
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid container item xs={12} justifyContent="space-evenly">
            <Grid item>
              <LoadingButton
                loading={loading}
                onClick={sendShareRequest}
                variant="contained"
                color="primary"
              >
                Share
              </LoadingButton>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setShareWindow(false)}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
}

export default ShareAccess;
