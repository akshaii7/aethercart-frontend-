import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "../styles/DeliveryTracking.css";

export default function DeliveryTracking() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("delivery/deliveries/")
      .then((response) => {
        const foundDelivery = response.data.find(
          (item) => Number(item.order) === Number(id)
        );

        setDelivery(foundDelivery || null);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Delivery Error:", error.response?.data || error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <h2>Loading delivery details...</h2>;
  }

  if (!delivery) {
    return (
      <div>
        <h1>Delivery Tracking</h1>
        <p>No delivery details found for Order #{id}</p>
        <p>Admin must create delivery for this order first.</p>
      </div>
    );
  }

  return (
  <div className="tracking-page">
    <div className="tracking-card">

      <div className="tracking-header">
        <div>
          <h2>Order #{delivery.order}</h2>
          <p>{delivery.status}</p>
        </div>

        <span className={`status ${delivery.status.toLowerCase()}`}>
          {delivery.status}
        </span>
      </div>

      {/* Progress */}

      <div className="tracking-progress">

        <div className="step active">
          <div className="circle">✓</div>
          <p>Order Placed</p>
        </div>

        <div className="line"></div>

        <div className={`step ${["Confirmed","Shipped","Out for Delivery","Delivered"].includes(delivery.status) ? "active" : ""}`}>
          <div className="circle">✓</div>
          <p>Confirmed</p>
        </div>

        <div className="line"></div>

        <div className={`step ${["Shipped","Out for Delivery","Delivered"].includes(delivery.status) ? "active" : ""}`}>
          <div className="circle">🚚</div>
          <p>Shipped</p>
        </div>

        <div className="line"></div>

        <div className={`step ${["Out for Delivery","Delivered"].includes(delivery.status) ? "active" : ""}`}>
          <div className="circle">📦</div>
          <p>Out For Delivery</p>
        </div>

        <div className="line"></div>

        <div className={`step ${delivery.status === "Delivered" ? "active" : ""}`}>
          <div className="circle">🏠</div>
          <p>Delivered</p>
        </div>

      </div>

      <div className="tracking-body">

        <div className="left">

          <h3>Delivery Details</h3>

          <div className="detail-card">

            <div className="detail">
              <h4>Driver</h4>
              <p>{delivery.driver || "Not Assigned"}</p>
            </div>

            <div className="detail">
              <h4>Current Location</h4>
              <p>{delivery.current_location || "Waiting for Update"}</p>
            </div>

          </div>

        </div>

        <div className="right">

          <div className="info-card">

            <h3>Delivery Status</h3>

            <p>
              <strong>Status :</strong> {delivery.status}
            </p>

            <p>
              <strong>Delivered At :</strong>
            </p>

            <p>{delivery.delivered_at || "Not Delivered Yet"}</p>

          </div>

        </div>

      </div>

    </div>
  </div>
)};