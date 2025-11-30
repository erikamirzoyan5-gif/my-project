import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PlayerRegistration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      if (result.user.interests && result.user.interests.length > 0) {
        navigate("/dashboard");
      } else {
        navigate("/player-interests");
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <section className="registration-page">
      <div className="image-side">
        <img src="/nkarner/pppp.png" alt="Registration visual" />
      </div>

      <div className="form-side">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

       <div className="form-group">
          <label>Password</label>
          <div className="password-input-container">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password"
              value={formData.password}
              onChange={handleChange}
              required 
            />
            <button 
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img 
                src={showPassword ? "/nkarner/view.png" : "/nkarner/hide.png"} 
                alt="Toggle password visibility"
              />
            </button>
          </div>
       </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Loading..." : "Continue"}
          </button>

          <p className="register-text">
            Don't have an account? <Link to="/PlayerReg">Register</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default PlayerRegistration;