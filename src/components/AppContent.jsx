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
  const { user, loading } = useAuth();
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
      <Login onSignUpClick={() => setShowSignUp(true)} />
    )
  ) : (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className={isDarkMode ? "text-light" : "text-dark"}>
          Garage Door Control
        </h1>
        <div className="d-flex gap-2">
          <Form.Check
            type="switch"
            id="dark-mode-switch"
            label={isDarkMode ? "🌙" : "☀️"}
            checked={isDarkMode}
            onChange={(e) => setIsDarkMode(e.target.checked)}
            className={isDarkMode ? "text-light" : "text-dark"}
          />
          <Button variant="primary" onClick={() => setShowAddDevice(true)}>
            Add Device
          </Button>
        </div>
      </div>

      <DeviceList />

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
