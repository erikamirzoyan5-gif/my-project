// src/Reeg.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Plus, Trash2, ArrowRight, ArrowLeft, Users } from "lucide-react";

const emptyMember = () => ({ fullName: "", role: "", email: "" });

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function Reeg() {
  const [stepOneSnapshot, setStepOneSnapshot] = useState(null);
  const [stepTwoSnapshot, setStepTwoSnapshot] = useState(null);
  const [formData, setFormData] = useState({
    secureSealText: "",
    secureSealAcknowledged: false,
    authorizedMembers: [emptyMember()]
  });
  
  const [documents, setDocuments] = useState({
    logo: "",
    orgPictureOverride: "",
    secureSealImage: ""
  });
  
  const logoInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedStep1 = sessionStorage.getItem("orgOnboardingStepOne");
    const storedStep2 = sessionStorage.getItem("orgOnboardingStepTwo");
    
    if (storedStep1) {
      setStepOneSnapshot(JSON.parse(storedStep1));
    } else {
      navigate("/reg");
    }
    
    if (storedStep2) {
      setStepTwoSnapshot(JSON.parse(storedStep2));
    }
  }, [navigate]);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (file, key) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Files must be smaller than 8MB.");
      return;
    }
    const base64 = await convertToBase64(file);
    setDocuments(prev => ({ ...prev, [key]: base64 }));
  };

  const updateMember = (index, field, value) => {
    setFormData(prev => {
      const next = [...prev.authorizedMembers];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, authorizedMembers: next };
    });
  };

  const addMember = () => {
    if (formData.authorizedMembers.length >= 10) return;
    setFormData(prev => ({ ...prev, authorizedMembers: [...prev.authorizedMembers, emptyMember()] }));
  };

  const removeMember = (index) => {
    setFormData(prev => ({
      ...prev,
      authorizedMembers: prev.authorizedMembers.filter((_, idx) => idx !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ՎԱԼԻԴԱՑԻԱՆ ՀԱՆՎԱԾ Է
    // if (!formData.secureSealAcknowledged) {
    //   alert("Please acknowledge the secure seal requirement");
    //   return;
    // }

    sessionStorage.setItem("orgOnboardingStepThree", JSON.stringify({
      formData,
      documents
    }));
    navigate("/reeeg");
  };

  if (!stepOneSnapshot || !stepTwoSnapshot) {
    return (
      <div className="loading-state">
        <p>Loading your organization data...</p>
      </div>
    );
  }

  return (
    <section className="create-account team-security">
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
          <div className="step active">
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
          <h2>Step 3: Team & Security</h2>
          <p>Manage your team members and set up security policies</p>
        </div>
        <Link to="/regnext" className="ghost-btn">
          Back to Step 2
        </Link>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        {/* Photos and Branding */}
        <section className="form-section">
          <h3>Organization Branding</h3>
          <div className="media-grid">
            <div className="upload-card">
              <label>Logo (optional)</label>
              <div className="logo-upload-container" onClick={() => logoInputRef.current?.click()}>
                {documents.logo ? (
                  <div className="logo-preview">
                    <img src={documents.logo} alt="Logo preview" />
                    <span>Change</span>
                  </div>
                ) : (
                  <div className="logo-upload-placeholder">
                    <Upload size={24} />
                    <span>Add Logo</span>
                    <small>Up to 8MB</small>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e.target.files?.[0], "logo")}
              />
            </div>

            <div className="upload-card">
              <label>Organization Photo</label>
              <div className="logo-upload-container" onClick={() => posterInputRef.current?.click()}>
                {documents.orgPictureOverride ? (
                  <div className="logo-preview">
                    <img src={documents.orgPictureOverride} alt="Org preview" />
                    <span>Change</span>
                  </div>
                ) : (
                  <div className="logo-upload-placeholder">
                    <Upload size={24} />
                    <span>Upload Photo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={posterInputRef}
                style={{ display: "none" }}
                onChange={(e) => handleFileUpload(e.target.files?.[0], "orgPictureOverride")}
              />
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="form-section">
          <div className="section-header">
            <Users size={20} />
            <h3>Authorized Team Members</h3>
          </div>
          <p className="section-description">
            Add team members who are authorized to publish content on behalf of your organization
          </p>

          <div className="members-grid">
            {formData.authorizedMembers.map((member, index) => (
              <div key={`member-${index}`} className="member-card">
                <div className="member-card__header">
                  <h4>Member #{index + 1}</h4>
                  {formData.authorizedMembers.length > 1 && (
                    <button type="button" className="icon-btn" onClick={() => removeMember(index)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={member.fullName}
                  onChange={(e) => updateMember(index, "fullName", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Role / Responsibility"
                  value={member.role}
                  onChange={(e) => updateMember(index, "role", e.target.value)}
                />
                <input
                  type="email"
                  placeholder="team@org.com"
                  value={member.email}
                  onChange={(e) => updateMember(index, "email", e.target.value)}
                />
              </div>
            ))}
          </div>
          
          {formData.authorizedMembers.length < 10 && (
            <button type="button" className="ghost-btn" onClick={addMember}>
              <Plus size={16} /> Add Team Member
            </button>
          )}
        </section>


        <div className="form-actions">
          <Link to="/regnext" className="ghost-btn with-icon">
            <ArrowLeft size={18} />
            Back
          </Link>
          <button type="submit" className="primary-btn with-icon">
            Continue to Verification
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default Reeg;