import React from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();

  const login = async () => {
    try {
      await instance.loginRedirect({
        scopes: ['User.Read'],
        prompt: 'select_account',
        grant_type: 'authorization_code',
      });
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  if (instance.getAllAccounts().length > 0) navigate('/');

  return (
    <div>
      <h1>Login to My App</h1>
      <p>Please log in to continue:</p>
      <Button variant="contained" color="primary" onClick={login}>
        Login with Azure AD
      </Button>
    </div>
  );
};

export default LoginPage;
