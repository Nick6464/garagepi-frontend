import PropTypes from "prop-types";
import { Alert } from "react-bootstrap";

function ErrorMessage({ message = null, onDismiss = () => {} }) {
  if (!message) return null;

  return (
    <Alert variant="danger" onClose={onDismiss} dismissible>
      {message}
    </Alert>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
  onDismiss: PropTypes.func,
};

export default ErrorMessage;
