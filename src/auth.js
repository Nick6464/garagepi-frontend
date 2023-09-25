import { PublicClientApplication } from '@azure/msal-browser';

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

export default pca;
