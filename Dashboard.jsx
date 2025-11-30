import React from "react";
import { useNavigate } from "react-router-dom"; // Ավելացրեք այս տողը
import { useAuth } from "./AuthContext";
import { Star } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate(); // Ավելացրեք այս տողը
  const { user } = useAuth();

  const handleEditProfile = () => {
    navigate("/accountProfile");
  };

  const handleViewActivities = () => {
    navigate("/activities");
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  return (
    <div className="dashboard-page">
      {/* Header Section */}
      <div className="profile-header">
        <div className="cover-container">
          <div className="cover-photo">
            <img src={user?.coverImage || "/nkarner/default-cover.jpg"}  />
            <div className="cover-overlay"></div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="profile-info-container">
          <div className="avatar-section">
            <div className="avatar-wrapper" style={{ position: 'relative' }}>
              <img src={user?.profileImage || "/nkarner/default-avatar.jpg"}  className="profile-avatar" />
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
                    padding: '2px'
                  }}
                />
              )}
            </div>
          </div>

          <div className="profile-main-info">
            <div className="name-section">
              <h1 className="name-display">{user?.name || "User"} {user?.surname || ""}</h1>
              <p className="title-display">{user?.title || "Member"}</p>
            </div>
            
            <div className="location-contact">
              <p className="location-display">{user?.location || "No location set"}</p>
              <div className="contact-badges">
                <div className="contact-badge">
                  <span className="badge-icon"></span>
                  <span className="contact-display">{user?.email || "No email"}</span>
                </div>
                {user?.phone && (
                  <div className="contact-badge">
                    <span className="badge-icon"></span>
                    <span className="contact-display">{user.phone}</span>
                  </div>
                )}
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
              <div className="about-display">
                {user?.about || "No bio yet"}
              </div>
            </div>

            {/* Interests Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Areas of Interest</h3>
                <div className="section-icon"></div>
              </div>
              <div className="interests-display">
                {user?.interests && user.interests.length > 0 ? (
                  <div className="interests-tags">
                    {user.interests.map((interest, index) => (
                      <span key={index} className="interest-tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No interests selected yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Main Column */}
          <div className="main-column">
            {/* Welcome Section */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Welcome to Your Dashboard</h3>
                <div className="section-icon"></div>
              </div>
              <div className="welcome-content">
                <p>Welcome back, {user?.name || "User"}! This is your personal dashboard where you can manage your profile and activities.</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Quick Actions</h3>
                <div className="section-icon"></div>
              </div>
              <div className="quick-actions">
                <button 
                  className="action-btn primary-btn" 
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
                <button 
                  className="action-btn secondary-btn" 
                  onClick={handleViewActivities}
                >
                  View Activities
                </button>
                <button 
                  className="action-btn secondary-btn" 
                  onClick={handleSettings}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="profile-section">
              <div className="section-header">
                <h3>Recent Activity</h3>
                <div className="section-icon"></div>
              </div>
              <div className="activity-feed">
                <div className="activity-item">
                  <div className="activity-icon"> ✅</div>
                  <div className="activity-content">
                    <p>Profile completed successfully</p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon"></div>
                  <div className="activity-content">
                    <p>Interests updated</p>
                    <span className="activity-time">Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;