import { useState } from "react";
import api from "../api/axios";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  if (!isOpen) return null;

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const loginUser = () => {
    if (!loginData.username || !loginData.password) {
      alert("Please enter username and password");
      return;
    }

    api
      .post("accounts/token/", loginData)
      .then((response) => {
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
        localStorage.setItem("username", loginData.username);

        alert("Login Successful");

        if (onLoginSuccess) {
          onLoginSuccess();
        }

        onClose();
      })
      .catch((error) => {
        console.log("Login Error:", error.response?.data || error);
        alert("Invalid username or password");
      });
  };

  const registerUser = () => {
    if (!registerData.username || !registerData.email || !registerData.password) {
      alert("Username, email and password are required");
      return;
    }

    api
      .post("accounts/register/", registerData)
      .then(() => {
        alert("Registration Successful. Please login now.");
        setIsRegister(false);
      })
      .catch((error) => {
        console.log("Register Error:", error.response?.data || error);

        const data = error.response?.data;
        if (data) {
          // Collect all field-level error messages from DRF
          const messages = Object.entries(data)
            .map(([field, msgs]) => {
              const msgList = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
              return `${field}: ${msgList}`;
            })
            .join("\n");
          alert("Registration failed:\n" + messages);
        } else {
          alert("Registration failed. Please check your connection and try again.");
        }
      });
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButton}>
          ×
        </button>

        <div style={headerBox}>
          <h2>{isRegister ? "Create Account" : "Login"}</h2>
          <p>
            {isRegister
              ? "Register to continue shopping"
              : "Login to access your orders and cart"}
          </p>
        </div>

        <div style={formBox}>
          {!isRegister ? (
            <form onSubmit={(e) => { e.preventDefault(); loginUser(); }}>
              <input
                key="login-username"
                type="text"
                name="username"
                placeholder="Username"
                value={loginData.username}
                onChange={handleLoginChange}
                style={inputStyle}
                autoComplete="username"
              />

              <input
                key="login-password"
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                style={inputStyle}
                autoComplete="current-password"
              />

              <button type="submit" style={mainButton}>
                Login
              </button>

              <p style={bottomText}>
                New user?{" "}
                <span onClick={() => setIsRegister(true)} style={linkStyle}>
                  Register here
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); registerUser(); }}>
              <input
                key="register-username"
                type="text"
                name="username"
                placeholder="Username"
                value={registerData.username}
                onChange={handleRegisterChange}
                style={inputStyle}
                autoComplete="username"
              />

              <input
                key="register-email"
                type="email"
                name="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                style={inputStyle}
                autoComplete="email"
              />

              <input
                key="register-password"
                type="password"
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleRegisterChange}
                style={inputStyle}
                autoComplete="new-password"
              />

              <input
                key="register-phone"
                type="text"
                name="phone"
                placeholder="Phone"
                value={registerData.phone}
                onChange={handleRegisterChange}
                style={inputStyle}
                autoComplete="tel"
              />

              <input
                key="register-address"
                type="text"
                name="address"
                placeholder="Address"
                value={registerData.address}
                onChange={handleRegisterChange}
                style={inputStyle}
                autoComplete="street-address"
              />

              <button type="submit" style={mainButton}>
                Register
              </button>

              <p style={bottomText}>
                Already registered?{" "}
                <span onClick={() => setIsRegister(false)} style={linkStyle}>
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modalStyle = {
  width: "90%",
  maxWidth: "420px",
  background: "white",
  borderRadius: "14px",
  overflow: "hidden",
  position: "relative",
  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
};

const closeButton = {
  position: "absolute",
  top: "10px",
  right: "15px",
  background: "transparent",
  border: "none",
  fontSize: "28px",
  cursor: "pointer",
  color: "white",
};

const headerBox = {
  background: "#000000",
  color: "white",
  padding: "30px",
};

const formBox = {
  padding: "30px",
};

const inputStyle = {
  width: "100%",
  padding: "13px",
  marginBottom: "15px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  outline: "none",
  fontSize: "15px",
};

const mainButton = {
  width: "100%",
  padding: "13px",
  background: "#de1212",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "16px",
};

const bottomText = {
  textAlign: "center",
  marginTop: "20px",
};

const linkStyle = {
  color: "#2874f0",
  fontWeight: "bold",
  cursor: "pointer",
};