import { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import ErrorMessage from "./ErrorMessage";

function AddDeviceModal({ show, onHide, onDeviceAdded = () => {} }) {
  const { getToken } = useAuth();
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (!deviceId.trim()) return;

    setError("");
    setIsSubmitting(true);

    try {
      const token = await getToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/devices/claim/${deviceId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: deviceName.trim() || deviceId.trim() }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add device");
      }

      if (onDeviceAdded) {
        onDeviceAdded();
      }
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDeviceId("");
    setDeviceName("");
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Device</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ErrorMessage message={error} onDismiss={() => setError("")} />
        <Form onSubmit={handleAddDevice}>
          <Form.Group className="mb-3">
            <Form.Label>Device ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Device Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter device name (optional)"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={isSubmitting}
            />
            <Form.Text className="text-muted">
              If left empty, the device ID will be used as the name
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAddDevice}
          disabled={isSubmitting || !deviceId.trim()}
        >
          {isSubmitting ? "Adding..." : "Add Device"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

AddDeviceModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onDeviceAdded: PropTypes.func,
};

export default AddDeviceModal;
