export const BASE_URL = import.meta.env.VITE_API_URL || "https://aethercart-backend.onrender.com";

export const getImageUrl = (imagePath, fallback = "https://via.placeholder.com/300?text=No+Image") => {
  if (!imagePath || imagePath === "null" || imagePath === "undefined") {
    return fallback;
  }

  // Cloudinary direct URL or any full external HTTP/HTTPS link
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Relative path from Django
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }

  return `${BASE_URL}/${imagePath}`;
};