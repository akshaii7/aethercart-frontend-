
import { getImageUrl } from "../config";
import "../styles/CartItem.css";

export default function CartItem({ item, removeCartItem }) {
  return (
    <div className="cart-card">

      <div className="cart-image">
        <img
          src={getImageUrl(item.product_image)}
          alt={item.product_name}
        />
      </div>

         <div className="cart-details">

        <h2>{item.product_name}</h2>

        <p className="price">

          ₹{item.product_price}

        </p>

        <p className="quantity">

          Quantity: <strong>{item.quantity}</strong>

        </p>

        <p className="total">

          Total: <strong>₹{item.total_price}</strong>

        </p>

      </div>

      <div className="cart-actions">

        <button

          className="remove-btn"

          onClick={() => removeCartItem(item.id)}

        >

          Remove

        </button>

      </div>

    </div>

  );

}