import { useState, useEffect } from "react";
import { Row, Col, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import DeviceCard from "./DeviceCard";

function DeviceList() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/devices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }

      const data = await response.json();
      const transformedDevices = data.devices.map((device) => ({
        ...device,
        status: device.status || "closed",
        lastUpdated: device.lastUpdated || new Date().toISOString(),
      }));
      setDevices(transformedDevices);
    } catch (err) {
      console.error("Error fetching devices:", err);
      setError("Failed to fetch devices");
    } finally {
      setLoading(false);
    }
  };

  const handleDoorCommand = async (deviceId, action) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/devices/${deviceId}/command`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send command");
      }

      await fetchDevices();
    } catch (err) {
      console.error("Error sending command:", err);
      setError("Failed to send command");
    }
  };

  return (
    <Row>
      {!loading && devices.length === 0 && (
        <Col xs={12}>
          <Alert variant="info">
            No garages found. Please add a garage to get started.
          </Alert>
        </Col>
      )}
      {devices.map((device) => (
        <Col key={device.deviceId} xs={12} md={6} lg={4}>
          <DeviceCard device={device} onCommand={handleDoorCommand} />
        </Col>
      ))}
      {loading && <Spinner />}
      {error && <Alert variant="danger">{error}</Alert>}
    </Row>
  );
}

export default DeviceList;
