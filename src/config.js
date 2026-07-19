export const BASE_URL = import.meta.env.VITE_API_URL || "https://aethercart-backend.onrender.com";

export const getImageUrl = (imagePath, fallback = "https://via.placeholder.com/200") => {
  if (!imagePath) return fallback;
  if (imagePath.startsWith("http")) return imagePath;
  return `${BASE_URL}${imagePath}`;
};
