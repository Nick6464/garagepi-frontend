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
import { useMsal } from '@azure/msal-react';
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const isDev = process.env.NODE_ENV === 'development';

export const config = {
  auth: {
    clientId: '07327f0e-5960-49b3-bd2d-1ad2ddaf0a54', // Replace with your Azure AD application's client ID
    authority:
      'https://login.microsoftonline.com/ffd3cb73-11ea-4c26-8855-6a8f5d2fd6e5',
    redirectUri: isDev
      ? '/'
      : 'https://brave-ocean-070b1c000.3.azurestaticapps.net/', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    postLogoutRedirectUri: isDev
      ? 'https://localhost:3000'
      : 'https://brave-ocean-070b1c000.3.azurestaticapps.net/', // Indicates the page to navigate after logout.
    grantType: 'authorization_code',
  },
  cache: {
    cacheLocation: 'localStorage',
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
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <header className="App-header">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/*" element={<Navigate to="/" replace />} />
              </Routes>
            </header>
          </div>
        </Router>
      </ThemeProvider>
    </MsalProvider>
  );
}

export default App;
