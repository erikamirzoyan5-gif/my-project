import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function Registration() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, redirectPath, clearRedirect } = useAuth();
  const navigate = useNavigate(); // ✅ USE NAVIGATE HOOK

  // ✅ REDIRECT WHEN redirectPath CHANGES
  useEffect(() => {
    if (redirectPath) {
      clearRedirect();
      navigate(redirectPath);
    }
  }, [redirectPath, navigate, clearRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // ✅ REDIRECT WILL BE HANDLED BY useEffect ABOVE
        console.log('Login successful, redirecting...');
      } else {
        if (result.requiresApproval) {
          setError("Your account is pending approval. Please wait for administrator approval.");
        } else {
          setError(result.error);
        }
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="registration-page">
      <div className="image-side">
        <img src="/nkarner/Recovered.png" alt="Registration visual" />
      </div>

      <div className="form-side">
        <h2>Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Continue"}
          </button>

          <div className="terms">
            <input type="checkbox" required />
            <span>
              By logging in, you agree with our{" "}
              <a href="#">Terms & Conditions</a>, and{" "} <br /> 
              <a href="#">Privacy and Cookie Policy</a>.
            </span>
          </div>

          <p className="register-text">
            Don't have an account? <Link to="/reg">Register as Organization</Link>
          </p>

          {/* <div style={{marginTop: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', fontSize: '12px'}}>
            <strong>Admin Test Account:</strong><br/>
            Email: admin@greenwich.com<br/>
            Password: Admin123!
          </div> */}
        </form>
      </div>
    </section>
  );
}

export default Registration;