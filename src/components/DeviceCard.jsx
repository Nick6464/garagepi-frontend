import PropTypes from "prop-types";
import { Card, Button, Spinner, Dropdown } from "react-bootstrap";
import { forwardRef, useState } from "react";
import { FaDoorClosed, FaDoorOpen, FaEllipsisV } from "react-icons/fa";
import ShareDeviceModal from "./ShareDeviceModal";

const CustomToggle = forwardRef(({ onClick }, ref) => (
  <Button
    ref={ref}
    variant="link"
    className="text-secondary p-0"
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ position: "absolute", top: "10px", right: "10px" }}
  >
    <FaEllipsisV />
  </Button>
));

CustomToggle.displayName = "CustomToggle";

function DeviceCard({ device, onCommand }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCommand = async (deviceId, command) => {
    setIsLoading(true);
    await onCommand(deviceId, command);
    setIsLoading(false);
  };

  return (
    <Card className="h-100 border-0 position-relative bg-body">
      <Dropdown>
        <Dropdown.Toggle as={CustomToggle} />
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setShowShareModal(true)}>
            Share Access
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Card.Body className="d-flex flex-column align-items-center">
        <Button
          className="rounded-circle mb-3"
          variant={device.status === "open" ? "danger" : "success"}
          onClick={() =>
            handleCommand(
              device.deviceId,
              device.status === "open" ? "close" : "open"
            )
          }
          disabled={isLoading}
          style={{
            width: "120px",
            height: "120px",
            transition: "all 0.2s ease-in-out",
          }}
        >
          {isLoading ? (
            <Spinner animation="border" />
          ) : device.status === "open" ? (
            <FaDoorClosed size={48} />
          ) : (
            <FaDoorOpen size={48} />
          )}
        </Button>
        <h5 className="mb-0 text-center text-body">{device.name}</h5>
        <small className="text-secondary">
          {new Date(device.lastUpdated).toLocaleString()}
        </small>
      </Card.Body>
      <ShareDeviceModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        device={device}
      />
    </Card>
  );
}

DeviceCard.propTypes = {
  device: PropTypes.shape({
    deviceId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["open", "closed"]).isRequired,
    lastUpdated: PropTypes.string.isRequired,
    ownerId: PropTypes.string.isRequired,
    sharedWith: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onCommand: PropTypes.func.isRequired,
};

CustomToggle.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default DeviceCard;
