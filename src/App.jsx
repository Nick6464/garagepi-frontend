import { configureAmplify } from "./config/amplify";
import { AuthProvider } from "./context/AuthContext";
import AppContent from "./components/AppContent";
import "bootstrap/dist/css/bootstrap.min.css";

// Configure Amplify
configureAmplify();

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
