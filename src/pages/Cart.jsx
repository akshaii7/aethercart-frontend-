import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

import api from "../api/axios";
import CartItem from "../components/CartItem";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  const navigate = useNavigate();



  const fetchCart = () => {
    api
      .get("cart/items/")
      .then((response) => {
        setCartItems(response.data);
      })
      .catch((error) => {
        console.log(error.response?.data || error);
      });
  };

  const removeCartItem = (id) => {
    api
      .delete(`cart/items/${id}/`)
      .then(() => {
        fetchCart();
      })
      .catch((error) => {
        console.log(error.response?.data || error);
      });
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + Number(item.total_price);
  }, 0);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
  <div className="cart-container">
    <h1 className="cart-title">Shopping Cart</h1>

    {cartItems.length === 0 ? (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Add some products to continue shopping.</p>
      </div>
    ) : (
      <div className="cart-wrapper">

        <div className="cart-items">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              removeCartItem={removeCartItem}
            />
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Items</span>
            <span>{cartItems.length}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="total-row">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

      <button
        className="checkout-btn"
        onClick={() =>
        navigate("/checkout", {
        state: {
        cartItems: cartItems,
      },
    })
  }
>
  Proceed to Checkout
</button>

          <button
            className="continue-btn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>

        </div>

      </div>
    )}
  </div>
);
}