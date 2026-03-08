import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterForm.css";
import { useAuth } from "../../application/auth/AuthContext";
import { apiHelpers } from "../../infrastructure/api/api.config";

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const result = await apiHelpers.register({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
      });

      setLoading(false);

      if (result.ok) {
        if (result.data.token && result.data.user) {
          login(result.data.user, result.data.token);
          navigate("/");
        } else {
          navigate("/login");
        }
      } else {
        setError(result.error || "Registration failed.");
      }
    } catch (err) {
      setLoading(false);
      console.error("Registration Error:", err);
      setError("Could not connect to the server.");
    }
  };

  return (
    <div className="register-container-wrapper">
      <form className="register-form-new" onSubmit={handleSubmit}>
        <div className="header">
          <span className="dot"></span>
          <h1 className="title-new">Register</h1>
        </div>

        <p className="message-new">
          Signup now and get full access to our app.
        </p>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div className="input-group flex-row">
          <input
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            required
            placeholder="Firstname"
            type="text"
            className="input-new"
          />
          <input
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            required
            placeholder="Lastname"
            type="text"
            className="input-new"
          />
        </div>

        <div className="input-group">
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
            type="email"
            className="input-new"
          />
        </div>

        <div className="input-group">
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Password"
            type="password"
            className="input-new"
          />
        </div>

        <div className="input-group">
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Confirm password"
            type="password"
            className="input-new"
          />
        </div>

        <button className="submit-new" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Submit"}
        </button>

        <p className="signin-new">
          Already have an account? <a href="/login">Signin</a>
        </p>
      </form>
    </div>
  );
}

export default RegisterForm;
