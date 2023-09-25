// MSALProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

const MSALContext = createContext();

const config = {
  auth: {
    clientId: 'b73800b9-5239-467f-a1ec-78d47a986680', // Replace with your Azure AD application's client ID
    authority:
      'https://login.microsoftonline.com/ffd3cb73-11ea-4c26-8855-6a8f5d2fd6e5',
    redirectUri: 'http://localhost:3000/',
  },
  cache: {
    cacheLocation: 'localStorage',
  },
};

export const pca = new PublicClientApplication(config);

export const MSALProvider = ({ children }) => {
  const [msalInstance, setMsalInstance] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function initializeMSAL() {
      try {
        await pca.initialize();
        await pca.handleRedirectPromise();

        const accounts = pca.getAllAccounts();
        if (accounts.length > 0) {
          setIsLoggedIn(true);
        }

        setMsalInstance(pca);
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    }

    initializeMSAL();
  }, []);

  // Create a logout function
  const logout = async () => {
    if (msalInstance) {
      try {
        // Sign out the user
        await msalInstance.logout({
          // Add any necessary logout options here
        });

        // Set the user as logged out in your state
        setIsLoggedIn(false);
      } catch (error) {
        console.error('MSAL logout error:', error);
      }
    }
  };

  // Create a login function
  const login = async () => {
    if (msalInstance) {
      try {
        // Define the scopes you need for your application
        const request = {
          scopes: ['openid', 'profile', 'email'],
        };

        // Initiate the login process with a popup
        const response = await msalInstance.loginPopup(request);

        // Handle the login success
        if (response) {
          // Set the user as logged in in your state
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('MSAL login error:', error);
      }
    }
  };

  return (
    <MSALContext.Provider value={{ msalInstance, isLoggedIn, logout, login }}>
      {children}
    </MSALContext.Provider>
  );
};

export const useMSAL = () => {
  const context = useContext(MSALContext);
  if (!context) {
    throw new Error('useMSAL must be used within an MSALProvider');
  }
  return context;
};
