import { useEffect, useState } from "react";
import api from "../api/axios";

export default function ReviewList({ productId, refreshKey }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshKey]);

  const fetchReviews = () => {
    api
      .get(`reviews/reviews/?product=${productId}`)
      .then((response) => {
        setReviews(response.data);
      })
      .catch((error) => {
        console.log("Review List Error:", error.response?.data || error);
      });
  };

  if (reviews.length === 0) {
    return <p style={emptyText}>No reviews yet.</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <div key={review.id} style={reviewCard}>
          <h3 style={customerName}>
            {review.customer_name || "Customer"}
          </h3>

          <p style={ratingText}>
            <strong>Rating:</strong> ⭐ {review.rating}
          </p>

          <p style={commentText}>
            <strong>Comment:</strong> {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}

const reviewCard = {
  padding: "18px 0",
  borderBottom: "1px solid #ccc",
};

const customerName = {
  fontSize: "18px",
  fontWeight: "900",
  marginBottom: "10px",
  color: "#111",
};

const ratingText = {
  fontSize: "16px",
  marginBottom: "10px",
  color: "#111",
};

const commentText = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#222",
};

const emptyText = {
  fontSize: "16px",
  color: "#555",
};