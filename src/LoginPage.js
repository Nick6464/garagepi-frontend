import { LoadingButton } from '@mui/lab';
import {
  Divider,
  Grid,
  Modal,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import Button from '@mui/material/Button';
import React from 'react';
import GoogleButton from 'react-google-button';

const LoginPage = (props) => {
  const { supabase, setUser, setSession, open } = props;
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true);
  const [confirmEmail, setConfirmEmail] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleAuth = async () => {
    setLoading(true);
    if (isLogin) {
      let { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error(error);
        setError(error.message);
      }

      setSession(data.session);
      console.log(data);
    } else {
      let { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        console.error(error);
        setError(error.message);
      }

      setUser(data.user);
      console.log(data);
      if (data.user) {
        setConfirmEmail(true);
      }
    }
    setLoading(false);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin); // Toggle between login and signup modes
    setEmail(''); // Clear email and password fields when toggling
    setPassword('');
    setConfirmPassword('');
    setError(''); // Clear any errors when toggling
  };

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

  const validatePassword = (password) => {
    // Regex for a strong password (at least 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character)
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateEmail = (email) => {
    // Regex for email validation
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };

  return (
    <Modal open={open}>
      <Paper sx={style}>
        <Grid container spacing={2} alignItems="center" justifyContent="center">
          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
          {confirmEmail && (
            <Grid item xs={12}>
              <Typography>
                A confirmation email has been sent to {email}. Please confirm
                your email address before logging in.
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              fullWidth
              value={email}
              label="Email"
              error={!isLogin && email !== '' && validateEmail(email) === false}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email-login"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              value={password}
              error={
                !isLogin &&
                password !== '' &&
                validatePassword(password) === false
              }
              label="Password"
              type="password"
              autoComplete="password"
              onChange={(e) => setPassword(e.target.value)}
              helperText={
                !isLogin &&
                password !== '' &&
                validatePassword(password) === false
                  ? 'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.'
                  : ''
              }
            />
          </Grid>
          {!isLogin && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                // Only show confirm password field in signup mode
                // Give and error if passwords don't match or if the password doesnt meet the regex requirements
                error={confirmPassword !== '' && password !== confirmPassword}
                value={confirmPassword}
                helperText={
                  confirmPassword !== '' && password !== confirmPassword
                    ? "Passwords don't match"
                    : ''
                }
                label="Confirm Password"
                type="password"
                autoComplete="confirm-password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="center">
              <LoadingButton
                loading={loading}
                variant="contained"
                onClick={handleAuth}
              >
                {isLogin ? 'Login' : 'Signup'}
              </LoadingButton>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Divider variant="middle" />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="center">
              <GoogleButton
                label={isLogin ? 'Login with Google' : 'Signup with Google'}
                onClick={async () => {
                  let { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: window.location.href },
                  });
                  console.log(data, error);
                }}
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={0} justifyContent="center">
              <Button color="secondary" onClick={toggleAuthMode}>
                {isLogin ? 'No account? Signup' : 'Have an account? Login'}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Modal>
  );
};

export default LoginPage;
