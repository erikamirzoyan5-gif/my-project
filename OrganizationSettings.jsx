import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Plus, Trash2, Save, Edit2 } from "lucide-react";
import "./OrganizationSettings.css";

function OrganizationSettings() {
  const { user, updateUserProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState({});
  
  // Step 1: Organization Profile
  const [stepOneData, setStepOneData] = useState({
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

  // Step 2: Contact & Networks
  const [stepTwoData, setStepTwoData] = useState({
    orgContactEmail: "",
    orgContactPhone: "",
    orgSecondaryPhone: "",
    address: "",
    website: "",
    socialLinks: [""],
    networks: [],
    customNetwork: ""
  });

  // Step 3: Team & Security
  const [stepThreeData, setStepThreeData] = useState({
    secureSealText: "",
    secureSealAcknowledged: false,
    authorizedMembers: [{ fullName: "", role: "", email: "" }]
  });

  // Step 4: Verification
  const [stepFourData, setStepFourData] = useState({
    username: "",
    email: "",
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

  useEffect(() => {
    if (user) {
      // Load Step 1 data
      setStepOneData({
        nameBlocks: user.nameBlocks || [{ language: "Armenian", name: user.organizationName || "" }],
        orgType: user.organizationType || [],
        customOrgType: "",
        audiences: user.targetAudience || [],
        description: user.description || "",
        mission: user.mission || "",
        focusAreas: user.focusAreas || [],
        customFocusArea: "",
        establishedYear: user.establishedYear || "",
        legalForm: user.legalForm || [],
        customLegalForm: ""
      });

      // Load Step 2 data
      setStepTwoData({
        orgContactEmail: user.contactEmail || user.email || "",
        orgContactPhone: user.phone || "",
        orgSecondaryPhone: "",
        address: user.location || "",
        website: user.website || "",
        socialLinks: user.socialLinks || [""],
        networks: user.networks || [],
        customNetwork: ""
      });

      // Load Step 3 data
      setStepThreeData({
        secureSealText: user.secureSealText || "",
        secureSealAcknowledged: false,
        authorizedMembers: user.authorizedMembers || [{ fullName: "", role: "", email: "" }]
      });

      // Load Step 4 data
      setStepFourData({
        username: user.username || "",
        email: user.email || "",
        representative: {
          name: user.representativeName || "",
          surname: "",
          phone: "",
          email: user.representativeEmail || ""
        },
        verification: {
          stateRegistrationId: user.organizationId || "",
          country: "",
          legalId: "",
          vatNumber: user.vatNumber || "",
          phoneVerified: false,
          emailVerified: false,
          repPassportNumber: "",
          repBirthDate: ""
        }
      });
    }
  }, [user]);

  const toggleEditMode = (section) => {
    setEditMode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async (section) => {
    setSaving(true);
    try {
      let updateData = {};
      
      switch (section) {
        case 'step1':
          updateData = {
            organizationName: stepOneData.nameBlocks[0]?.name || "",
            organizationType: stepOneData.orgType,
            description: stepOneData.description,
            mission: stepOneData.mission,
            focusAreas: stepOneData.focusAreas,
            establishedYear: stepOneData.establishedYear,
            legalForm: stepOneData.legalForm,
            targetAudience: stepOneData.audiences
          };
          break;
        case 'step2':
          updateData = {
            contactEmail: stepTwoData.orgContactEmail,
            phone: stepTwoData.orgContactPhone,
            location: stepTwoData.address,
            website: stepTwoData.website,
            socialLinks: stepTwoData.socialLinks.filter(link => link.trim() !== ""),
            networks: stepTwoData.networks
          };
          break;
        case 'step3':
          updateData = {
            secureSealText: stepThreeData.secureSealText,
            authorizedMembers: stepThreeData.authorizedMembers.filter(m => m.fullName.trim() !== "")
          };
          break;
        case 'step4':
          updateData = {
            representativeName: stepFourData.representative.name,
            representativeEmail: stepFourData.representative.email,
            organizationId: stepFourData.verification.stateRegistrationId,
            vatNumber: stepFourData.verification.vatNumber
          };
          break;
      }

      const result = await updateUserProfile(updateData);
      if (result.success) {
        setEditMode(prev => ({ ...prev, [section]: false }));
        alert('Settings saved successfully!');
      } else {
        alert('Error saving: ' + result.error);
      }
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addNameBlock = () => {
    setStepOneData(prev => ({
      ...prev,
      nameBlocks: [...prev.nameBlocks, { language: "English", name: "" }]
    }));
  };

  const removeNameBlock = (index) => {
    if (stepOneData.nameBlocks.length > 1) {
      setStepOneData(prev => ({
        ...prev,
        nameBlocks: prev.nameBlocks.filter((_, i) => i !== index)
      }));
    }
  };

  const updateNameBlock = (index, field, value) => {
    setStepOneData(prev => {
      const newBlocks = [...prev.nameBlocks];
      newBlocks[index] = { ...newBlocks[index], [field]: value };
      return { ...prev, nameBlocks: newBlocks };
    });
  };

  const addSocialLink = () => {
    setStepTwoData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, ""]
    }));
  };

  const removeSocialLink = (index) => {
    if (stepTwoData.socialLinks.length > 1) {
      setStepTwoData(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.filter((_, i) => i !== index)
      }));
    }
  };

  const addMember = () => {
    setStepThreeData(prev => ({
      ...prev,
      authorizedMembers: [...prev.authorizedMembers, { fullName: "", role: "", email: "" }]
    }));
  };

  const removeMember = (index) => {
    if (stepThreeData.authorizedMembers.length > 1) {
      setStepThreeData(prev => ({
        ...prev,
        authorizedMembers: prev.authorizedMembers.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMember = (index, field, value) => {
    setStepThreeData(prev => {
      const newMembers = [...prev.authorizedMembers];
      newMembers[index] = { ...newMembers[index], [field]: value };
      return { ...prev, authorizedMembers: newMembers };
    });
  };

  const renderStepOne = () => {
    const isEditing = editMode.step1;
    
    return (
      <div className="settings-section-content">
        <div className="section-header-actions">
          <h3>Step 1: Organization Profile</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => toggleEditMode('step1')}>
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <button className="save-btn" onClick={() => handleSave('step1')} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        <div className="settings-grid">
          <div className="setting-group">
            <label>Organization Names</label>
            {isEditing ? (
              <>
                {stepOneData.nameBlocks.map((block, index) => (
                  <div key={index} className="name-block-row">
                    <select
                      value={block.language}
                      onChange={(e) => updateNameBlock(index, 'language', e.target.value)}
                      className="input-field"
                    >
                      <option value="Armenian">Armenian</option>
                      <option value="English">English</option>
                      <option value="Russian">Russian</option>
                    </select>
                    <input
                      type="text"
                      value={block.name}
                      onChange={(e) => updateNameBlock(index, 'name', e.target.value)}
                      className="input-field"
                      placeholder="Organization name"
                    />
                    {stepOneData.nameBlocks.length > 1 && (
                      <button type="button" onClick={() => removeNameBlock(index)} className="icon-btn">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addNameBlock} className="ghost-btn">
                  <Plus size={16} /> Add Name
                </button>
              </>
            ) : (
              <div className="display-value">
                {stepOneData.nameBlocks.map((block, i) => (
                  <div key={i}><strong>{block.language}:</strong> {block.name || 'Not set'}</div>
                ))}
              </div>
            )}
          </div>

          <div className="setting-group">
            <label>Organization Type</label>
            {isEditing ? (
              <div className="tags-display">
                {stepOneData.orgType.map((type, i) => (
                  <span key={i} className="tag">{type}</span>
                ))}
                <input
                  type="text"
                  value={stepOneData.customOrgType}
                  onChange={(e) => setStepOneData(prev => ({ ...prev, customOrgType: e.target.value }))}
                  placeholder="Add custom type"
                  className="input-field"
                />
              </div>
            ) : (
              <div className="display-value">
                {stepOneData.orgType.length > 0 ? stepOneData.orgType.join(', ') : 'Not set'}
              </div>
            )}
          </div>

          <div className="setting-group">
            <label>Description</label>
            {isEditing ? (
              <textarea
                value={stepOneData.description}
                onChange={(e) => setStepOneData(prev => ({ ...prev, description: e.target.value }))}
                className="textarea-field"
                rows="4"
              />
            ) : (
              <div className="display-value">{stepOneData.description || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Mission</label>
            {isEditing ? (
              <textarea
                value={stepOneData.mission}
                onChange={(e) => setStepOneData(prev => ({ ...prev, mission: e.target.value }))}
                className="textarea-field"
                rows="4"
              />
            ) : (
              <div className="display-value">{stepOneData.mission || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Focus Areas</label>
            {isEditing ? (
              <div className="tags-display">
                {stepOneData.focusAreas.map((area, i) => (
                  <span key={i} className="tag">{area}</span>
                ))}
              </div>
            ) : (
              <div className="display-value">
                {stepOneData.focusAreas.length > 0 ? stepOneData.focusAreas.join(', ') : 'Not set'}
              </div>
            )}
          </div>

          <div className="setting-group">
            <label>Established Year</label>
            {isEditing ? (
              <input
                type="text"
                value={stepOneData.establishedYear}
                onChange={(e) => setStepOneData(prev => ({ ...prev, establishedYear: e.target.value }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepOneData.establishedYear || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Legal Form</label>
            {isEditing ? (
              <div className="tags-display">
                {stepOneData.legalForm.map((form, i) => (
                  <span key={i} className="tag">{form}</span>
                ))}
              </div>
            ) : (
              <div className="display-value">
                {stepOneData.legalForm.length > 0 ? stepOneData.legalForm.join(', ') : 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStepTwo = () => {
    const isEditing = editMode.step2;
    
    return (
      <div className="settings-section-content">
        <div className="section-header-actions">
          <h3>Step 2: Contact & Networks</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => toggleEditMode('step2')}>
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <button className="save-btn" onClick={() => handleSave('step2')} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        <div className="settings-grid">
          <div className="setting-group">
            <label>Contact Email</label>
            {isEditing ? (
              <input
                type="email"
                value={stepTwoData.orgContactEmail}
                onChange={(e) => setStepTwoData(prev => ({ ...prev, orgContactEmail: e.target.value }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepTwoData.orgContactEmail || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Primary Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={stepTwoData.orgContactPhone}
                onChange={(e) => setStepTwoData(prev => ({ ...prev, orgContactPhone: e.target.value }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepTwoData.orgContactPhone || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Secondary Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={stepTwoData.orgSecondaryPhone}
                onChange={(e) => setStepTwoData(prev => ({ ...prev, orgSecondaryPhone: e.target.value }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepTwoData.orgSecondaryPhone || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Address</label>
            {isEditing ? (
              <input
                type="text"
                value={stepTwoData.address}
                onChange={(e) => setStepTwoData(prev => ({ ...prev, address: e.target.value }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepTwoData.address || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Website</label>
            {isEditing ? (
              <input
                type="url"
                value={stepTwoData.website}
                onChange={(e) => setStepTwoData(prev => ({ ...prev, website: e.target.value }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepTwoData.website || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Social Links</label>
            {isEditing ? (
              <>
                {stepTwoData.socialLinks.map((link, index) => (
                  <div key={index} className="social-link-row">
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => {
                        const newLinks = [...stepTwoData.socialLinks];
                        newLinks[index] = e.target.value;
                        setStepTwoData(prev => ({ ...prev, socialLinks: newLinks }));
                      }}
                      className="input-field"
                      placeholder="https://..."
                    />
                    {stepTwoData.socialLinks.length > 1 && (
                      <button type="button" onClick={() => removeSocialLink(index)} className="icon-btn">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addSocialLink} className="ghost-btn">
                  <Plus size={16} /> Add Link
                </button>
              </>
            ) : (
              <div className="display-value">
                {stepTwoData.socialLinks.filter(l => l.trim() !== "").length > 0 
                  ? stepTwoData.socialLinks.filter(l => l.trim() !== "").map((link, i) => (
                      <div key={i}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></div>
                    ))
                  : 'No social links'}
              </div>
            )}
          </div>

          <div className="setting-group">
            <label>Networks</label>
            {isEditing ? (
              <div className="tags-display">
                {stepTwoData.networks.map((network, i) => (
                  <span key={i} className="tag">{network}</span>
                ))}
              </div>
            ) : (
              <div className="display-value">
                {stepTwoData.networks.length > 0 ? stepTwoData.networks.join(', ') : 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStepThree = () => {
    const isEditing = editMode.step3;
    
    return (
      <div className="settings-section-content">
        <div className="section-header-actions">
          <h3>Step 3: Team & Security</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => toggleEditMode('step3')}>
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <button className="save-btn" onClick={() => handleSave('step3')} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        <div className="settings-grid">
          <div className="setting-group">
            <label>Secure Seal Text</label>
            {isEditing ? (
              <textarea
                value={stepThreeData.secureSealText}
                onChange={(e) => setStepThreeData(prev => ({ ...prev, secureSealText: e.target.value }))}
                className="textarea-field"
                rows="3"
              />
            ) : (
              <div className="display-value">{stepThreeData.secureSealText || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group full-width">
            <label>Authorized Team Members</label>
            {isEditing ? (
              <>
                {stepThreeData.authorizedMembers.map((member, index) => (
                  <div key={index} className="member-card">
                    <div className="member-header">
                      <h4>Member #{index + 1}</h4>
                      {stepThreeData.authorizedMembers.length > 1 && (
                        <button type="button" onClick={() => removeMember(index)} className="icon-btn">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={member.fullName}
                      onChange={(e) => updateMember(index, 'fullName', e.target.value)}
                      placeholder="Full Name"
                      className="input-field"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateMember(index, 'role', e.target.value)}
                      placeholder="Role"
                      className="input-field"
                    />
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                      placeholder="Email"
                      className="input-field"
                    />
                  </div>
                ))}
                <button type="button" onClick={addMember} className="ghost-btn">
                  <Plus size={16} /> Add Member
                </button>
              </>
            ) : (
              <div className="members-display">
                {stepThreeData.authorizedMembers.filter(m => m.fullName.trim() !== "").length > 0 ? (
                  stepThreeData.authorizedMembers.filter(m => m.fullName.trim() !== "").map((member, i) => (
                    <div key={i} className="member-display-card">
                      <strong>{member.fullName}</strong>
                      <div>{member.role}</div>
                      <div>{member.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="display-value">No members added</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStepFour = () => {
    const isEditing = editMode.step4;
    
    return (
      <div className="settings-section-content">
        <div className="section-header-actions">
          <h3>Step 4: Verification & Login</h3>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => toggleEditMode('step4')}>
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <button className="save-btn" onClick={() => handleSave('step4')} disabled={saving}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>

        <div className="settings-grid">
          <div className="setting-group">
            <label>Username</label>
            <div className="display-value">{stepFourData.username || 'Not set'}</div>
          </div>

          <div className="setting-group">
            <label>Email</label>
            <div className="display-value">{stepFourData.email || 'Not set'}</div>
          </div>

          <div className="setting-group">
            <label>Representative Name</label>
            {isEditing ? (
              <input
                type="text"
                value={stepFourData.representative.name}
                onChange={(e) => setStepFourData(prev => ({
                  ...prev,
                  representative: { ...prev.representative, name: e.target.value }
                }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepFourData.representative.name || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>Representative Email</label>
            {isEditing ? (
              <input
                type="email"
                value={stepFourData.representative.email}
                onChange={(e) => setStepFourData(prev => ({
                  ...prev,
                  representative: { ...prev.representative, email: e.target.value }
                }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepFourData.representative.email || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>State Registration ID</label>
            {isEditing ? (
              <input
                type="text"
                value={stepFourData.verification.stateRegistrationId}
                onChange={(e) => setStepFourData(prev => ({
                  ...prev,
                  verification: { ...prev.verification, stateRegistrationId: e.target.value }
                }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepFourData.verification.stateRegistrationId || 'Not set'}</div>
            )}
          </div>

          <div className="setting-group">
            <label>VAT Number</label>
            {isEditing ? (
              <input
                type="text"
                value={stepFourData.verification.vatNumber}
                onChange={(e) => setStepFourData(prev => ({
                  ...prev,
                  verification: { ...prev.verification, vatNumber: e.target.value }
                }))}
                className="input-field"
              />
            ) : (
              <div className="display-value">{stepFourData.verification.vatNumber || 'Not set'}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Organization Settings</h1>
        <p>Manage your organization's registration data and information</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="tab-icon">📋</span>
            Organization Profile
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            <span className="tab-icon">📞</span>
            Contact & Networks
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <span className="tab-icon">👥</span>
            Team & Security
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'verification' ? 'active' : ''}`}
            onClick={() => setActiveTab('verification')}
          >
            <span className="tab-icon">🔐</span>
            Verification
          </button>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {activeTab === 'profile' && renderStepOne()}
          {activeTab === 'contact' && renderStepTwo()}
          {activeTab === 'team' && renderStepThree()}
          {activeTab === 'verification' && renderStepFour()}
        </div>
      </div>
    </div>
  );
}

export default OrganizationSettings;

