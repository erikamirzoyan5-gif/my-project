// src/Regnext.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

const networkPresets = [
  "UN Network",
  "European Partnerships", 
  "Eastern Partnership Civil Society",
  "Cooperation with Diaspora",
  "International Financial Network"
];

function Regnext() {
  const [stepOneSnapshot, setStepOneSnapshot] = useState(null);
  const [formData, setFormData] = useState({
    orgContactEmail: "",
    orgContactPhone: "",
    orgSecondaryPhone: "",
    address: "",
    website: "",
    socialLinks: [""],
    networks: [],
    customNetwork: ""
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem("orgOnboardingStepOne");
    if (stored) {
      setStepOneSnapshot(JSON.parse(stored));
    } else {
      navigate("/reg");
    }
  }, [navigate]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSocialLinkChange = (value, index) => {
    setFormData(prev => {
      const next = [...prev.socialLinks];
      next[index] = value;
      return { ...prev, socialLinks: next };
    });
  };

  const addSocialLink = () => {
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ""] }));
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, idx) => idx !== index)
    }));
  };

  const toggleNetwork = (network) => {
    setFormData(prev => {
      const exists = prev.networks.includes(network);
      return {
        ...prev,
        networks: exists ? prev.networks.filter(n => n !== network) : [...prev.networks, network]
      };
    });
  };

  const addCustomNetwork = () => {
    const trimmed = formData.customNetwork.trim();
    if (!trimmed) return;
    if (!formData.networks.includes(trimmed)) {
      updateFormData("networks", [...formData.networks, trimmed]);
    }
    updateFormData("customNetwork", "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.orgContactEmail || !formData.orgContactPhone) {
      alert("Please fill required fields: Organization email and phone");
      return;
    }

    sessionStorage.setItem("orgOnboardingStepTwo", JSON.stringify(formData));
    navigate("/reeg");
  };

  if (!stepOneSnapshot) {
    return (
      <div className="loading-state">
        <p>Loading your organization data...</p>
      </div>
    );
  }

  return (
    <section className="create-account contact-networks">
      <div className="onboarding-header">
        <div className="progress-steps">
          <div className="step completed">
            <div className="step-number">1</div>
            <span>Organization Profile</span>
          </div>
          <div className="step active">
            <div className="step-number">2</div>
            <span>Contact & Networks</span>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <span>Team & Security</span>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <span>Verification</span>
          </div>
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Step 2: Contact Information & Networks</h2>
          <p>How can people reach your organization and what networks are you part of?</p>
        </div>
        <Link to="/reg" className="ghost-btn">
          Back to Step 1
        </Link>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3>Contact Information</h3>
          <div className="grid-two">
            <div className="form-group">
              <label>Team Email *</label>
              <input
                type="email"
                value={formData.orgContactEmail}
                onChange={(e) => updateFormData("orgContactEmail", e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Primary Phone *</label>
              <input
                type="tel"
                value={formData.orgContactPhone}
                onChange={(e) => updateFormData("orgContactPhone", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Additional Phone</label>
              <input
                type="tel"
                value={formData.orgSecondaryPhone}
                onChange={(e) => updateFormData("orgSecondaryPhone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData("website", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateFormData("address", e.target.value)}
            />
          </div>

          <div className="social-links">
            <label>Social Links</label>
            {formData.socialLinks.map((link, index) => (
              <div key={`social-${index}`} className="social-row">
                <input
                  type="url"
                  placeholder="https://example.com/profile"
                  value={link}
                  onChange={(e) => handleSocialLinkChange(e.target.value, index)}
                />
                {formData.socialLinks.length > 1 && (
                  <button type="button" className="icon-btn" onClick={() => removeSocialLink(index)}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="ghost-btn" onClick={addSocialLink}>
              <Plus size={16} /> Add Link
            </button>
          </div>
        </section>

        <section className="form-section">
          <h3>International Networks</h3>
          <p className="section-description">
            Select the networks your organization is part of
          </p>
          <div className="networks-chips">
            {networkPresets.map((network) => (
              <label 
                key={network} 
                className={`network-chip ${formData.networks.includes(network) ? 'network-chip--active' : ''}`}
              >
                <input
                  type="checkbox"
                  value={network}
                  checked={formData.networks.includes(network)}
                  onChange={() => toggleNetwork(network)}
                  style={{ display: 'none' }}
                />
                <span>{network}</span>
              </label>
            ))}
          </div>
          
          <div className="custom-network">
            <label>Add Custom Network</label>
            <div className="input-with-button">
              <input
                type="text"
                placeholder="Enter network name"
                value={formData.customNetwork}
                onChange={(e) => updateFormData("customNetwork", e.target.value)}
              />
              <button type="button" className="ghost-btn" onClick={addCustomNetwork}>
                Add
              </button>
            </div>
          </div>

          {formData.networks.length > 0 && (
            <div className="selected-networks">
              <strong>Selected Networks: </strong>
              {formData.networks.join(', ')}
            </div>
          )}
        </section>

        <div className="form-actions">
          <Link to="/reg" className="ghost-btn with-icon">
            <ArrowLeft size={18} />
            Back
          </Link>
          <button type="submit" className="primary-btn with-icon">
            Continue to Step 3
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default Regnext;