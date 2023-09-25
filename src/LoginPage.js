import React from 'react';
import Button from '@mui/material/Button';
import { Navigate } from 'react-router-dom';
import { useMSAL } from './MSALProvider';

const LoginPage = () => {
  const { isLoggedIn, login } = useMSAL();

  const loginWithAzureAD = async () => {
    try {
      login();
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Render the component only if the user is not logged in
  if (isLoggedIn) {
    console.log('LoginPage.js: isLoggedIn', isLoggedIn);
    return <Navigate to="/" replace />; // Render nothing
  }

  return (
    <div>
      <h1>Login to My App</h1>
      <p>Please log in to continue:</p>
      <Button variant="contained" color="primary" onClick={loginWithAzureAD}>
        Login with Azure AD
      </Button>
    </div>
  );
};

export default LoginPage;
