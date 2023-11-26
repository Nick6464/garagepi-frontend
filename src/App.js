import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './HomePage';
import theme from './theme';
import Blank from './Blank';
import { useMsal } from '@azure/msal-react';
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import HttpsRedirect from 'react-https-redirect';

export const config = {
  auth: {
    clientId: '6bea6dc5-5661-4e66-adfd-ffcc127ef544', // Replace with your Azure AD application's client ID
    authority:
      'https://login.microsoftonline.com/ffd3cb73-11ea-4c26-8855-6a8f5d2fd6e5',
    postLogoutRedirectUri: 'https://garagepi.site',
    redirectUri: 'https://garagepi.site',
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthSatateInCookie: true,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};

function App() {
  const { accounts, acquireTokenSilent } = useMsal();

  const [pca] = React.useState(() => {
    return new PublicClientApplication(config);
  });

  useEffect(() => {
    async function getTokenSilently() {
      if (accounts.length > 0) {
        try {
          const response = await acquireTokenSilent();
          console.log('Silent token acquisition successful', response);
        } catch (error) {
          console.error('Silent token acquisition failed', error);
        }
      }
    }

    getTokenSilently();
  }, [accounts, acquireTokenSilent]);

  return (
    <MsalProvider instance={pca}>
      <HttpsRedirect>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <div className="App">
              <header className="App-header">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/loginRedirect" element={<Blank />} />
                  <Route path="/*" element={<Navigate to="/" replace />} />
                </Routes>
              </header>
            </div>
          </Router>
        </ThemeProvider>
      </HttpsRedirect>
    </MsalProvider>
  );
}

export default App;
