export default function NotificationList({ notifications }) {
  return (
    <div>
      {notifications.length === 0 ? (
        <p>No notifications</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id}>
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>

            {notification.created_at && (
              <p>
                <small>
                  {new Date(notification.created_at).toLocaleString()}
                </small>
              </p>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}