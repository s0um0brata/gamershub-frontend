import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Gamepad2 } from "lucide-react";

import { useDispatch } from "react-redux";
import { loginUser } from "../../features/auth/authThunks.js";

import "../../styles/login.css";
import StoreFooter from "../store/StoreFooter.jsx";
import StoreNavbar from "../store/StoreNavbar.jsx";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await dispatch(
        loginUser({
          email: formData.email.trim(),
          password: formData.password,
        }),
      ).unwrap();

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : "Unable to log in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <StoreNavbar />

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <Gamepad2 size={40} />
            <h1>Welcome Back</h1>
            <p>Sign in to continue your gaming adventure.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-input-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-input-group">
              <label htmlFor="password">Password</label>

              <div className="login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="login-register-link">
              Don't have an account? <Link to="/register">Create Account</Link>
            </p>
          </form>
        </div>
      </div>

      <StoreFooter />
    </>
  );
}

export default Login;
