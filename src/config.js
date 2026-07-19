export const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "https://aethercart-backend.onrender.com";

export const getImageUrl = (imagePath, fallback = "https://via.placeholder.com/200") => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath}`;
};
