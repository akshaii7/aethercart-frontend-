export const BASE_URL = import.meta.env.VITE_API_URL || "https://aethercart-backend.onrender.com";

export const getImageUrl = (imagePath, fallback = "https://via.placeholder.com/200") => {
  if (!imagePath) return fallback;

  // Return full URLs directly (Cloudinary, external links, etc.)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Handle relative media paths with standard backend base URL
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }

  return `${BASE_URL}/${imagePath}`;
};