import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../features/auth/authThunks.js";
import cartService from "../../services/cartService.js";
import { setCartCount, resetCartCount } from "../../features/cart/cartSlice.js";

function StoreNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.cartCount);

  useEffect(() => {
    let isActive = true;

    const loadCartCount = async () => {
      if (!isAuthenticated) {
        dispatch(resetCartCount());
        return;
      }

      try {
        const response = await cartService.getCart();

        if (isActive) {
          dispatch(setCartCount(response.data?.cartCount || 0));
        }
      } catch (error) {
        console.error("Unable to fetch cart count:", error);
      }
    };

    loadCartCount();

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      setProfileMenuOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="store-navbar">
      <div className="store-navbar-container">
        <Link to="/" className="store-logo" onClick={closeMenu}>
          <span className="store-logo-icon">G</span>
          <span>
            GAMERS<span className="store-logo-highlight">HUB</span>
          </span>
        </Link>

        <nav className={`store-nav-links ${menuOpen ? "active" : ""}`}>
          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>
          <NavLink to="/store" onClick={closeMenu}>
            Store
          </NavLink>
          <NavLink to="/categories" onClick={closeMenu}>
            Categories
          </NavLink>
        </nav>

        <div className="store-navbar-actions">
          <button className="store-icon-button" aria-label="Search">
            <Search size={20} />
          </button>

          {isAuthenticated ? (
            <div className="store-user-menu">
              <button
                className="store-user-button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
              >
                <span className="store-user-avatar">
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </span>

                <span className="store-user-name">
                  {user?.fullName?.split(" ")[0] || "User"}
                </span>
              </button>
              {profileMenuOpen && (
                <div className="store-user-dropdown">
                  <div className="store-user-dropdown-header">
                    <strong>{user?.fullName || "User"}</strong>
                    <span>{user?.email}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="store-user-dropdown-link"
                    onClick={() => setProfileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    type="button"
                    className="store-user-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="store-login-link">
                Login
              </Link>

              <Link to="/register" className="store-register-button">
                Join Now
              </Link>
            </>
          )}

          <Link
            to="/cart"
            className="store-icon-button"
            aria-label={`Shopping cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
          >
            <span className="store-cart-icon-wrapper">
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="store-cart-count">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
          </Link>

          <button
            className="store-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default StoreNavbar;
