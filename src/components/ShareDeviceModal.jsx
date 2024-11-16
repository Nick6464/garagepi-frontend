import { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

function ShareDeviceModal({ show, onHide, device }) {
  const { getToken } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiResponse, setApiResponse] = useState(null);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSuccessMessage("");
    setApiResponse(null);
    setIsSubmitting(true);

    try {
      const token = await getToken();
      console.log(
        `Attempting to share device ${device.deviceId} with ${email}`
      );

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/devices/${device.deviceId}/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();
      setApiResponse(data);

      if (!response.ok) {
        console.error("Share device failed:", {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(data.error || "Failed to share device");
      }

      console.log("Share device success:", {
        deviceId: device.deviceId,
        sharedWith: email,
        response: data,
      });

      setSuccessMessage(`Device successfully shared with ${email}`);
      setEmail("");
    } catch (err) {
      console.error("Share device error:", {
        error: err,
        deviceId: device.deviceId,
        email,
        apiResponse,
      });
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    setSuccessMessage("");
    setApiResponse(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Share Device Access</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            <div>{error}</div>
          </Alert>
        )}
        {successMessage && (
          <Alert
            variant="success"
            onClose={() => setSuccessMessage("")}
            dismissible
          >
            <div>{successMessage}</div>
            {apiResponse && (
              <small className="d-block mt-2">
                Response: {JSON.stringify(apiResponse)}
              </small>
            )}
          </Alert>
        )}
        <Form onSubmit={handleShare}>
          <Form.Group className="mb-3">
            <Form.Label>User Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter user's email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <Form.Text className="text-muted">
              Enter the email address of the user you want to share access with
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleShare}
          disabled={isSubmitting || !email.trim()}
        >
          {isSubmitting ? "Sharing..." : "Share Access"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ShareDeviceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  device: PropTypes.shape({
    deviceId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default ShareDeviceModal;
