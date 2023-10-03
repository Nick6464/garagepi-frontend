import { createTheme } from '@mui/material/styles';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

// Check the user's dark mode preference from the cookie
const isDarkMode = cookies.get('darkMode');

const theme = createTheme({
  palette: {
    mode: isDarkMode === false ? 'light' : 'dark', // Set theme type based on dark mode preference
    primary: {
      main: '#003892',
    },
    secondary: {
      main: '#8796A5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: {
          backgroundColor: isDarkMode ? '#003892' : '#001e3c',
          color: '#fff',
          border: 'none',
          padding: '5px',
          fontSize: '31px',
          height: '130px',
          width: '130px',
          boxShadow: '0 2px 4px darkslategray',
        },
      },
    },
  },
});

export default theme;
