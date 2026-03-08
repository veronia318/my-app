import React, { useState } from "react";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../application/auth/AuthContext";
import { apiHelpers } from "../../infrastructure/api/api.config";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await apiHelpers.login(email, password);
      setLoading(false);

      if (!result.ok) {
        setErrorMessage(result.error || "Invalid email or password.");
        return;
      }

      if (result.data.token && result.data.user) {
        login(result.data.user, result.data.token);
        navigate("/");
      } else {
        setErrorMessage("Invalid response from server.");
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage("Network error. Please try again.");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Login</p>
        <p className="message">Welcome back! Please login to continue.</p>

        {errorMessage && (
          <p style={{ color: "red", fontSize: "14px", textAlign: "center" }}>
            {errorMessage}
          </p>
        )}

        <label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span>Email</span>
        </label>

        <label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span>Password</span>
        </label>

        <button className="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="signin">
          Don't have an account? <a href="/register">Signup</a>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
