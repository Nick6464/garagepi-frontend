import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import Cookies from 'universal-cookie';
import theme from './theme';

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

const pca = new PublicClientApplication(config);

function App() {
  const cookies = new Cookies();
  const jwtToken = cookies.get('jwtToken');

  // Check if jwtToken is defined and not empty
  const isLoggedIn = jwtToken && jwtToken.trim() !== '';

  return (
    <MsalProvider instance={pca}>
      <ThemeProvider theme={theme}>
        {console.log('theme', theme)}
        {console.log('darkMode', cookies.get('darkMode'))}
        <CssBaseline />
        <Router>
          {console.log('isLoggedIn', isLoggedIn)}
          {console.log('jwtToken', jwtToken)}
          <div className="App">
            <header className="App-header">
              <Routes>
                {/* Route accessible only for authenticated users */}
                <Route
                  path="/"
                  element={
                    isLoggedIn ? <HomePage /> : <Navigate to="/login" replace />
                  }
                />
                {/* Login route accessible only for unauthenticated users */}
                <Route path="/login" element={<LoginPage />} />
                {/* Default route */}
                <Route path="/*" element={<Navigate to="/login" replace />} />
              </Routes>
            </header>
          </div>
        </Router>
      </ThemeProvider>
    </MsalProvider>
  );
}

export default App;
