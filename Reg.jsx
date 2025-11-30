// src/Reg.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Trash2, ArrowRight, HelpCircle, ChevronDown } from "lucide-react";

const orgTypes = [
  "Non-Profit Organization",
  "Charity Foundation", 
  "Public Association",
  "International NGO",
  "Social Enterprise",
  "Community Center",
  "Youth Organization",
  "Educational Institution",
  "Healthcare Organization",
  "Environmental NGO",
  "Human Rights Organization",
  "Cultural Foundation",
  "Other"
];

const ageGroups = [
  { value: "all", label: "All Age Groups" },
  { value: "0-12", label: "Children (0-12)" },
  { value: "13-17", label: "Teenagers (13-17)" },
  { value: "18-25", label: "Young Adults (18-25)" },
  { value: "26-35", label: "Adults (26-35)" },
  { value: "36-50", label: "Middle-aged (36-50)" },
  { value: "51-65", label: "Senior Adults (51-65)" },
  { value: "65+", label: "Elderly (65+)" }
];

const focusAreasList = [
  "Education & Literacy",
  "Healthcare & Medicine",
  "Environmental Protection",
  "Human Rights",
  "Women Empowerment",
  "Children & Youth Development",
  "Poverty Alleviation",
  "Disaster Relief",
  "Community Development",
  "Arts & Culture",
  "Sports & Recreation",
  "Technology & Innovation",
  "Animal Welfare",
  "Mental Health",
  "Elderly Care",
  "Refugee Support",
  "Other"
];

const legalForms = [
  "Non-Governmental Organization (NGO)",
  "Public Organization",
  "Foundation",
  "Charity Organization",
  "Association",
  "Social Enterprise",
  "Community-Based Organization",
  "International Organization",
  "Religious Organization",
  "Professional Association",
  "Other"
];

const languages = [
  "Armenian", "English", "Russian", "French", "German", "Spanish", "Other"
];

function Reg() {
  const [formData, setFormData] = useState({
    nameBlocks: [{ language: "Armenian", name: "" }],
    orgType: [],
    customOrgType: "",
    audiences: [],
    description: "",
    mission: "",
    focusAreas: [],
    customFocusArea: "",
    establishedYear: "",
    legalForm: [],
    customLegalForm: ""
  });

  const [showFocusDropdown, setShowFocusDropdown] = useState(false);
  const [showLegalDropdown, setShowLegalDropdown] = useState(false);
  const [showOrgTypeDropdown, setShowOrgTypeDropdown] = useState(false);
  
  const navigate = useNavigate();

  // Refs for dropdown containers
  const focusDropdownRef = useRef(null);
  const legalDropdownRef = useRef(null);
  const orgTypeDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (focusDropdownRef.current && !focusDropdownRef.current.contains(event.target)) {
        setShowFocusDropdown(false);
      }
      if (legalDropdownRef.current && !legalDropdownRef.current.contains(event.target)) {
        setShowLegalDropdown(false);
      }
      if (orgTypeDropdownRef.current && !orgTypeDropdownRef.current.contains(event.target)) {
        setShowOrgTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateNameBlock = (index, field, value) => {
    setFormData(prev => {
      const next = [...prev.nameBlocks];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, nameBlocks: next };
    });
  };

  const addNameBlock = () => {
    setFormData(prev => ({
      ...prev,
      nameBlocks: [...prev.nameBlocks, { language: "Armenian", name: "" }]
    }));
  };

  const removeNameBlock = (index) => {
    if (formData.nameBlocks.length > 1) {
      setFormData(prev => ({
        ...prev,
        nameBlocks: prev.nameBlocks.filter((_, idx) => idx !== index)
      }));
    }
  };

  const toggleAudience = (ageGroup) => {
    if (ageGroup === "all") {
      setFormData(prev => ({
        ...prev,
        audiences: prev.audiences.includes("all") ? [] : ["all"]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        audiences: prev.audiences.includes(ageGroup)
          ? prev.audiences.filter(a => a !== ageGroup && a !== "all")
          : [...prev.audiences.filter(a => a !== "all"), ageGroup]
      }));
    }
  };

  // Organization Type - Checkbox style
  const toggleOrgType = (type) => {
    if (type === "Other") {
      setFormData(prev => ({
        ...prev,
        orgType: prev.orgType.includes("Other") 
          ? prev.orgType.filter(t => t !== "Other")
          : [...prev.orgType, "Other"]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        orgType: prev.orgType.includes(type)
          ? prev.orgType.filter(t => t !== type)
          : [...prev.orgType, type]
      }));
    }
  };

  const addCustomOrgType = () => {
    const trimmed = formData.customOrgType.trim();
    if (trimmed && !formData.orgType.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        orgType: [...prev.orgType, trimmed],
        customOrgType: ""
      }));
    }
  };

  const removeOrgType = (type) => {
    setFormData(prev => ({
      ...prev,
      orgType: prev.orgType.filter(t => t !== type)
    }));
  };

  // Focus Areas
  const toggleFocusArea = (area) => {
    if (area === "Other") {
      setFormData(prev => ({
        ...prev,
        focusAreas: prev.focusAreas.includes("Other") 
          ? prev.focusAreas.filter(a => a !== "Other")
          : [...prev.focusAreas, "Other"]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        focusAreas: prev.focusAreas.includes(area)
          ? prev.focusAreas.filter(a => a !== area)
          : [...prev.focusAreas, area]
      }));
    }
  };

  const addCustomFocusArea = () => {
    const trimmed = formData.customFocusArea.trim();
    if (trimmed && !formData.focusAreas.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, trimmed],
        customFocusArea: ""
      }));
    }
  };

  const removeFocusArea = (area) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter(a => a !== area)
    }));
  };

  // Legal Form - Checkbox style
  const toggleLegalForm = (form) => {
    if (form === "Other") {
      setFormData(prev => ({
        ...prev,
        legalForm: prev.legalForm.includes("Other") 
          ? prev.legalForm.filter(f => f !== "Other")
          : [...prev.legalForm, "Other"]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        legalForm: prev.legalForm.includes(form)
          ? prev.legalForm.filter(f => f !== form)
          : [...prev.legalForm, form]
      }));
    }
  };

  const addCustomLegalForm = () => {
    const trimmed = formData.customLegalForm.trim();
    if (trimmed && !formData.legalForm.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        legalForm: [...prev.legalForm, trimmed],
        customLegalForm: ""
      }));
    }
  };

  const removeLegalForm = (form) => {
    setFormData(prev => ({
      ...prev,
      legalForm: prev.legalForm.filter(f => f !== form)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nameBlocks[0].name || formData.orgType.length === 0) {
      alert("Please fill required fields: Organization name and type");
      return;
    }

    sessionStorage.setItem("orgOnboardingStepOne", JSON.stringify(formData));
    navigate("/regnext");
  };

  // Get display text for dropdown triggers
  const getFocusAreasDisplay = () => {
    if (formData.focusAreas.length === 0) return "Select Focus Areas";
    if (formData.focusAreas.length === 1) return formData.focusAreas[0];
    return `${formData.focusAreas.length} areas selected`;
  };

  const getLegalFormDisplay = () => {
    if (formData.legalForm.length === 0) return "Select Legal Form";
    if (formData.legalForm.length === 1) return formData.legalForm[0];
    return `${formData.legalForm.length} forms selected`;
  };

  const getOrgTypeDisplay = () => {
    if (formData.orgType.length === 0) return "Select Organization Type";
    if (formData.orgType.length === 1) return formData.orgType[0];
    return `${formData.orgType.length} types selected`;
  };

  return (
    <section className="create-account organization-profile">
      {/* Progress Steps */}
      <div className="onboarding-header">
        <div className="progress-steps">
          <div className="step active">
            <div className="step-number">1</div>
            <span>Organization Profile</span>
          </div>
          <div className="step">
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
          <h2>Step 1: Organization Profile</h2>
          <p>Tell us about your organization's identity and mission</p>
        </div>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        {/* Organization Names */}
        <section className="form-section">
          <div className="section-header">
            <h3>Organization Name</h3>
            <div className="help-tooltip">
              <HelpCircle size={16} />
              <div className="tooltip-text">Add your organization name in different languages. Armenian version is required.</div>
            </div>
          </div>
          <p className="section-description">
            Provide your organization's name in different languages
          </p>
          
          {formData.nameBlocks.map((block, index) => (
            <div key={`name-${index}`} className="name-block">
              <div className="grid-two">
                <div className="form-group">
                  <label>Language {index === 0 && "*"}</label>
                  <select
                    value={block.language}
                    onChange={(e) => updateNameBlock(index, "language", e.target.value)}
                    className="select-field"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Organization Name {index === 0 && "*"}</label>
                  <div className="input-with-action">
                    <input
                      type="text"
                      value={block.name}
                      onChange={(e) => updateNameBlock(index, "name", e.target.value)}
                      placeholder="Enter organization name"
                      required={index === 0}
                      className="input-field"
                    />
                    {formData.nameBlocks.length > 1 && (
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() => removeNameBlock(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <button type="button" className="ghost-btn" onClick={addNameBlock}>
            <Plus size={16} /> Add Name in Another Language
          </button>
        </section>

        {/* Organization Type - Updated to Dropdown like Focus Areas */}
        <section className="form-section org-type-container">
          <div className="section-header">
            <h3>Organization Type *</h3>
            <div className="help-tooltip">
              <HelpCircle size={16} />
              <div className="tooltip-text">Select the categories that describe your organization's structure and purpose.</div>
            </div>
          </div>
          
          <div className="dropdown-container" ref={orgTypeDropdownRef}>
            <button 
              type="button" 
              className="dropdown-trigger"
              onClick={() => setShowOrgTypeDropdown(!showOrgTypeDropdown)}
            >
              <span>{getOrgTypeDisplay()}</span>
              <ChevronDown size={16} className={showOrgTypeDropdown ? 'rotate-180' : ''} />
            </button>
            
            {showOrgTypeDropdown && (
              <div className="dropdown-menu">
                {orgTypes.map(type => (
                  <label key={type} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={formData.orgType.includes(type)}
                      onChange={() => toggleOrgType(type)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Organization Types */}
          {formData.orgType.length > 0 && (
            <div className="selected-items">
              <h4>Selected Organization Types:</h4>
              <div className="selected-chips">
                {formData.orgType.map(type => (
                  <div key={type} className="selected-chip">
                    {type}
                    <button 
                      type="button" 
                      className="chip-remove"
                      onClick={() => removeOrgType(type)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Organization Type Input */}
          {formData.orgType.includes("Other") && (
            <div className="custom-input-group">
              <input
                type="text"
                placeholder="Specify your organization type..."
                value={formData.customOrgType}
                onChange={(e) => setFormData(prev => ({ ...prev, customOrgType: e.target.value }))}
                className="input-field"
              />
              <button 
                type="button" 
                className="add-custom-btn"
                onClick={addCustomOrgType}
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Target Audience - Age Groups */}
        <section className="form-section">
          <div className="section-header">
            <h3>Target Age Groups</h3>
            <div className="help-tooltip">
              <HelpCircle size={16} />
              <div className="tooltip-text">Select the age groups your organization primarily serves.</div>
            </div>
          </div>
          <div className="age-groups-grid">
            {ageGroups.map(group => (
              <label 
                key={group.value} 
                className={`age-group-card ${formData.audiences.includes(group.value) ? 'age-group-card--active' : ''}`}
              >
                <input
                  type="checkbox"
                  value={group.value}
                  checked={formData.audiences.includes(group.value)}
                  onChange={() => toggleAudience(group.value)}
                  style={{ display: 'none' }}
                />
                <div className="age-group-content">
                  <span className="age-range">{group.label.split('(')[0]}</span>
                  <span className="age-years">{group.label.split('(')[1]?.replace(')', '')}</span>
                </div>
              </label>
            ))}
          </div>
          {formData.audiences.length > 0 && (
            <div className="selected-audiences">
              <strong>Selected Age Groups: </strong>
              {formData.audiences.map(aud => {
                const group = ageGroups.find(g => g.value === aud);
                return group ? group.label : aud;
              }).join(', ')}
            </div>
          )}
        </section>

        {/* Focus Areas with Dropdown */}
        <section className="form-section focus-areas-container">
          <div className="section-header">
            <h3>Focus Areas</h3>
            <div className="help-tooltip">
              <HelpCircle size={16} />
              <div className="tooltip-text">Select the main areas your organization focuses on. You can choose multiple areas.</div>
            </div>
          </div>
          
          <div className="dropdown-container" ref={focusDropdownRef}>
            <button 
              type="button" 
              className="dropdown-trigger"
              onClick={() => setShowFocusDropdown(!showFocusDropdown)}
            >
              <span>{getFocusAreasDisplay()}</span>
              <ChevronDown size={16} className={showFocusDropdown ? 'rotate-180' : ''} />
            </button>
            
            {showFocusDropdown && (
              <div className="dropdown-menu">
                {focusAreasList.map(area => (
                  <label key={area} className="dropdown-option">
                    <input
                      type="checkbox"
                      checked={formData.focusAreas.includes(area)}
                      onChange={() => toggleFocusArea(area)}
                    />
                    <span>{area}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Selected Focus Areas */}
          {formData.focusAreas.length > 0 && (
            <div className="selected-items">
              <h4>Selected Focus Areas:</h4>
              <div className="selected-chips">
                {formData.focusAreas.map(area => (
                  <div key={area} className="selected-chip">
                    {area}
                    <button 
                      type="button" 
                      className="chip-remove"
                      onClick={() => removeFocusArea(area)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Focus Area Input */}
          {formData.focusAreas.includes("Other") && (
            <div className="custom-input-group">
              <input
                type="text"
                placeholder="Specify your focus area..."
                value={formData.customFocusArea}
                onChange={(e) => setFormData(prev => ({ ...prev, customFocusArea: e.target.value }))}
                className="input-field"
              />
              <button 
                type="button" 
                className="add-custom-btn"
                onClick={addCustomFocusArea}
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Organization Details */}
        <section className="form-section organization-details">
          <div className="section-header">
            <h3>Organization Details</h3>
          </div>
          
          <div className="form-group">
            <label>Brief Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your organization's purpose, activities, and impact..."
              className="textarea-field"
            />
          </div>
          
          <div className="form-group">
            <label>Mission Statement</label>
            <textarea
              rows="3"
              value={formData.mission}
              onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
              placeholder="What is your organization's core mission and values?"
              className="textarea-field"
            />
          </div>

          <div className="grid-two">
            <div className="form-group">
              <label>Year Established</label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.establishedYear}
                onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: e.target.value }))}
                placeholder="YYYY"
                className="input-field"
              />
            </div>
            
            {/* Legal Form - Updated to Dropdown like Focus Areas */}
            <div className="form-group legal-form-container">
              <label>Legal Form</label>
              <div className="dropdown-container" ref={legalDropdownRef}>
                <button 
                  type="button" 
                  className="dropdown-trigger"
                  onClick={() => setShowLegalDropdown(!showLegalDropdown)}
                >
                  <span>{getLegalFormDisplay()}</span>
                  <ChevronDown size={16} className={showLegalDropdown ? 'rotate-180' : ''} />
                </button>
                
                {showLegalDropdown && (
                  <div className="dropdown-menu">
                    {legalForms.map(form => (
                      <label key={form} className="dropdown-option">
                        <input
                          type="checkbox"
                          checked={formData.legalForm.includes(form)}
                          onChange={() => toggleLegalForm(form)}
                        />
                        <span>{form}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Legal Forms */}
              {formData.legalForm.length > 0 && (
                <div className="selected-items">
                  <div className="selected-chips">
                    {formData.legalForm.map(form => (
                      <div key={form} className="selected-chip">
                        {form}
                        <button 
                          type="button" 
                          className="chip-remove"
                          onClick={() => removeLegalForm(form)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom Legal Form Input */}
              {formData.legalForm.includes("Other") && (
                <div className="custom-input-group">
                  <input
                    type="text"
                    placeholder="Specify your legal form..."
                    value={formData.customLegalForm}
                    onChange={(e) => setFormData(prev => ({ ...prev, customLegalForm: e.target.value }))}
                    className="input-field"
                  />
                  <button 
                    type="button" 
                    className="add-custom-btn"
                    onClick={addCustomLegalForm}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" className="primary-btn with-icon">
            Continue to Step 2
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </section>
  );
}

export default Reg;