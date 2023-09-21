import React from 'react';
import Button from '@mui/material/Button';
import { useMsal } from '@azure/msal-react';
import Cookies from 'universal-cookie';
import { Navigate } from 'react-router-dom'; // Import Navigate

const LoginPage = () => {
  const { instance } = useMsal();
  const cookies = new Cookies();

  const loginWithAzureAD = async () => {
    try {
      // Define the scopes you need for your application
      const request = {
        scopes: ['openid', 'profile', 'user.read'],
      };

      // Initiate the login process
      const response = await instance.loginPopup(request);

      // Handle the login success
      if (response) {
        // Store the JWT token in a secure cookie
        const token = response.accessToken;
        cookies.set('jwtToken', token, { secure: true, sameSite: 'strict' });

        // Use the Navigate component to redirect to the root path
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

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
