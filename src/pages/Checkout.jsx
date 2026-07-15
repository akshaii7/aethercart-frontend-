import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import "../styles/Checkout.css";

export default function Checkout() {
  const navigate = useNavigate();
  

const location = useLocation();

const cartItems = location.state?.cartItems || [];

const buyNowProduct = location.state?.product || null;
const buyNowQuantity = location.state?.quantity || 1;
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    paymentMethod: "",
  });

  const [errors, setErrors] = useState({});

 
  
const deliveryFee = 199;
const discount = 0;

const isCartCheckout = cartItems.length > 0;

const productPrice = isCartCheckout
  ? cartItems.reduce((sum, item) => sum + Number(item.total_price), 0)
  : Number(buyNowProduct?.price || 0);

const quantity = isCartCheckout
  ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
  : buyNowQuantity;

const totalAmount = productPrice + deliveryFee - discount;


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validateAddress = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter valid 10 digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Enter valid 6 digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToOrderSummary = () => {
    if (validateAddress()) {
      setStep(2);
    }
  };

  const goToPayment = () => {
    setStep(3);
  };

    const placeOrder = async (paymentMethod = formData.paymentMethod) => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }

    if (!buyNowProduct && cartItems.length === 0) {
      alert("No product selected");
      navigate("/products");
      return;
    }

    if (!paymentMethod) {
      setErrors({
        ...errors,
        paymentMethod: "Please select payment method",
      });
      return;
    }

    const deliveryAddress = `${formData.fullName}, ${formData.phone}, ${formData.address}, ${formData.city}, Pincode: ${formData.pincode}, Payment: ${paymentMethod}`;

try {

    if (isCartCheckout) {

        for (const item of cartItems) {

            await api.post("orders/orders/", {
                product: item.product,
                quantity: item.quantity,
                delivery_address: deliveryAddress,
            });

        }

    } else {

        await api.post("orders/orders/", {
            product: buyNowProduct.id,
            quantity: quantity,
            delivery_address: deliveryAddress,
        });

    }

    alert("Order Placed Successfully");
    navigate("/orders");

} catch (error) {

    console.log(error.response?.data || error);
    alert("Order Failed");

}
     
  };

  const payWithRazorpay = () => {
    const token = localStorage.getItem("access");

    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }

   if (!buyNowProduct && !isCartCheckout) {
    alert("No product selected");
    navigate("/products");
    return;
}

    if (!validateAddress()) {
      setStep(1);
      return;
    }

    if (!window.Razorpay) {
      alert("Razorpay script not loaded. Check index.html");
      return;
    }

    api
      .post("payments/create-order/", {
        amount: totalAmount,
      })
      .then((response) => {
        const data = response.data;

        console.log("Razorpay Backend Data:", data);

        if (!data.razorpay_key || !data.razorpay_order_id || !data.amount) {
          alert("Razorpay data missing from backend");
          return;
        }

        const options = {
          key: data.razorpay_key,
          amount: data.amount,
          currency: data.currency || "INR",
          name: "Aether Cart",
          description: "Order Payment",
          order_id: data.razorpay_order_id,

          handler: function (paymentResponse) {
            console.log("Razorpay Payment Response:", paymentResponse);

            api
              .post("payments/verify-payment/", {
                payment_db_id: data.payment_db_id,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
              })
              .then((verifyResponse) => {
                console.log("Payment Verified:", verifyResponse.data);
                alert("Payment Successful");
                placeOrder("Razorpay");
              })
              .catch((error) => {
                console.log("Payment Verify Error Status:", error.response?.status);
                console.log("Payment Verify Error Data:", error.response?.data);
                alert("Payment verification failed");
              });
          },

          prefill: {
            name: formData.fullName,
            contact: formData.phone,
          },

          theme: {
            color: "#2874f0",
          },
        };

        const razorpay = new window.Razorpay(options);

        razorpay.on("payment.failed", function (response) {
          console.log("Payment Failed:", response.error);
          alert("Payment failed");
        });

        razorpay.open();
      })
      .catch((error) => {
        console.log("Razorpay Order Error Status:", error.response?.status);
        console.log("Razorpay Order Error Data:", error.response?.data);
        alert("Unable to start payment");
      });
  };

if (!buyNowProduct && cartItems.length === 0) {
  return (
    <div className="checkout-container" style={{ padding: "30px" }}>
      <h1>Checkout</h1>
      <p>No product selected.</p>
      <button onClick={() => navigate("/products")} className="checkout-btn-small">
        Go To Products
      </button>
    </div>
  );
}

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Aether Cart Checkout</h1>

      <div className="checkout-grid">
        <div>
          <div className="checkout-steps-bar">
            <div className="checkout-step-node">
              <h2 className="checkout-step-number" style={{ color: step >= 1 ? "#2874f0" : "#999" }}>1</h2>
              <p className="checkout-step-label">Address</p>
            </div>

            <div className="checkout-step-node">
              <h2 className="checkout-step-number" style={{ color: step >= 2 ? "#2874f0" : "#999" }}>2</h2>
              <p className="checkout-step-label">Order Summary</p>
            </div>

            <div className="checkout-step-node">
              <h2 className="checkout-step-number" style={{ color: step >= 3 ? "#2874f0" : "#999" }}>3</h2>
              <p className="checkout-step-label">Payment</p>
            </div>
          </div>

          <div className="checkout-section">
            <h2>Delivery Address</h2>

            {step === 1 ? (
              <>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="checkout-input"
                />
                <p className="checkout-error">{errors.fullName}</p>

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="checkout-input"
                />
                <p className="checkout-error">{errors.phone}</p>

                <textarea
                  name="address"
                  placeholder="Full Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="checkout-input"
                  style={{ height: "80px" }}
                />
                <p className="checkout-error">{errors.address}</p>

                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="checkout-input"
                />
                <p className="checkout-error">{errors.city}</p>

                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  className="checkout-input"
                />
                <p className="checkout-error">{errors.pincode}</p>

                <button onClick={goToOrderSummary} className="checkout-btn-primary">
                  Continue
                </button>
              </>
            ) : (
              <>
                <p>
                  <strong>Deliver to:</strong>
                </p>

                <p>
                  <strong>{formData.fullName}</strong>
                </p>

                <p>
                  {formData.address}, {formData.city}, {formData.pincode}
                </p>

                <p>{formData.phone}</p>

                <button onClick={() => setStep(1)} className="checkout-btn-small">
                  Change
                </button>
              </>
            )}
          </div>

        {step >= 2 && (
  <div className="checkout-section">
    <h2>Order Summary</h2>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {isCartCheckout ? (
        cartItems.map((item) => (
          <div key={item.id} className="checkout-summary-item">
            <img
              src={
                item.product_image.startsWith("http")
                  ? item.product_image
                  : `http://127.0.0.1:8000${item.product_image}`
              }
              alt={item.product_name}
            />

            <div className="checkout-summary-item-details">
              <h3>{item.product_name}</h3>
              <p>Qty : {item.quantity}</p>
              <h4>₹{item.total_price}</h4>
            </div>
          </div>
        ))
      ) : (
        <div className="checkout-summary-item">
          <img
            src={
              buyNowProduct.image.startsWith("http")
                ? buyNowProduct.image
                : `http://127.0.0.1:8000${buyNowProduct.image}`
            }
            alt={buyNowProduct.name}
          />

          <div className="checkout-summary-item-details">
            <h3>{buyNowProduct.name}</h3>
            <p>Qty : {quantity}</p>
            <h4>₹{productPrice}</h4>
          </div>
        </div>
      )}

      <p>Delivery by 5-7 working days</p>
    </div>

    {step === 2 && (
      <button onClick={goToPayment} className="checkout-btn-primary">
        Continue
      </button>
    )}
  </div>
)}

          {step >= 3 && (
            <div className="checkout-section">
              <h2>Payment Method</h2>

              <div
                className={`checkout-payment-box ${
                  formData.paymentMethod === "Razorpay" ? "selected" : ""
                }`}
              >
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={formData.paymentMethod === "Razorpay"}
                    onChange={handleChange}
                  />
                  Razorpay / UPI / Card
                </label>

                {formData.paymentMethod === "Razorpay" && (
                  <button onClick={payWithRazorpay} className="checkout-btn-pay">
                    Pay ₹{totalAmount.toFixed(2)}
                  </button>
                )}
              </div>

              <div
                className={`checkout-payment-box ${
                  formData.paymentMethod === "Cash on Delivery" ? "selected" : ""
                }`}
              >
                <label>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === "Cash on Delivery"}
                    onChange={handleChange}
                  />
                  Cash on Delivery
                </label>

                {formData.paymentMethod === "Cash on Delivery" && (
                  <button
                    onClick={() => placeOrder("Cash on Delivery")}
                    className="checkout-btn-pay"
                  >
                    Place Order ₹{totalAmount.toFixed(2)}
                  </button>
                )}
              </div>

              <p className="checkout-error">{errors.paymentMethod}</p>
            </div>
          )}
        </div>

        <div className="checkout-sticky-summary">
          <h2>Price Details</h2>

          <div className="checkout-price-row">
            <span>Price</span>
            <span>₹{productPrice.toFixed(2)}</span>
          </div>

          <div className="checkout-price-row">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>

          <div className="checkout-price-row">
            <span>Delivery Fee</span>
            <span>₹{deliveryFee}</span>
          </div>

          <div className="checkout-price-row">
            <span>Discount</span>
            <span style={{ color: "green" }}>₹{discount}</span>
          </div>

          <hr />

          <div className="checkout-price-row">
            <strong>Total Amount</strong>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>

          <p className="checkout-secure-badge">
            Safe and secure checkout
          </p>
        </div>
      </div>
    </div>
  );
}