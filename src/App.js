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

export const config = {
  auth: {
    clientId: '07327f0e-5960-49b3-bd2d-1ad2ddaf0a54', // Replace with your Azure AD application's client ID
    authority:
      'https://login.microsoftonline.com/ffd3cb73-11ea-4c26-8855-6a8f5d2fd6e5',
    redirectUri: '/', // You must register this URI on Azure Portal/App Registration. Defaults to window.location.origin
    postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
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
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
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
const pca = new PublicClientApplication(config);

function App() {
  const { instance, accounts, inProgress } = useMsal();
  return (
    <MsalProvider instance={pca}>
      <ThemeProvider theme={theme}>
        {console.log('App.js: instance', instance)}
        {console.log('App.js: getAllAccounts', instance.getAllAccounts())}
        {console.log('App.js: accounts', accounts)}
        {console.log('App.js: inProgress', inProgress)}
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
