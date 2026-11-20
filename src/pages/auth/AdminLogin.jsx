import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Gamepad2,
  ShieldCheck,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import { loginUser } from "../../features/auth/authThunks.js";
import { clearAuth } from "../../features/auth/authSlice.js";
import { clearAccessToken } from "../../services/api.js";

import "../../styles/adminLogin.css";

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLocalError("");

    try {
      const user = await dispatch(
        loginUser({
          email: email.trim(),
          password,
        }),
      ).unwrap();

      if (user.user.role !== "admin") {
        clearAccessToken();
        dispatch(clearAuth());

        setLocalError("Access denied. Administrator privileges are required.");

        return;
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setLocalError(
        typeof err === "string" ? err : "Unable to log in. Please try again.",
      );
    }
  };

  return (
    <div className="admin-login-page">
      {/* Background Effects */}
      <div className="login-bg-glow login-bg-glow-one"></div>
      <div className="login-bg-glow login-bg-glow-two"></div>
      <div className="login-grid-overlay"></div>

      <div className="admin-login-container">
        {/* Left Branding Section */}
        <div className="admin-login-showcase">
          <Link to="/" className="login-brand">
            <div className="login-brand-icon">
              <Gamepad2 size={27} />
            </div>

            <span>
              PC Game <strong>Store</strong>
            </span>
          </Link>

          <div className="login-showcase-content">
            <div className="login-showcase-badge">
              <Sparkles size={14} />
              <span>ADMINISTRATOR PORTAL</span>
            </div>

            <h1>
              Your Gaming
              <br />
              Empire,
              <br />
              <span>Under Control.</span>
            </h1>

            <p>
              Manage your games, organize categories, and control your gaming
              marketplace from one powerful dashboard.
            </p>

            <div className="login-showcase-features">
              <div>
                <ShieldCheck size={19} />
                <span>Secure Admin Access</span>
              </div>

              <div>
                <Gamepad2 size={19} />
                <span>Complete Store Management</span>
              </div>
            </div>
          </div>

          <div className="login-showcase-footer">
            <span>PC GAME STORE</span>
            <span>ADMINISTRATION SYSTEM</span>
          </div>
        </div>

        {/* Right Login Section */}
        <div className="admin-login-form-section">
          <div className="admin-login-card">
            <div className="login-card-icon">
              <ShieldCheck size={29} />
            </div>

            <div className="login-card-heading">
              <span className="login-eyebrow">WELCOME BACK</span>

              <h2>Admin Sign In</h2>

              <p>Enter your credentials to access your dashboard.</p>
            </div>

            {(localError || error) && (
              <div className="login-error-message">{localError || error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="admin-email">Email Address</label>

                <div className="login-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="admin-password">Password</label>

                <div className="login-input-wrapper">
                  <LockKeyhole size={18} />

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="admin-login-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowLeft size={18} className="login-submit-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="login-security-note">
              <ShieldCheck size={16} />
              <span>Your administrator session is protected.</span>
            </div>

            <div className="login-back-link">
              <Link to="/">
                <ArrowLeft size={15} />
                Back to Storefront
              </Link>
            </div>
          </div>

          <p className="login-copyright">
            © {new Date().getFullYear()} PC Game Store. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
