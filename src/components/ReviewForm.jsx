import { useState } from "react";
import api from "../api/axios";

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      return;
    }

    if (!comment.trim()) {
      alert("Please enter your review");
      return;
    }

    api
      .post("reviews/reviews/", {
        product: productId,
        rating: rating,
        comment: comment,
      })
      .then(() => {
        alert("Review added successfully");

        setRating(5);
        setComment("");

        if (onReviewAdded) {
          onReviewAdded();
        }
      })
      .catch((error) => {
        console.log("Review Add Error:", error.response?.data || error);
        alert("Review add failed");
      });
  };

  return (
    <form onSubmit={submitReview} style={formBox}>
      <label style={labelText}>Rating</label>

      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        style={inputBox}
      >
        <option value={5}>5 - Excellent</option>
        <option value={4}>4 - Good</option>
        <option value={3}>3 - Average</option>
        <option value={2}>2 - Poor</option>
        <option value={1}>1 - Bad</option>
      </select>

      <label style={labelText}>Comment</label>

      <textarea
        placeholder="Write your review"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={textArea}
      />

      <button type="submit" style={submitBtn}>
        Submit Review
      </button>
    </form>
  );
}

const formBox = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const labelText = {
  fontSize: "15px",
  fontWeight: "800",
  color: "#111",
};

const inputBox = {
  width: "100%",
  maxWidth: "420px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #ccc",
  fontSize: "15px",
  outline: "none",
};

const textArea = {
  width: "100%",
  maxWidth: "650px",
  minHeight: "120px",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #ccc",
  fontSize: "15px",
  outline: "none",
  resize: "vertical",
};

const submitBtn = {
  width: "170px",
  padding: "13px 18px",
  border: "none",
  borderRadius: "16px",
  background: "#111",
  color: "#fff",
  fontWeight: "900",
  cursor: "pointer",
};