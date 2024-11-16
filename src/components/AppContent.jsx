import { useState } from "react";
import {
  Container,
  Spinner,
  Button,
  Form,
  ThemeProvider,
} from "react-bootstrap";
import PropTypes from "prop-types";
import { useAuth } from "../context/AuthContext";
import Login from "./Login";
import SignUp from "./SignUp";
import DeviceList from "./DeviceList";
import AddDeviceModal from "./AddDeviceModal";

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  if (loading) {
    return <Spinner />;
  }

  const content = !user ? (
    showSignUp ? (
      <SignUp
        onSuccess={() => setShowSignUp(false)}
        onSignInClick={() => setShowSignUp(false)}
      />
    ) : (
      <Login
        onSignUpClick={() => setShowSignUp(true)}
        isDarkMode={isDarkMode}
      />
    )
  ) : (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex gap-2">
          <Form.Check
            type="switch"
            id="dark-mode-switch"
            label={isDarkMode ? "🌙" : "☀️"}
            checked={isDarkMode}
            onChange={(e) => setIsDarkMode(e.target.checked)}
            className={isDarkMode ? "text-light" : "text-dark"}
          />
        </div>
        <Button variant="outline-danger" onClick={signOut}>
          <i className="bi bi-box-arrow-right"></i>
        </Button>
      </div>

      <DeviceList isDarkMode={isDarkMode} />
      <div className="text-center mt-3">
        <Button variant="primary" onClick={() => setShowAddDevice(true)}>
          <i className="bi bi-plus-lg me-2"></i>
          Add Device
        </Button>
      </div>

      <AddDeviceModal
        show={showAddDevice}
        onHide={() => setShowAddDevice(false)}
        onDeviceAdded={() => {
          const deviceListElement = document.querySelector("DeviceList");
          if (deviceListElement) {
            deviceListElement.fetchDevices();
          }
        }}
      />
    </Container>
  );

  return (
    <div
      className={isDarkMode ? "bg-dark" : "bg-light"}
      style={{ minHeight: "100vh" }}
    >
      <ThemeProvider
        breakpoints={["xxxl", "xxl", "xl", "lg", "md", "sm", "xs", "xxs"]}
        minBreakpoint="xxs"
        data-bs-theme={isDarkMode ? "dark" : "light"}
      >
        {content}
      </ThemeProvider>
    </div>
  );
}

AppContent.propTypes = {
  onDeviceAdded: PropTypes.func,
};

export default AppContent;
