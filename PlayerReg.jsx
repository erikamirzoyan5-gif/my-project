import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PlayerReg() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const validateForm = () => {
    if (!formData.name || !formData.surname || !formData.email || !formData.password) {
      return "Please fill in all required fields";
    }

    if (formData.password.length < 6) {
      return "Password must be at least 6 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }

    if (!agreeToTerms) {
      return "You must agree to the Terms & Conditions";
    }

    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate("/player-interests");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
    }
    
    setLoading(false);
  };

  return (
    <div className="player-reg-page">
      <section className="create-account">
        <h2>Create an account</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form className="account-form" onSubmit={handleRegister}>
          <label>
            Name 
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your first name"
              
            />
          </label>

          <label>
            Surname 
            <input 
              type="text" 
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder="Enter your last name"
            
            />
          </label>

          <label>
            Email  
            <input  
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </label>

          <label>
            Phone Number
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </label>

          <label>
            Password 
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img 
                  src={showPassword ? "/nkarner/hide.png" : "/nkarner/view.png"} 
                  alt={showPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>
          </label>

          <label>
            Confirm Password 
            <div className="password-input-container">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                 
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <img 
                  src={showConfirmPassword ? "/nkarner/hide.png" : "/nkarner/view.png"} 
                  alt={showConfirmPassword ? "Hide password" : "Show password"}
                />
              </button>
            </div>
          </label>

          {/* Terms and Conditions */}
          <div className="terms-agreement">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                
              />
              <span className="checkmark"></span>
              I agree to the <a href="/terms" target="_blank">Terms & Conditions</a> and <a href="/privacy" target="_blank">Privacy Policy</a> 
            </label>
          </div>

          <button
            type="submit"
            className={`next-btn ${!agreeToTerms ? 'disabled' : ''}`}
            disabled={loading || !agreeToTerms}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default PlayerReg;