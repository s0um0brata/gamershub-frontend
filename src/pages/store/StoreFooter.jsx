import { Link } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

function StoreFooter() {
  return (
    <footer className="store-footer">
      <div className="store-footer-container">
        <div className="store-footer-main">
          <div className="store-footer-brand">
            <Link to="/" className="store-footer-logo">
              <Gamepad2 size={27} />
              <span>
                GAMERS<span>HUB</span>
              </span>
            </Link>

            <p>
              Your ultimate destination for discovering and exploring the best
              PC games. Find your next adventure with GamersHub.
            </p>

            <div className="store-footer-socials">
              <a href="https://github.com" target="_blank" rel="noreferrer">
                GH
              </a>

              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                IG
              </a>

              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                X
              </a>
            </div>
          </div>

          <div className="store-footer-links">
            <div>
              <h4>Explore</h4>
              <Link to="/">Home</Link>
              <Link to="/store">Store</Link>
              <Link to="/categories">Categories</Link>
            </div>

            <div>
              <h4>Account</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Create Account</Link>
            </div>

            <div>
              <h4>Support</h4>
              <a href="mailto:support@gamershub.com">Contact Us</a>
              <a href="mailto:support@gamershub.com">Help Center</a>
            </div>
          </div>
        </div>

        <div className="store-footer-bottom">
          <p>© {new Date().getFullYear()} GamersHub. All rights reserved.</p>
          <span>Made for gamers, by gamers.</span>
        </div>
      </div>
    </footer>
  );
}

export default StoreFooter;
