import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import theme from './theme';
import { MSALProvider, pca } from './MSALProvider';

function App() {
  const accounts = pca ? pca.getAllAccounts() : null;

  return (
    <MSALProvider>
      {console.log('App.js: pca', pca)}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <header className="App-header">
              <Routes>
                <Route
                  path="/"
                  element={
                    accounts && accounts.length > 0 ? (
                      <HomePage />
                    ) : (
                      <Navigate to="/login" replace />
                    )
                  }
                />
                <Route
                  path="/login"
                  element={
                    accounts && accounts.length > 0 ? (
                      <Navigate to="/" replace />
                    ) : (
                      <LoginPage />
                    )
                  }
                />
                <Route path="/*" element={<Navigate to="/login" replace />} />
              </Routes>
            </header>
          </div>
        </Router>
      </ThemeProvider>
    </MSALProvider>
  );
}

export default App;
