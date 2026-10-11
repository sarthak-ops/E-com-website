import "./Notification.css";

function Notification({ message, type = "success", onClose }) {
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>×</button>
    </div>
  );
}

export default Notification;