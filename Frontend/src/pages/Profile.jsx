import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthModal from "../components/AuthModal";
import { getImageUrl } from "../config";
import "../styles/profile.css";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit2,
  Plus,
  MoreVertical,
  Package,
  CheckCircle,
  Crown,
  LogOut
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("access") ? true : false
  );

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profile_image_url: "",
    created_at: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  // Frontend-only fields stored in state & synced with localStorage
  const [username, setUsername] = useState(
    localStorage.getItem("profile_username") || localStorage.getItem("username") || "akshaii17"
  );
  const [dob, setDob] = useState(
    localStorage.getItem("profile_dob") || "17 May 2001"
  );
  const [gender, setGender] = useState(
    localStorage.getItem("profile_gender") || "Male"
  );

  // Address list management
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem("profile_addresses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [
      {
        id: "addr-1",
        type: "Home",
        isDefault: true,
        name: "Akshaii",
        line1: "Akshaii's Home, Triavndrum",
        line2: "Trivandrum, Kerala - 695001",
        country: "India",
        phone: "9846988251"
      }
    ];
  });

  const [activeAddressMenuId, setActiveAddressMenuId] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: "Home",
    name: "",
    line1: "",
    line2: "",
    country: "",
    phone: "",
    isDefault: false
  });

  // Recent orders list
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProfile();
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const getProfileImageUrl = (data) => {
    // Always pass through getImageUrl so Render /media/ URLs get rewritten to GitHub CDN
    const raw = data?.profile_image_url || data?.profile_image;
    return getImageUrl(raw);
  };

  const fetchProfile = () => {
    const token = localStorage.getItem("access");
    const usernameFromStorage = localStorage.getItem("username");

    if (!token) {
      setLoading(false);
      setIsLoggedIn(false);
      return;
    }

    setLoading(true);

    api
      .get("accounts/profiles/")
      .then((response) => {
        let currentProfile = null;

        if (Array.isArray(response.data)) {
          currentProfile =
            response.data.find(
              (item) =>
                item.name === usernameFromStorage ||
                item.email === usernameFromStorage ||
                item.user?.username === usernameFromStorage
            ) || response.data[0];
        } else {
          currentProfile = response.data;
        }

        if (!currentProfile) {
          setLoading(false);
          return;
        }

        const imageUrl = getProfileImageUrl(currentProfile);

        setProfileId(currentProfile.id);

        setProfile({
          name: currentProfile.name || "",
          email: currentProfile.email || "",
          phone: currentProfile.phone || "",
          address: currentProfile.address || "",
          profile_image_url: imageUrl,
          created_at: currentProfile.created_at || "",
        });

        setPreviewImage(imageUrl);

        // Sync username if local storage doesn't have custom one
        if (!localStorage.getItem("profile_username")) {
          const fetchedUsername = currentProfile.name || usernameFromStorage || "user";
          setUsername(fetchedUsername);
          localStorage.setItem("profile_username", fetchedUsername);
        }

        if (currentProfile.name) {
          localStorage.setItem("username", currentProfile.name);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log("Profile Error Status:", error.response?.status);
        console.log("Profile Error Data:", error.response?.data);

        if (error.response?.status === 401) {
          logoutWithoutAlert();
        }

        setLoading(false);
      });
  };

  const fetchOrders = () => {
    api
      .get("orders/orders/")
      .then((res) => {
        // Sort orders by date descending and take top 3
        const sorted = (res.data || []).sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setRecentOrders(sorted.slice(0, 3));
      })
      .catch((err) => {
        console.log("Activity/Orders Fetch Error:", err);
      });
  };

  const handleChange = (e) => {
    if (!isEditing) return;

    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    if (!isEditing) return;

    const file = e.target.files[0];

    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const updateProfile = () => {
    if (!profileId) {
      alert("Profile not found");
      return;
    }

    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    formData.append("phone", profile.phone);
    formData.append("address", profile.address);

    if (profileImage) {
      formData.append("profile_image", profileImage);
    }

    api
      .patch(`accounts/profiles/${profileId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        const data = response.data;
        const imageUrl = getProfileImageUrl(data);

        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          profile_image_url: imageUrl,
          created_at: data.created_at || "",
        });

        setPreviewImage(imageUrl);
        setProfileImage(null);
        setIsEditing(false);

        // Update local storage fields
        localStorage.setItem("profile_username", username);
        localStorage.setItem("profile_dob", dob);
        localStorage.setItem("profile_gender", gender);

        if (data.name) {
          localStorage.setItem("username", data.name);
        }

        alert("Profile updated successfully");
      })
      .catch((error) => {
        console.log("Update Profile Error Status:", error.response?.status);
        console.log("Update Profile Error Data:", error.response?.data);
        alert("Profile update failed");
      });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setProfileImage(null);
    setUsername(localStorage.getItem("profile_username") || localStorage.getItem("username") || "akshaii17");
    setDob(localStorage.getItem("profile_dob") || "17 May 2001");
    setGender(localStorage.getItem("profile_gender") || "Male");
    fetchProfile();
  };

  const logoutWithoutAlert = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    localStorage.removeItem("profileId");
    localStorage.removeItem("profile_username");
    localStorage.removeItem("profile_dob");
    localStorage.removeItem("profile_gender");

    setIsLoggedIn(false);
    setIsEditing(false);
    setProfileId(null);
    setProfileImage(null);
    setPreviewImage("");

    setProfile({
      name: "",
      email: "",
      phone: "",
      address: "",
      profile_image_url: "",
      created_at: "",
    });
  };

  const logout = () => {
    logoutWithoutAlert();
    alert("Logged out successfully");
  };

  const handleLoginSuccess = () => {
    setShowAuthModal(false);
    setIsLoggedIn(true);
  };

  // Address logic
  const handleSetDefaultAddress = (id) => {
    const updated = addresses.map((addr) => {
      if (addr.id === id) {
        setProfile((prev) => ({
          ...prev,
          address: `${addr.line1}, ${addr.line2}, ${addr.country}`
        }));
        return { ...addr, isDefault: true };
      }
      return { ...addr, isDefault: false };
    });
    setAddresses(updated);
    localStorage.setItem("profile_addresses", JSON.stringify(updated));
    setActiveAddressMenuId(null);
  };

  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    if (addresses.find((addr) => addr.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
      setProfile((prev) => ({
        ...prev,
        address: `${updated[0].line1}, ${updated[0].line2}, ${updated[0].country}`
      }));
    }
    setAddresses(updated);
    localStorage.setItem("profile_addresses", JSON.stringify(updated));
    setActiveAddressMenuId(null);
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.line1 || !newAddress.country || !newAddress.phone) {
      alert("Please fill in all required fields.");
      return;
    }
    const id = "addr-" + Date.now();
    const addressItem = {
      id,
      type: newAddress.type,
      isDefault: newAddress.isDefault || addresses.length === 0,
      name: newAddress.name,
      line1: newAddress.line1,
      line2: newAddress.line2,
      country: newAddress.country,
      phone: newAddress.phone
    };

    let updated = [...addresses];
    if (addressItem.isDefault) {
      updated = updated.map((addr) => ({ ...addr, isDefault: false }));
      setProfile((prev) => ({
        ...prev,
        address: `${addressItem.line1}, ${addressItem.line2}, ${addressItem.country}`
      }));
    }
    updated.push(addressItem);
    setAddresses(updated);
    localStorage.setItem("profile_addresses", JSON.stringify(updated));
    setShowAddressModal(false);
    setNewAddress({
      type: "Home",
      name: "",
      line1: "",
      line2: "",
      country: "",
      phone: "",
      isDefault: false
    });
  };

  // Helper selectors / info parsers
  const getJoinedDate = () => {
    if (profile.created_at) {
      try {
        const date = new Date(profile.created_at);
        return `Joined on ${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`;
      } catch (e) {
        // ignore
      }
    }
    return "Joined on Jan 2024";
  };

  const getLocation = () => {
    if (profile.address) {
      const parts = profile.address.split(",");
      if (parts.length >= 3) {
        return parts.slice(-3).join(",").trim();
      }
      return profile.address;
    }
    return "Trivandrum, Kerala, India";
  };

  const calculateCompleteness = () => {
    const fields = [
      profile.name,
      username,
      profile.email,
      profile.phone,
      profile.address,
      dob,
      gender,
      previewImage
    ];
    const filled = fields.filter((f) => f && f.toString().trim() !== "").length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  // Mock order list if real history is empty
  const defaultMockOrders = [
    { id: "ORD12345", status: "delivered", time: "2 days ago" },
    { id: "ORD12344", status: "shipped", time: "5 days ago" },
    { id: "ORD12343", status: "processing", time: "1 week ago" }
  ];

  const getRelativeTime = (dateStr) => {
    try {
      const diffMs = new Date() - new Date(dateStr);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      return `${diffDays} days ago`;
    } catch (e) {
      return "Recently";
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <p>Manage your personal information and account settings.</p>
          </div>

          <div className="profile-card" style={{ padding: "48px", textAlign: "center" }}>
            <p style={{ marginBottom: "24px", color: "#6b7280", fontSize: "15px" }}>
              Please login to view and manage your profile details.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="save-changes-btn"
              style={{ padding: "12px 32px" }}
            >
              Login / Sign Up
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Loading profile details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Page Header */}
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account settings.</p>
      </div>

      <div className="profile-grid-top">
        {/* Left Side Profile Card */}
        <div className="profile-card left-profile-card">
          <div className="profile-card-banner"></div>
          
          <div className="profile-avatar-container">
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-placeholder">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
              </div>
            )}
            {isEditing && (
              <label htmlFor="profileImage" className="avatar-edit-trigger">
                <Camera size={15} />
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          <div className="profile-summary-details">
            <h2>{profile.name || "Aether User"}</h2>
            <div className="profile-summary-username">@{username || "username"}</div>
            
            <div className="premium-badge">
              <Crown size={12} />
              <span>Premium Member</span>
            </div>

            <hr className="profile-summary-divider" />

            <div className="profile-contact-list">
              <div className="profile-contact-item">
                <Mail size={16} />
                <span>{profile.email || "No email address"}</span>
              </div>
              <div className="profile-contact-item">
                <Phone size={16} />
                <span>{profile.phone || "No phone number"}</span>
              </div>
              <div className="profile-contact-item">
                <MapPin size={16} />
                <span>{getLocation()}</span>
              </div>
              <div className="profile-contact-item">
                <Calendar size={16} />
                <span>{getJoinedDate()}</span>
              </div>
            </div>

            <button onClick={logout} className="view-history-btn" style={{ marginTop: '24px', borderColor: '#fee2e2', color: '#ef4444' }}>
              <LogOut size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Logout Account
            </button>
          </div>
        </div>

        {/* Right Side Personal Info Card */}
        <div className="profile-card personal-info-card">
          <div className="personal-info-header">
            <h2>Personal Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                <Edit2 size={13} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Full Name"
              />
            </div>

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={!isEditing}
                placeholder="username"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Email Address"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <div className="input-with-icon">
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Date of Birth"
                />
                <Calendar className="input-icon-right" size={16} />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Phone Number"
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!isEditing}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Completeness Banner */}
          <div className="completeness-alert">
            <CheckCircle size={18} />
            <span>Your profile is {completeness}% complete</span>
          </div>

          {isEditing && (
            <div className="form-actions-row">
              <button onClick={updateProfile} className="save-changes-btn">
                Save Changes
              </button>
              <button onClick={cancelEdit} className="cancel-edit-btn">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid: Saved Addresses and Recent Activity */}
      <div className="profile-grid-bottom">
        {/* Saved Addresses Card */}
        <div className="section-card">
          <div>
            <div className="section-header">
              <h2>Saved Addresses</h2>
              <span className="view-all-link" onClick={() => navigate("/checkout")}>View All</span>
            </div>

            <div className="section-body">
              {addresses.length === 0 ? (
                <p style={{ color: "#6b7280", fontSize: "14px" }}>No addresses saved yet.</p>
              ) : (
                addresses.map((addr) => (
                  <div className="address-card" key={addr.id}>
                    <div className="address-icon-container">
                      <MapPin size={18} />
                    </div>
                    
                    <div className="address-details">
                      <div className="address-title-row">
                        <span className="address-title">{addr.type}</span>
                        {addr.isDefault && (
                          <span className="default-address-badge">Default</span>
                        )}
                      </div>
                      <div className="address-text">
                        <strong>{addr.name}</strong><br />
                        {addr.line1}<br />
                        {addr.line2 && <>{addr.line2}<br /></>}
                        {addr.country}
                      </div>
                      <div className="address-phone">Phone: {addr.phone}</div>
                    </div>

                    <div className="address-actions address-dropdown-container">
                      <button
                        className="address-menu-btn"
                        onClick={() =>
                          setActiveAddressMenuId(
                            activeAddressMenuId === addr.id ? null : addr.id
                          )
                        }
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeAddressMenuId === addr.id && (
                        <div className="address-dropdown-menu">
                          {!addr.isDefault && (
                            <button
                              className="address-dropdown-item"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            className="address-dropdown-item delete"
                            onClick={() => handleDeleteAddress(addr.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button onClick={() => setShowAddressModal(true)} className="add-address-btn">
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
        </div>






        {/* Recent Activity Card */}
        <div className="section-card">
          <div>
            <div className="section-header">
              <h2>Recent Activity</h2>
              <span className="view-all-link" onClick={() => navigate("/orders")}>View All</span>
            </div>

            <div className="section-body">
              <div className="activity-list">
                {recentOrders.length > 0 ? (
                  recentOrders.map((ord) => (
                    <div className="activity-item" key={ord.id}>
                      <div className="activity-left">
                        <div className="activity-icon-container">
                          <Package size={18} />
                        </div>
                        <div className="activity-info">
                          <h3>Order #{ord.id}</h3>
                          <div className="activity-badge-container">
                            <span className={`activity-badge ${ord.status?.toLowerCase()}`}>
                              {ord.status?.charAt(0).toUpperCase() + ord.status?.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-time">{getRelativeTime(ord.created_at)}</div>
                    </div>
                  ))
                ) : (
                  // Fallback to mockup items if user has no order history yet
                  defaultMockOrders.map((ord, idx) => (
                    <div className="activity-item" key={idx}>
                      <div className="activity-left">
                        <div className="activity-icon-container">
                          <Package size={18} />
                        </div>
                        <div className="activity-info">
                          <h3>Order #{ord.id}</h3>
                          <div className="activity-badge-container">
                            <span className={`activity-badge ${ord.status}`}>
                              {ord.status.charAt(0).toUpperCase() + ord.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="activity-time">{ord.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button onClick={() => navigate("/orders")} className="view-history-btn">
            View Order History
          </button>
        </div>
      </div>


      

      {/* Add Address Modal Dialog */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Address</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Address Type (e.g. Home, Work)</label>
                <select
                  value={newAddress.type}
                  onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  placeholder="Full Name"
                />
              </div>

              <div className="form-group">
                <label>Address Line 1 *</label>
                <input
                  type="text"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  placeholder="Street address, P.O. box, company name"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={newAddress.line2}
                  onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                  placeholder="Apartment, suite, unit, building, floor, etc."
                />
              </div>

              <div className="form-grid" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>Country *</label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    placeholder="Country"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    placeholder="Phone number for delivery"
                  />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  style={{ width: "auto", cursor: "pointer" }}
                />
                <label htmlFor="defaultAddressCheckbox" style={{ fontSize: "14px", color: "#4b5563", cursor: "pointer", fontWeight: "normal" }}>
                  Set as default address
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-btn-secondary" onClick={() => setShowAddressModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-primary" onClick={handleAddAddress}>
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
