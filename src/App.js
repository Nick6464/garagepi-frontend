import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './HomePage';
import theme from './theme';
import { useMsal } from '@azure/msal-react';

function App() {
  const { instance, accounts } = useMsal();
  return (
    <ThemeProvider theme={theme}>
      {console.log('App.js: instance', instance)}
      {console.log('App.js: getAllAccounts', instance.getAllAccounts())}
      {console.log('App.js: accounts', accounts)}
      <CssBaseline />
      <Router>
        <div className="App">
          <header className="App-header">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </header>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
