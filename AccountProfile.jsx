import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Star } from "lucide-react";

function AccountProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUserInterests, updateUserProfile } = useAuth();
  
  const initialInterests = location.state?.selectedInterests || user?.interests || [];
  
  const [profileImage, setProfileImage] = useState(user?.profileImage || "/nkarner/default-avatar.jpg");
  const [coverImage, setCoverImage] = useState(user?.coverImage || "/nkarner/default-cover.jpg");
  const [userInterests, setUserInterests] = useState(initialInterests);
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    title: user?.title || "",
    location: user?.location || "",
    about: user?.about || "",
    email: user?.email || "",
    phone: user?.phone || "",
    website: user?.website || ""
  });
  
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    content: "",
    image: null
  });

  // Update user info when user data changes
  useEffect(() => {
    if (user) {
      setUserInfo(prev => ({
        ...prev,
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        phone: user.phone || "",
        title: user.title || "",
        location: user.location || "",
        about: user.about || "",
        website: user.website || ""
      }));
      setProfileImage(user.profileImage || "/nkarner/default-avatar.jpg");
      setCoverImage(user.coverImage || "/nkarner/default-cover.jpg");
    }
  }, [user]);

  const allInterests = [
    "Environment", "Education", "Technology", "Health", 
    "Arts & Culture", "Community Development", "Human Rights", 
    "Social Inclusion", "International Exchanges", "Entrepreneurship"
  ];

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // Auto-save profile image
      if (updateUserProfile) {
        await updateUserProfile({ profileImage: imageUrl });
      }
    }
  };

  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
      // Auto-save cover image
      if (updateUserProfile) {
        await updateUserProfile({ coverImage: imageUrl });
      }
    }
  };

  const toggleInterest = async (interestName) => {
    const newInterests = userInterests.includes(interestName) 
      ? userInterests.filter(item => item !== interestName)
      : [...userInterests, interestName];
    
    setUserInterests(newInterests);
    
    // Auto-save interests
    if (updateUserInterests) {
      await updateUserInterests(newInterests);
    }
  };

  const handleInputChange = async (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-save to backend after 1 second delay
    if (updateUserProfile && user) {
      setTimeout(async () => {
        await updateUserProfile({ [field]: value });
      }, 1000);
    }
  };

  const handleSaveProfile = async () => {
    // Update user interests in the global state
    if (updateUserInterests) {
      await updateUserInterests(userInterests);
    }

    // Update user profile data
    if (updateUserProfile) {
      const profileData = {
        title: userInfo.title,
        location: userInfo.location,
        about: userInfo.about,
        website: userInfo.website,
        profileImage: profileImage,
        coverImage: coverImage
      };
      await updateUserProfile(profileData);
    }
    
    console.log("Profile saved:", { ...userInfo, interests: userInterests });
    navigate("/dashboard"); // Տանում է dashboard
  };

  const handleEditInterests = () => {
    setIsEditingInterests(true);
  };

  const handleSaveInterests = async () => {
    setIsEditingInterests(false);
    // Save interests when exiting edit mode
    if (updateUserInterests) {
      await updateUserInterests(userInterests);
    }
  };

  // Posts functionality
  const handlePostInputChange = (field, value) => {
    setNewPost(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewPost(prev => ({
        ...prev,
        image: imageUrl
      }));
    }
  };

  // AccountProfile.jsx-ում
// AccountProfile.jsx-ում
const handleCreatePost = async () => {
  if (newPost.content.trim() || newPost.image) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again');
        return;
      }

      console.log('🔄 Creating post...');
      
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPost.content,
          image: newPost.image
        })
      });

      console.log('📨 Response status:', response.status);
      
      // Ստուգեք response-ի content type-ը
      const contentType = response.headers.get('content-type');
      console.log('📄 Content-Type:', contentType);

      const text = await response.text();
      console.log('📝 Raw response:', text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('📝 Full response:', text);
        alert('Server returned invalid response. Check console for details.');
        return;
      }

      if (data.success) {
        console.log('✅ Post created successfully:', data.post);
        setPosts(prev => [data.post, ...prev]);
        setNewPost({
          content: "",
          image: null
        });
        alert('Post created successfully!');
      } else {
        console.error('❌ API error:', data.error);
        alert('Error creating post: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Network error: ' + error.message);
    }
  } else {
    alert('Please enter some content or add an image');
  }
};
  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return (
    <div className="account-profile-page">
      {/* Header Section */}
      <div className="profile-header">
        <div className="cover-container">
          <div className="cover-photo">
            <img src={coverImage}  />
            <div className="cover-overlay"></div>
          </div>
          <div className="cover-actions">
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="cover-upload-input"
              id="cover-upload"
            />
            <label htmlFor="cover-upload" className="cover-action-btn">
              <span className="icon"></span>
              Edit Cover
            </label>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-container">
          <div className="avatar-section">
            <div className="avatar-wrapper" style={{ position: 'relative' }}>
              <img src={profileImage}  className="profile-avatar" />
              {user?.isApproved === 'approved' && (
                <Star 
                  className="approved-star" 
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '24px',
                    height: '24px',
                    color: '#FFD700',
                    fill: '#FFD700',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    padding: '2px',
                    zIndex: 10
                  }}
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="avatar-upload-input"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                <img src="/nkarner/photo-camera.png" alt="Upload" className="camera-icon" />
            </label>

            </div>
          </div>

          <div className="profile-main-info">
            <div className="name-section">
              <input
                type="text"
                placeholder="Your Full Name"
                value={userInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="name-input"
              />
              <input
                type="text"
                placeholder="Professional Headline"
                value={userInfo.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="title-input"
              />
            </div>
            
            <div className="location-contact">
              <input
                type="text"
                placeholder="📍 Location"
                value={userInfo.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="location-input"
              />
              <div className="contact-badges">
                <div className="contact-badge">
                  <span className="badge-icon"></span>
                  <input
                    type="email"
                    placeholder="Email"
                    value={userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="contact-input"
                  />
                </div>
                <div className="contact-badge">
                  <span className="badge-icon"></span>
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={userInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="contact-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content-wrapper">
        <div className="content-grid">
          {/* Left Sidebar */}
          <div className="sidebar-column">
            {/* About Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>About Me</h3>
                <div className="section-icon"></div>
              </div>
              <textarea
                placeholder="Share your story, passions, and what drives you..."
                value={userInfo.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                className="about-textarea"
                rows="5"
              />
            </div>

            {/* Interests Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Areas of Interest</h3>
                <div className="section-actions">
                  {!isEditingInterests ? (
                    <button className="action-btn edit-btn" onClick={handleEditInterests}>
                      Edit
                    </button>
                  ) : (
                    <button className="action-btn save-btn" onClick={handleSaveInterests}>
                      Save
                    </button>
                  )}
                </div>
              </div>
              
              {isEditingInterests ? (
                <div className="interests-edit-panel">
                  <p className="edit-guide">Select your areas of interest:</p>
                  <div className="interests-grid-edit">
                    {allInterests.map((interest) => (
                      <label key={interest} className="interest-option">
                        <input
                          type="checkbox"
                          checked={userInterests.includes(interest)}
                          onChange={() => toggleInterest(interest)}
                          className="interest-checkbox-input"
                        />
                        <span className="interest-checkbox"></span>
                        <span className="interest-label">{interest}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="interests-display">
                  {userInterests.length > 0 ? (
                    <div className="interests-tags">
                      {userInterests.map((interest) => (
                        <span key={interest} className="interest-tag">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-state">No interests selected yet</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Column */}
          <div className="main-column">
            {/* Create Post Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Create Post</h3>
                <div className="section-icon"></div>
              </div>
              <div className="create-post-form">
                <textarea
                  placeholder="Share what's on your mind..."
                  value={newPost.content}
                  onChange={(e) => handlePostInputChange('content', e.target.value)}
                  className="post-textarea"
                  rows="3"
                />
                <div className="post-actions">
                  <div className="post-media-actions">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePostImageUpload}
                      className="media-upload-input"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="media-action-btn">
                      <span className="icon"></span>
                      Add Photo
                    </label>
                  </div>
                  <button 
                    className="post-submit-btn"
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() && !newPost.image}
                  >
                    Post
                  </button>
                </div>
                {newPost.image && (
                  <div className="post-preview">
                    <img src={newPost.image} alt="Post preview" className="post-preview-image" />
                    <button 
                      className="remove-preview-btn"
                      onClick={() => setNewPost(prev => ({ ...prev, image: null }))}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Posts Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>My Posts</h3>
                <div className="section-icon"></div>
              </div>
              <div className="posts-feed">
                {posts.length > 0 ? (
                  posts.map(post => (
                    <div key={post.id} className="post-item">
                      <div className="post-header">
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                          <img src={profileImage} alt="Profile" className="post-author-avatar" />
                          {user?.isApproved === 'approved' && (
                            <Star 
                              className="approved-star" 
                              style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '20px',
                                height: '20px',
                                color: '#FFD700',
                                fill: '#FFD700',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                padding: '2px'
                              }}
                            />
                          )}
                        </div>
                        <div className="post-author-info">
                          <div className="post-author-name">{userInfo.name || "Anonymous"}</div>
                          <div className="post-time">{post.timestamp}</div>
                        </div>
                      </div>
                      <div className="post-content">
                        {post.content && <p>{post.content}</p>}
                        {post.image && (
                          <div className="post-image-container">
                            <img src={post.image} alt="Post" className="post-image" />
                          </div>
                        )}
                      </div>
                      
                    </div>
                  ))
                ) : (
                  <div className="empty-posts-state">
                    <p>No posts yet. Share your first post above!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Experience Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Volunteer Experience</h3>
                <div className="section-icon"></div>
              </div>
              <div className="experience-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Role or Position"
                    className="experience-input"
                  />
                  <input
                    type="text"
                    placeholder="Organization"
                    className="experience-input"
                  />
                </div>
                <textarea
                  placeholder="Describe your responsibilities and achievements..."
                  className="experience-textarea"
                  rows="3"
                />
                <button className="add-experience-btn">
                  <span className="icon">+</span>
                  Add Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="profile-actions-footer">
        <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
          Preview Profile
        </button>
        <button className="primary-btn" onClick={handleSaveProfile}>
          Save & Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

export default AccountProfile;