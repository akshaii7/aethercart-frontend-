import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      console.log("Please login first");
      return;
    }

    api
      .get("notifications/notifications/")
      .then((response) => {
        console.log("Notifications:", response.data);
        setNotifications(response.data);
      })
      .catch((error) => {
        console.log("Notification Error Status:", error.response?.status);
        console.log("Notification Error Data:", error.response?.data);
      });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (!localStorage.getItem("access")) {
    return (
      <div style={{ padding: "1.25rem" }}>
        <h1>Notifications</h1>
        <p>Please login to see notifications.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.25rem" }}>
      <h1>Notifications</h1>

      <button
        onClick={fetchNotifications}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          background: "#2874f0",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Refresh Notifications
      </button>

      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              marginBottom: "12px",
              borderRadius: "8px",
              background: "white",
            }}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <small>
              {new Date(notification.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}