import React, { useEffect } from 'react';
import Button from '@mui/material/Button';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const LoginPage = ({ setViewOnly }) => {
  const { instance } = useMsal();

  useEffect(() => {
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
  }, [instance]);

  const login = async () => {
    try {
      let response = await instance.loginRedirect({
        scopes: ['User.Read'],
        prompt: 'select_account',
        grant_type: 'authorization_code',
      });
      console.log('login response:', response);
      instance.setActiveAccount(response.account);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <Dialog
      open={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Login to GaragePi'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          This App opens my garage door and requires a login to use. If you are
          just looking around, click View Only.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={login}>
          Login
        </Button>
        <Button variant="contained" onClick={() => setViewOnly(true)} autoFocus>
          View Only
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoginPage;
