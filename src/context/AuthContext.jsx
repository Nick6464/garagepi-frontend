import { createContext, useContext, useState, useEffect } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Error checking user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn(username, password) {
    try {
      setError(null);
      const { isSignedIn, nextStep } = await signIn({ username, password });
      if (isSignedIn) {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        return currentUser;
      }
      return nextStep;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function getToken() {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens.idToken.toString();
    } catch (err) {
      console.error("Error getting token:", err);
      return null;
    }
  }

  async function handleSignUp(username, password, email) {
    try {
      setError(null);
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: true, // Enables auto sign-in after confirmation
        },
      });

      return { isSignUpComplete, userId, nextStep };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function handleConfirmSignUp(username, code) {
    try {
      setError(null);
      const { isSignUpComplete } = await confirmSignUp({
        username,
        confirmationCode: code,
      });
      return isSignUpComplete;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  const value = {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    checkUser,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
