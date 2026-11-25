import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  ChevronDown,
  LoaderCircle,
  Tag,
  XCircle,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import gameService from "../../services/gameService.js";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const searchWrapperRef = useRef(null);

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

  // Live search with debounce
  useEffect(() => {
    if (!searchOpen || !searchTerm.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    let isActive = true;

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const response = await gameService.searchGames(searchTerm.trim(), 5);

        if (isActive) {
          setSearchResults(response?.data?.games || []);
        }
      } catch (error) {
        if (isActive) {
          setSearchError("Unable to search games. Please try again.");
          setSearchResults([]);
        }
      } finally {
        if (isActive) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchTerm, searchOpen]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
        setSearchTerm("");
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <div className="store-search-wrapper" ref={searchWrapperRef}>
            {searchOpen ? (
              <div className="store-search-input-wrapper">
                <Search size={18} />

                <input
                  type="text"
                  className="store-search-input"
                  placeholder="Search games or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />

                <button
                  type="button"
                  className="store-search-close"
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                  aria-label="Close search"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="store-icon-button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={20} />
              </button>
            )}
            {searchOpen && searchTerm.trim() && (
              <div className="store-search-dropdown">
                {searchLoading ? (
                  <div className="store-search-message">
                    <LoaderCircle size={20} className="game-details-loader" />
                    <p>Searching games...</p>
                  </div>
                ) : searchError ? (
                  <div className="store-search-message error">
                    {searchError}
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="store-search-heading">
                      Games ({searchResults.length})
                    </div>

                    {searchResults.map((game) => (
                      <button
                        type="button"
                        className="store-search-result"
                        key={game._id}
                        onClick={() => {
                          navigate(`/game/${game.slug}`);
                          setSearchOpen(false);
                          setSearchTerm("");
                          setSearchResults([]);
                        }}
                      >
                        <img src={game.coverImage} alt={game.title} />

                        <div className="store-search-result-info">
                          <strong>{game.title}</strong>

                          <span>
                            {game.categories?.length > 0
                              ? game.categories
                                  .map((category) => category.name)
                                  .join(", ")
                              : "PC Game"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="store-search-message">
                    No games found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop authentication controls */}
          <div className="store-auth-desktop">
            {isAuthenticated ? (
              <div className="store-user-menu">
                <button
                  className="store-user-button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  aria-expanded={profileMenuOpen}
                  aria-label="Open profile menu"
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
          </div>

          {/* Compact authentication dropdown for screens 851px and below */}
          <div className="store-auth-mobile">
            <div className="store-user-menu">
              <button
                type="button"
                className="store-auth-dropdown-toggle"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-label={
                  profileMenuOpen ? "Close account menu" : "Open account menu"
                }
                aria-expanded={profileMenuOpen}
              >
                <ChevronDown
                  size={21}
                  className={
                    profileMenuOpen
                      ? "store-auth-chevron open"
                      : "store-auth-chevron"
                  }
                />
              </button>

              {profileMenuOpen && (
                <div className="store-user-dropdown store-auth-dropdown">
                  {isAuthenticated ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="store-user-dropdown-link"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="store-user-dropdown-link"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Join Now
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

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
