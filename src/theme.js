import { createTheme } from '@mui/material/styles';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

// Check the user's dark mode preference from the cookie
const isDarkMode = cookies.get('darkMode');

const theme = createTheme({
  palette: {
    mode: isDarkMode ? 'dark' : 'light', // Set theme type based on dark mode preference
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#FFA000',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
