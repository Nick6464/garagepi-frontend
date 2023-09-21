import Cookies from 'universal-cookie';

const cookies = new Cookies();

// Toggle dark mode and update the cookie
export const toggleDarkMode = () => {
  const currentMode = cookies.get('darkMode') === 'true';
  cookies.set('darkMode', !currentMode, { secure: true, sameSite: 'strict' });
};
