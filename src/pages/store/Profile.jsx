import { useState, useEffect } from "react";
import { UserRound, Heart, ShoppingCart, Package } from "lucide-react";
import authService from "../../features/auth/authService.js";
import wishlistService from "../../services/wishlistService.js";

import StoreFooter from "./StoreFooter";
import StoreNavbar from "./StoreNavbar";
import "../../styles/profile.css";

function Profile() {
  const [activeSection, setActiveSection] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);

        const response = await authService.getCurrentUser();

        const user = response.data?.user || null;

        setProfile(user);

        if (user) {
          setFormData({
            fullName: user.fullName || "",
            phoneNumber: user.phoneNumber || "",
          });
        }
      } catch (error) {
        setProfileError(
          error.response?.data?.message || "Unable to load your profile.",
        );
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);
      setUpdateError("");
      setUpdateSuccess("");

      const response = await authService.updateProfile(formData);
      const updatedUser = response.data?.user;

      if (updatedUser) {
        setProfile(updatedUser);
        setFormData({
          fullName: updatedUser.fullName || "",
          phoneNumber: updatedUser.phoneNumber || "",
        });
      }

      setIsEditing(false);
      setUpdateSuccess("Profile updated successfully!");
    } catch (error) {
      setUpdateError(
        error.response?.data?.message || "Unable to update your profile.",
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setWishlistLoading(true);
      setWishlistError("");

      const response = await wishlistService.getWishlist();

      setWishlist(response.data?.wishlist || []);
    } catch (error) {
      setWishlistError(
        error.response?.data?.message || "Unable to load your wishlist.",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const menuItems = [
    { id: "profile", label: "My Profile", icon: UserRound },
    { id: "wishlist", label: "My Wishlist", icon: Heart },
    // { id: "cart", label: "My Cart", icon: ShoppingCart },
    { id: "orders", label: "My Orders", icon: Package },
  ];

  return (
    <>
      <StoreNavbar />

      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-heading">
            <span>GAMERSHUB ACCOUNT</span>
            <h1>My Account</h1>
            <p>Manage your profile, wishlist, cart and orders.</p>
          </div>

          <div className="profile-dashboard">
            <aside className="profile-sidebar">
              <div className="profile-sidebar-heading">
                <span>ACCOUNT MENU</span>
              </div>

              <nav className="profile-sidebar-nav">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      className={`profile-sidebar-link ${
                        activeSection === item.id ? "active" : ""
                      }`}
                      onClick={() => {
                        setActiveSection(item.id);

                        if (item.id === "wishlist") {
                          fetchWishlist();
                        }
                      }}
                    >
                      <Icon size={19} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <section className="profile-content">
              <h2>
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>

              {activeSection === "profile" && (
                <>
                  {profileLoading ? (
                    <p>Loading your profile...</p>
                  ) : profileError ? (
                    <p className="profile-error">{profileError}</p>
                  ) : profile ? (
                    <>
                      {isEditing ? (
                        <form
                          className="profile-edit-form"
                          onSubmit={handleProfileUpdate}
                        >
                          <div className="profile-detail-item">
                            <label htmlFor="fullName">Full Name</label>
                            <input
                              id="fullName"
                              type="text"
                              value={formData.fullName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fullName: e.target.value,
                                })
                              }
                              required
                            />
                          </div>

                          <div className="profile-detail-item">
                            <label htmlFor="phoneNumber">Phone Number</label>
                            <input
                              id="phoneNumber"
                              type="tel"
                              value={formData.phoneNumber}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  phoneNumber: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="profile-edit-actions">
                            <button type="submit" disabled={updateLoading}>
                              {updateLoading ? "Saving..." : "Save Changes"}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(false);
                                setUpdateError("");
                                setFormData({
                                  fullName: profile.fullName || "",
                                  phoneNumber: profile.phoneNumber || "",
                                });
                              }}
                            >
                              Cancel
                            </button>
                          </div>

                          {updateError && (
                            <p className="profile-error">{updateError}</p>
                          )}
                        </form>
                      ) : (
                        <>
                          <div className="profile-details">
                            <div className="profile-detail-item">
                              <span>Full Name</span>
                              <strong>{profile.fullName}</strong>
                            </div>

                            <div className="profile-detail-item">
                              <span>Email Address</span>
                              <strong>{profile.email}</strong>
                            </div>

                            <div className="profile-detail-item">
                              <span>Phone Number</span>
                              <strong>
                                {profile.phoneNumber || "Not added"}
                              </strong>
                            </div>
                          </div>

                          <button
                            className="profile-edit-button"
                            onClick={() => {
                              setUpdateSuccess("");
                              setUpdateError("");
                              setIsEditing(true);
                            }}
                          >
                            Edit Profile
                          </button>
                        </>
                      )}

                      {updateSuccess && (
                        <p className="profile-success">{updateSuccess}</p>
                      )}
                    </>
                  ) : (
                    <p>Profile information is unavailable.</p>
                  )}
                </>
              )}

              {activeSection === "wishlist" && (
                <div className="wishlist-section">
                  {wishlistLoading ? (
                    <p>Loading your wishlist...</p>
                  ) : wishlistError ? (
                    <p className="profile-error">{wishlistError}</p>
                  ) : wishlist.length === 0 ? (
                    <div className="wishlist-empty">
                      <Heart size={36} />
                      <h3>Your wishlist is empty</h3>
                      <p>Save games from the store to find them here.</p>
                    </div>
                  ) : (
                    <div className="wishlist-grid">
                      {wishlist.map((game) => (
                        <div className="wishlist-card" key={game._id}>
                          <img src={game.coverImage} alt={game.title} />

                          <div className="wishlist-card-content">
                            <h3>{game.title}</h3>

                            <p>{game.shortDescription}</p>

                            <strong>
                              ₹
                              {(game.discountPrice < game.price
                                ? game.discountPrice
                                : game.price
                              ).toLocaleString("en-IN")}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeSection === "cart" && <p>We'll build your cart next.</p>}

              {activeSection === "orders" && (
                <p>We'll build your order history next.</p>
              )}
            </section>
          </div>
        </div>
      </main>

      <StoreFooter />
    </>
  );
}

export default Profile;
