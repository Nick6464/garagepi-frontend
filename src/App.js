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
import HttpsRedirect from 'react-https-redirect';

function App() {
  return (
    <HttpsRedirect>
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
    </HttpsRedirect>
  );
}

export default App;
