import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "lucide-react";
import api from "../api/axios";
import { getImageUrl } from "../config";
import "../styles/Products.css";

const FALLBACK_IMAGE = "https://placehold.co/600x400/e2e8f0/1e293b.png?text=No+Image";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    navigate(`/products/${product?.id}`);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      navigate("/profile", { state: { from: `/products/${product?.id}` } });
      return;
    }

    api
      .post("cart/items/", {
        product: product?.id,
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
    <div className="product-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <div className="product-card-image-wrapper">
        <img
          src={getImageUrl(product?.image)}
          alt={product?.name || "Product Image"}
          className="product-card-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>

      <div className="product-card-info">
        <h3 className="product-card-title">{product?.name}</h3>
        <div className="product-card-price">
          ₹{Number(product?.price || 0).toFixed(2)}
        </div>
        <p className="product-card-description">
          {product?.description || "Premium quality product tailored to your lifestyle."}
        </p>

        <div className="product-card-footer">
          <Link
            to={`/products/${product?.id}`}
            className="product-card-details-btn"
          >
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