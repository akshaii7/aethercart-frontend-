export const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// GitHub raw CDN: images committed to the backend repo are served from here
// Render's free tier doesn't serve /media/ files reliably, but GitHub does
const GITHUB_MEDIA_BASE = "https://raw.githubusercontent.com/akshaii7/aethercart-backend/main";

export const getImageUrl = (imagePath, fallback = "https://via.placeholder.com/200") => {
  if (!imagePath) return fallback;

  // If it's a full Render media URL, rewrite to GitHub raw URL
  if (imagePath.includes("aethercart-backend.onrender.com/media/")) {
    return imagePath.replace(
      "https://aethercart-backend.onrender.com/media/",
      `${GITHUB_MEDIA_BASE}/media/`
    );
  }

  // If it's a relative /media/ path, rewrite to GitHub raw
  if (imagePath.startsWith("/media/")) {
    return `${GITHUB_MEDIA_BASE}${imagePath}`;
  }

  // Already an absolute URL (e.g. Cloudinary, S3, etc.)
  if (imagePath.startsWith("http")) return imagePath;

  return `${BASE_URL}${imagePath}`;
};

