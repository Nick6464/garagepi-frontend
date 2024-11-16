import { useState } from "react";
import PropTypes from "prop-types";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

function SignUp({ onSuccess, onSignInClick }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [localError, setLocalError] = useState("");

  const { signUp, confirmSignUp, error: authError } = useAuth();

  const validateForm = () => {
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters long");
      return false;
    }
    setLocalError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { isSignUpComplete, nextStep } = await signUp(
        username,
        password,
        email
      );
      if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setShowConfirmation(true);
      }
      if (isSignUpComplete) {
        onSuccess();
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmationSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const isSignUpComplete = await confirmSignUp(username, confirmationCode);
      if (isSignUpComplete) {
        onSuccess();
      }
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <Card.Body>
          <h2 className="text-center mb-4">
            {showConfirmation ? "Confirm Sign Up" : "Sign Up"}
          </h2>

          {(localError || authError) && (
            <Alert variant="danger" className="mb-4">
              {localError || authError}
            </Alert>
          )}

          {!showConfirmation ? (
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
                <Button variant="link" onClick={onSignInClick}>
                  Already have an account? Sign in
                </Button>
              </div>
            </Form>
          ) : (
            <Form onSubmit={handleConfirmationSubmit}>
              <Form.Group className="mb-4" controlId="confirmationCode">
                <Form.Label>Confirmation Code</Form.Label>
                <Form.Control
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                />
                <Form.Text className="text-muted">
                  Please check your email for the confirmation code.
                </Form.Text>
              </Form.Group>

              <div className="d-grid">
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

SignUp.propTypes = {
  onSuccess: PropTypes.func,
  onSignInClick: PropTypes.func,
};

SignUp.defaultProps = {
  onSuccess: () => {},
  onSignInClick: () => {},
};

export default SignUp;
