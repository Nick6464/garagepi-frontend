import { useState } from "react";
import PropTypes from "prop-types";
import { Form, Button, Alert, Container, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

function Login({
  onSuccess = () => {},
  onSignUpClick = () => {},
  isDarkMode = false,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn(username, password);
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{ backgroundColor: isDarkMode ? "#212529" : "#fff" }}
    >
      <Card
        className="p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          backgroundColor: isDarkMode ? "#2c3034" : "#fff",
          color: isDarkMode ? "#fff" : "#212529",
        }}
      >
        <Card.Body>
          <h2 className="text-center mb-4">Sign In</h2>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  backgroundColor: isDarkMode ? "#212529" : "#fff",
                  color: isDarkMode ? "#fff" : "#212529",
                  borderColor: isDarkMode ? "#495057" : "#ced4da",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  backgroundColor: isDarkMode ? "#212529" : "#fff",
                  color: isDarkMode ? "#fff" : "#212529",
                  borderColor: isDarkMode ? "#495057" : "#ced4da",
                }}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <Button variant="link" onClick={onSignUpClick}>
                Need an account? Sign up
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

Login.propTypes = {
  onSuccess: PropTypes.func,
  onSignUpClick: PropTypes.func,
  isDarkMode: PropTypes.bool,
};

export default Login;
