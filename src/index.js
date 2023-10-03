import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { MsalProvider } from '@azure/msal-react';
import { LogLevel, PublicClientApplication } from '@azure/msal-browser';

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

ReactDOM.render(
  <React.StrictMode>
    <MsalProvider instance={pca}>
      <App />
    </MsalProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
