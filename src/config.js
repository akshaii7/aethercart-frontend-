// ✅ ഈ കോഡ് മാത്രമാണ് config.js-ൽ ഉണ്ടാകാൻ പാടുള്ളൂ
export const BASE_URL = import.meta.env.VITE_API_URL || "https://aethercart-backend.onrender.com";

export const getImageUrl = (imagePath, fallback = "https://via.placeholder.com/200") => {
  if (!imagePath) return fallback;

  // Cloudinary, external links, etc. (ഇവ നേരിട്ട് return ചെയ്യണം)
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Handle relative paths (e.g., '/media/...') with standard backend base URL
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }

  return `${BASE_URL}/${imagePath}`;
};