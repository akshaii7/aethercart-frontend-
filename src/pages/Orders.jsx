import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getImageUrl } from "../config";
import "../styles/Orders.css";

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    const token = localStorage.getItem("access");

    if (!token) return;

    api
      .get("orders/orders/")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log(err.response?.data || err);
      });
  };

  const requestReturn = (orderId) => {
  api
    .post(`orders/orders/${orderId}/request_return/`)
    .then(() => {
      alert("Return request submitted");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, return_status: "requested" }
            : o
        )
      );
    })
    .catch((err) => {
      alert(
        err.response?.data?.error ||
          "Unable to request return"
      );
    });
};

  if (!localStorage.getItem("access")) {
    return (
      <div style={{ padding: "1.25rem" }}>
        <h1>My Orders</h1>
        <p>Please login first.</p>
      </div>
    );
  }

return (
  <div className="orders-page">
    <h1 className="orders-title">My Orders</h1>

    {orders.length === 0 ? (
      <div className="empty-order">
        <p>No orders found.</p>
      </div>
    ) : (
      orders.map((order) => (
        <div key={order.id} className="order-card">
          <h2 className="order-number">Order #{order.id}</h2>

          <p className="order-info">
            <strong>Status:</strong> {order.status}
          </p>

          <p className="order-info">
            <strong>Total:</strong> ₹{order.total_amount}
          </p>

          <p className="order-info">
            <strong>Address:</strong> {order.delivery_address}
          </p>

          <p className="order-info">
            <strong>Date:</strong>{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>

          {order.items?.length > 0 && (
            <>
              <h3 className="products-title">Products</h3>

              {order.items.map((item) => (
                <div key={item.id} className="order-product-card">
                  <img
                    src={getImageUrl(item.product_image)}
                    alt={item.product_name}
                  />

                  <div className="product-details">
                    <h4 className="product-name">
                      {item.product_name}
                    </h4>

                    <p className="product-qty">
                      Qty : {item.quantity}
                    </p>

                    <p className="product-price">
                      ₹{item.price}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          <div className="order-actions">
            <button
              className="track-btn"
              onClick={() => navigate(`/delivery/${order.id}`)}
            >
              Track Delivery
            </button>

            {order.status === "delivered" &&
              order.return_status === "none" && (
                <button
                  className="return-btn"
                  onClick={() => requestReturn(order.id)}
                >
                  Return Product
                </button>
              )}

            {order.return_status === "requested" && (
              <span className="return-status return-requested">
                Return Requested
              </span>
            )}

            {order.return_status === "approved" && (
              <span className="return-status return-approved">
                Return Approved
              </span>
            )}

            {order.return_status === "rejected" && (
              <span className="return-status return-rejected">
                Return Rejected
              </span>
            )}
          </div>
        </div>
      ))
    )}
  </div>
);}