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

function App() {
  const { instance, accounts, inProgress } = useMsal();
  return (
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
  );
}

export default App;
