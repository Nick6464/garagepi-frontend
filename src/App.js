import React from 'react';
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
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import HttpsRedirect from 'react-https-redirect';

//is de if development or if url is https://witty-rock-0978c7700.4.azurestaticapps.net/
const isDev =
  process.env.NODE_ENV === 'development' ||
  window.location.href ===
    'https://witty-rock-0978c7700.4.azurestaticapps.net/';

export const config = {
  auth: {
    clientId: isDev
      ? 'f8edf2ca-5258-4880-8494-67e374a305d1'
      : '6bea6dc5-5661-4e66-adfd-ffcc127ef544', // Replace with your Azure AD application's client ID
    authority:
      'https://login.microsoftonline.com/ffd3cb73-11ea-4c26-8855-6a8f5d2fd6e5',
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
  const [pca] = React.useState(() => {
    return new PublicClientApplication(config);
  });

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
