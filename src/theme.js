import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Set theme type based on dark mode preference
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
});

export default theme;
