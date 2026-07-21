import "../styles/Home.css";
import { useNavigate } from "react-router-dom";
import heroBanner from "../assets/hero-banner.jpg";
import {
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="hero-content">

          <span className="badge">
            <Star size={16} fill="#4F8EF7" color="#4F8EF7" />
            <span>Best Quality Products</span>
          </span>

          <h1>
            Elevate Your <br />
            Lifestyle with <br />
            <span>ÆTHER CART</span>
          </h1>

          <p>
            Discover amazing products with
            <br />
            best quality and best price.
          </p>

          <button
            className="shop-btn"
            onClick={() => navigate("/products")}
          >
           
  Shop Now
  <ArrowRight className="shop-arrow" />
</button>

        </div>

        {/* Hero Image */}
        <div className="hero-image">
         <img src={heroBanner} alt="Hero Banner" />
        </div>
      </section>

      <section className="hero-features">

        <div className="feature">
          <Truck size={34} color="#4F8EF7" />
          <div>
            <h4>Free Delivery</h4>
            <p>On all orders</p>
          </div>
        </div>

        <div className="feature">
          <ShieldCheck size={34} color="#4F8EF7" />
          <div>
            <h4>Secure Payment</h4>
            <p>100% Secure</p>
          </div>
        </div>

        <div className="feature">
          <RotateCcw size={34} color="#4F8EF7" />
          <div>
            <h4>Easy Returns</h4>
            <p>30 days return</p>
          </div>
        </div>

        <div className="feature">
          <Headphones size={34} color="#4F8EF7" />
          <div>
            <h4>24/7 Support</h4>
            <p>Dedicated Support</p>
          </div>
        </div>

      </section>
    </>
  );
}