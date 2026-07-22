export const BASE_URL = import.meta.env.VITE_API_URL || "https://aethercart-backend.onrender.com";

// SSL/TLS പ്രശ്നങ്ങൾ ഇല്ലാത്ത പുതിയ Placeholder URL
const FALLBACK_IMAGE = "https://placehold.co/600x400/e2e8f0/1e293b.png?text=No+Image";

export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === "null" || imagePath === "undefined") {
    return FALLBACK_IMAGE;
  }

  // Cloudinary direct URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Relative path from Django local media
  if (imagePath.startsWith("/")) {
    return `${BASE_URL}${imagePath}`;
  }

  return `${BASE_URL}/${imagePath}`;
};