import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { getImageUrl } from "../config";
import "../styles/ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewRefresh, setReviewRefresh] = useState(0);



  const fetchProduct = () => {
    api
      .get(`products/products/${id}/`)
      .then((response) => {
        setProduct(response.data);
      })
      .catch((error) => {
        console.log("Product Details Error:", error.response?.data || error);
      });
  };

  // 🔓 Allow unauthenticated users to view the page, but redirect on action
  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => {
      if (prev > 1) {
        return prev - 1;
      }
      return 1;
    });
  };

  const addToCart = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      navigate("/profile", { state: { from: `/products/${id}` } });
      return;
    }

    api
      .post("cart/items/", {
        product: product.id,
        quantity: quantity,
      })
      .then(() => {
        alert("Added To Cart Successfully");
        navigate("/cart");
      })
      .catch((error) => {
        console.log("Add Cart Error:", error.response?.data || error);
        alert("Add to cart failed");
      });
  };

  const buyNow = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      navigate("/profile", { state: { from: `/products/${id}` } });
      return;
    }

    navigate("/checkout", {
      state: {
        product: product,
        quantity: quantity,
      },
    });
  };

  const refreshReviews = () => {
    setReviewRefresh((prev) => prev + 1);
  };

  if (!product) {
    return (
      <div className="product-details-container">
        <h2>Loading product...</h2>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <div className="product-details-card">
        <div className="product-details-image-section">
          {product.image ? (
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="product-details-image"
            />
          ) : (
            <div className="product-details-no-image">No Image</div>
          )}
        </div>

        <div className="product-details-info-section">
          <h1 className="product-details-title">{product.name}</h1>

          <p className="product-details-info-text">
            <strong>Brand:</strong> {product.brand || "No brand"}
          </p>

          <p className="product-details-price">₹{product.price}</p>

          <p className="product-details-info-text">
            <strong>Category:</strong> {product.category || "No category"}
          </p>

          <p className="product-details-description">
            {product.description || "No description available"}
          </p>

          <div className="product-details-quantity-box">
            <button onClick={decreaseQuantity} className="product-details-quantity-btn">
              -
            </button>

            <span className="product-details-quantity-text">{quantity}</span>

            <button onClick={increaseQuantity} className="product-details-quantity-btn">
              +
            </button>
          </div>

          <div className="product-details-buttons-row">
            <button onClick={addToCart} className="product-details-cart-btn">
              Add To Cart
            </button>

            <button onClick={buyNow} className="product-details-buy-btn">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <div className="product-details-reviews-section">
        <h2 className="product-details-section-title">Customer Reviews</h2>

        <ReviewList productId={product.id} refreshKey={reviewRefresh} />
      </div>

      <div className="product-details-reviews-section">
        <h2 className="product-details-section-title">Add Your Review</h2>

        <ReviewForm productId={product.id} onReviewAdded={refreshReviews} />
      </div>
    </div>
  );
}