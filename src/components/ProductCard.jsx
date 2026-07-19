import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import api from "../api/axios";
import "../styles/Products.css";

export default function ProductCard({ product }) {
  const getImageUrl = (image) => {
    if (!image) return "https://via.placeholder.com/200";
    if (image.startsWith("http")) return image;
    return `https://aethercart-backend.onrender.com${image}`;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      return;
    }

    api
      .post("cart/items/", {
        product: product.id,
        quantity: 1,
      })
      .then(() => {
        alert("Added To Cart Successfully");
      })
      .catch((error) => {
        console.error("Add Cart Error:", error.response?.data || error);
        alert("Add to cart failed");
      });
  };

  return (
    <div className="product-card">
      {product.image && (
        <div className="product-card-image-wrapper">
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            className="product-card-image"
          />
        </div>
      )}

      <div className="product-card-info">
        <h3 className="product-card-title">{product.name}</h3>
        <div className="product-card-price">₹{Number(product.price).toFixed(2)}</div>
        <p className="product-card-description">
          {product.description || "Premium quality product tailored to your lifestyle."}
        </p>

        <div className="product-card-footer">
          <Link to={`/products/${product.id}`} className="product-card-details-btn">
            View Details
            <ArrowRight size={16} className="product-card-details-arrow" />
          </Link>
          <button
            className="product-card-cart-btn"
            onClick={handleAddToCart}
            title="Add to Cart"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}