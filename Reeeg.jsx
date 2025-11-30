

// src/Reeeg.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { Upload, ShieldCheck, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function Reeeg() {
  const [stepOneSnapshot, setStepOneSnapshot] = useState(null);
  const [stepTwoSnapshot, setStepTwoSnapshot] = useState(null);
  const [stepThreeSnapshot, setStepThreeSnapshot] = useState(null);
  const [usernameStatus, setUsernameStatus] = useState("idle");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    representative: {
      name: "",
      surname: "", 
      phone: "",
      email: ""
    },
    verification: {
      stateRegistrationId: "",
      country: "",
      legalId: "",
      vatNumber: "",
      phoneVerified: false,
      emailVerified: false,
      repPassportNumber: "",
      repBirthDate: ""
    }
  });
  
  const [documents, setDocuments] = useState({
    registrationDoc: "",
    vatDoc: "",
    stateSeal: "",
    repPassportScan: ""
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedStep1 = sessionStorage.getItem("orgOnboardingStepOne");
    const storedStep2 = sessionStorage.getItem("orgOnboardingStepTwo");
    const storedStep3 = sessionStorage.getItem("orgOnboardingStepThree");
    
    if (storedStep1) {
      setStepOneSnapshot(JSON.parse(storedStep1));
    }
    if (storedStep2) {
      setStepTwoSnapshot(JSON.parse(storedStep2));
    }
    if (storedStep3) {
      const step3Data = JSON.parse(storedStep3);
      setStepThreeSnapshot(step3Data);
    }
  }, []);

  const handleUsernameBlur = (value) => {
    if (!value) {
      setUsernameStatus("idle");
      return;
    }
    const claimed = JSON.parse(localStorage.getItem("claimedUsernames") || "[]");
    if (claimed.includes(value.toLowerCase())) {
      setUsernameStatus("taken");
    } else {
      setUsernameStatus("available");
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const updateRepresentative = (key, value) => {
    setFormData(prev => ({
      ...prev,
      representative: { ...prev.representative, [key]: value }
    }));
  };

  const updateVerification = (key, value) => {
    setFormData(prev => ({
      ...prev,
      verification: { ...prev.verification, [key]: value }
    }));
  };

  const handleFileUpload = async (file, key) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setError("Files must be smaller than 8MB.");
      return;
    }
    const base64 = await convertToBase64(file);
    setDocuments(prev => ({ ...prev, [key]: base64 }));
    setError("");
  };

  const validateForm = () => {
    // ✅ ՄԻԱՅՆ LOGIN CREDENTIALS-ն են պարտադիր
    if (!formData.username) return "Add unique username for organization.";
    if (usernameStatus === "taken") return "This username is already taken.";
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      return "Login credentials are required.";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }
    
    // ❌ ՀԱՆՎԱԾ Է ՄՆԱՑԵԼ ԲՈԼՈՐ VALIDATION-ները
    // Legal Representative, Verification և Documents-ը ոչ պարտադիր են
    
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        stepOneData: stepOneSnapshot,
        stepTwoData: stepTwoSnapshot,
        stepThreeData: stepThreeSnapshot,
        stepFourData: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          representative: formData.representative,
          verification: formData.verification,
          documents: documents
        }
      };

      const result = await register(payload);
      if (result.success) {
        // Պահպանել username-ը localStorage-ում
        const claimed = JSON.parse(localStorage.getItem("claimedUsernames") || "[]");
        claimed.push(formData.username.toLowerCase());
        localStorage.setItem("claimedUsernames", JSON.stringify(claimed));
        
        // Մաքրել sessionStorage-ը
        sessionStorage.removeItem("orgOnboardingStepOne");
        sessionStorage.removeItem("orgOnboardingStepTwo");
        sessionStorage.removeItem("orgOnboardingStepThree");
        
        setSuccess("Registration completed successfully! Redirecting...");
        setTimeout(() => {
          navigate("/organization-account-profile");
        }, 2000);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!stepOneSnapshot || !stepTwoSnapshot || !stepThreeSnapshot) {
    return (
      <div className="loading-state">
        <p>Loading your organization data... Please complete previous steps first.</p>
        <Link to="/reg" className="primary-btn">
          Start from Step 1
        </Link>
      </div>
    );
  }

  return (
    <section className="create-account verification-step">
      <div className="onboarding-header">
        <div className="progress-steps">
          <div className="step completed">
            <div className="step-number">1</div>
            <span>Organization Profile</span>
          </div>
          <div className="step completed">
            <div className="step-number">2</div>
            <span>Contact & Networks</span>
          </div>
          <div className="step completed">
            <div className="step-number">3</div>
            <span>Team & Security</span>
          </div>
          <div className="step active">
            <div className="step-number">4</div>
            <span>Verification</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Step 4: Final Verification</h2>
          <p>Complete your registration with login credentials and verification documents</p>
        </div>
        <Link to="/reeg" className="ghost-btn">
          Back to Step 3
        </Link>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        {/* Login Credentials - ՊԱՐՏԱԴԻՐ */}
        <section className="form-section">
          <h3>Login Credentials *</h3>
          <div className="grid-two">
            <div className="form-group">
              <label>Unique Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateFormData("username", e.target.value.trim())}
                onBlur={(e) => handleUsernameBlur(e.target.value.trim())}
                required
              />
              {usernameStatus === "taken" && (
                <small className="error-message">Username is already taken. Please choose another one.</small>
              )}
              {usernameStatus === "available" && (
                <small className="success-message">Username is available!</small>
              )}
            </div>
            <div className="form-group">
              <label>Login Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateFormData("password", e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData("confirmPassword", e.target.value)}
                required
                minLength={8}
              />
            </div>
          </div>
        </section>

        {/* Legal Representative - ՈՉ ՊԱՐՏԱԴԻՐ */}
        <section className="form-section">
          <h3>Legal Representative Information (Optional)</h3>
          <div className="grid-two">
            <div className="form-group">
              <label>Representative Name</label>
              <input
                type="text"
                value={formData.representative.name}
                onChange={(e) => updateRepresentative("name", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Representative Surname</label>
              <input
                type="text"
                value={formData.representative.surname}
                onChange={(e) => updateRepresentative("surname", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Representative Phone</label>
              <input
                type="tel"
                value={formData.representative.phone}
                onChange={(e) => updateRepresentative("phone", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Representative Email</label>
              <input
                type="email"
                value={formData.representative.email}
                onChange={(e) => updateRepresentative("email", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </section>

        {/* Verification Documents - ՈՉ ՊԱՐՏԱԴԻՐ */}
        <section className="form-section">
          <h3>Organization Verification (Optional)</h3>
          <div className="grid-two">
            <div className="form-group">
              <label>State Registration ID</label>
              <input
                type="text"
                value={formData.verification.stateRegistrationId}
                onChange={(e) => updateVerification("stateRegistrationId", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                value={formData.verification.country}
                onChange={(e) => updateVerification("country", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Legal ID</label>
              <input
                type="text"
                value={formData.verification.legalId}
                onChange={(e) => updateVerification("legalId", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>VAT Number</label>
              <input
                type="text"
                value={formData.verification.vatNumber}
                onChange={(e) => updateVerification("vatNumber", e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Passport Number</label>
              <input
                type="text"
                value={formData.verification.repPassportNumber}
                onChange={(e) => updateVerification("repPassportNumber", e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="form-group">
              <label>Birth Date</label>
              <input
                type="date"
                value={formData.verification.repBirthDate}
                onChange={(e) => updateVerification("repBirthDate", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Document Uploads - ՈՉ ՊԱՐՏԱԴԻՐ */}
        <section className="form-section">
          <h3>Required Documents (Optional)</h3>
          <div className="upload-grid">
            <div className="upload-item">
              <label>State Registration Document</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0], "registrationDoc")}
              />
              {documents.registrationDoc && (
                <span className="success-message">
                  <CheckCircle2 size={16} /> Document uploaded
                </span>
              )}
            </div>
            
            <div className="upload-item">
              <label>VAT / Tax Document</label>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0], "vatDoc")}
              />
              {documents.vatDoc && (
                <span className="success-message">
                  <CheckCircle2 size={16} /> Document uploaded
                </span>
              )}
            </div>
            
            <div className="upload-item">
              <label>State Seal (image)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files?.[0], "stateSeal")}
              />
              {documents.stateSeal && (
                <span className="success-message">
                  <CheckCircle2 size={16} /> Document uploaded
                </span>
              )}
            </div>
            
            <div className="upload-item">
              <label>Passport Scan</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files?.[0], "repPassportScan")}
              />
              {documents.repPassportScan && (
                <span className="success-message">
                  <CheckCircle2 size={16} /> Document uploaded
                </span>
              )}
            </div>
          </div>

          <div className="verification-toggles">
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={formData.verification.phoneVerified}
                onChange={(e) => updateVerification("phoneVerified", e.target.checked)}
              />
              <span>Phone number verified</span>
            </label>
            <label className="toggle-item">
              <input
                type="checkbox"
                checked={formData.verification.emailVerified}
                onChange={(e) => updateVerification("emailVerified", e.target.checked)}
              />
              <span>Email verified</span>
            </label>
          </div>
        </section>

        {/* Summary and Submission */}
        <section className="form-section summary-section">
          <div className="summary-header">
            <ShieldCheck size={24} />
            <h3>Ready to Submit</h3>
          </div>
          <div className="summary-content">
            <p>Your organization registration includes:</p>
            <ul>
              <li>✓ Organization profile and mission</li>
              <li>✓ Contact information and networks</li>
              <li>✓ Team members and security policy</li>
              <li>✓ Login credentials (username & password)</li>
              <li>✓ Optional verification documents</li>
            </ul>
            <div className="warning-banner">
              <AlertTriangle size={18} />
              <p>
                <strong>Note:</strong> Verification documents are optional. You can submit them later for account verification.
              </p>
            </div>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="form-actions">
          <Link to="/reeg" className="ghost-btn with-icon">
            <ArrowLeft size={18} />
            Back
          </Link>
          <button 
            type="submit" 
            className="primary-btn with-icon" 
            disabled={loading}
          >
            {loading ? "Submitting..." : "Complete Registration"}
            {!loading && <ShieldCheck size={18} />}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Reeeg;