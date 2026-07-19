import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { CartContext } from "../context/CartContext";
import api from "../api/axios";

import {
  Home as HomeIcon,
  ShoppingBag,
  ShoppingCart,
  Box,
  Bell,
  User,
  Search,
  Menu,
  X,
} from "lucide-react";

export default function Layout({ children }) {
  const username = localStorage.getItem("username");

  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems?.length || 0;

  const [notificationCount, setNotificationCount] = useState(0);

  // Search
  useEffect(() => {
    if (location.pathname !== "/products") return;

    const timer = setTimeout(() => {
      if (search.trim() === "") {
        navigate("/products", { replace: true });
      } else {
        navigate(
          `/products?search=${encodeURIComponent(search)}`,
          { replace: true }
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, location.pathname, navigate]);

  // Notification Count
  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      setNotificationCount(0);
      return;
    }

    api
      .get("notifications/notifications/")
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setNotificationCount(data.length);
        } else if (data && typeof data.count === "number") {
          setNotificationCount(data.count);
        } else if (data && Array.isArray(data.results)) {
          setNotificationCount(data.results.length);
        } else {
          setNotificationCount(0);
        }
      })
      .catch(() => {
        setNotificationCount(0);
      });
  }, [location.pathname]);


  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="logo-section">
          <a
            className="logo"
            href="/"
            aria-label="ÆTHER CART – go to homepage"
            onClick={(e) => {
              e.preventDefault();
              if (location.pathname === "/") {
                window.location.reload();
              } else {
                navigate("/");
              }
            }}
          >
            ÆTHER <span>CART</span>
          </a>
          <button
            className="sidebar-close-btn"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="side-menu">
          <NavLink
            to="/"
            className="side-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <HomeIcon size={20} />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/products"
            className="side-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <ShoppingBag size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/cart"
            className="side-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <ShoppingCart size={20} />
            <span>Cart</span>

            {cartCount > 0 && (
              <span className="nav-badge">{cartCount}</span>
            )}
          </NavLink>

          <NavLink
            to="/orders"
            className="side-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Box size={20} />
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className="side-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Bell size={20} />
            <span>Notifications</span>

            {notificationCount > 0 && (
              <span className="nav-badge">
                {notificationCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className="side-link"
            onClick={() => setIsSidebarOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-area">

        <div className="topbar">
          <button
            className="menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Search size={18} className="search-icon" />
          </div>

          <div className="top-icons">
            <NavLink to="/profile" className="user-avatar">
              {username
                ? username.charAt(0).toUpperCase()
                : "A"}
            </NavLink>
          </div>

        </div>

        {children}

      </main>
    </div>
  );
}