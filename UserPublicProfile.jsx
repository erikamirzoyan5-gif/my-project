import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const defaultAvatar = "/nkarner/default-avatar.jpg";
const defaultCover = "/nkarner/default-cover.jpg";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function UserPublicProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError("You need to log in to view profiles.");
      setLoadingProfile(false);
      setLoadingPosts(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load profile.");
        }

        setProfile(data.user);
      } catch (err) {
        console.error("Error loading public profile:", err);
        setError(err.message);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await fetch(`${API_BASE_URL}/users/${userId}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load posts.");
        }

        setPosts(data.posts || []);
      } catch (err) {
        console.error("Error loading public posts:", err);
        setError((prev) => prev || err.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [userId]);

  if (loadingProfile) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error-state" style={{ padding: "40px", textAlign: "center" }}>
        <p>{error}</p>
        <button className="primary-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-state" style={{ padding: "40px", textAlign: "center" }}>
        <p>User not found</p>
        <button className="primary-btn" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const isOrganization =
    profile.accountType === "organization" ||
    (profile.organizationName &&
      profile.organizationName !== "Default Organization");

  const displayName =
    (isOrganization && (profile.organizationName || profile.name)) ||
    [profile.name, profile.surname].filter(Boolean).join(" ") ||
    profile.username;

  const titleText =
    profile.title ||
    (isOrganization
      ? Array.isArray(profile.organizationType)
        ? profile.organizationType.join(", ")
        : profile.organizationType || "Organization"
      : "Community Member");

  return (
    <div className="account-profile-page public-profile-page">
      <div className="profile-actions-bar">
        <button className="secondary-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      <div className="profile-header">
        <div className="cover-container">
          <div className="cover-photo">
            <img src={profile.coverImage || defaultCover} alt="Cover" />
            <div className="cover-overlay"></div>
          </div>
        </div>

        <div className="profile-info-container">
          <div className="avatar-section">
            <div className="avatar-wrapper" style={{ position: "relative" }}>
              <img
                src={profile.profileImage || defaultAvatar}
                alt="Profile"
                className="profile-avatar"
              />
              {profile.isApproved === "approved" && (
                <Star
                  className="approved-star"
                  style={{
                    position: "absolute",
                    bottom: "0",
                    right: "0",
                    width: "24px",
                    height: "24px",
                    color: "#FFD700",
                    fill: "#FFD700",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    padding: "2px",
                  }}
                />
              )}
            </div>
          </div>

          <div className="profile-main-info">
            <div className="name-section">
              <h1 className="name-display">{displayName}</h1>
              <p className="title-display">{titleText}</p>
            </div>

            <div className="location-contact">
              <p className="location-display">
                {profile.location || "Location not provided"}
              </p>
              <div className="contact-badges">
                <div className="contact-badge">
                  <span className="badge-icon"></span>
                  <span className="contact-display">
                    {profile.email || "No email available"}
                  </span>
                </div>
                {profile.phone && (
                  <div className="contact-badge">
                    <span className="badge-icon"></span>
                    <span className="contact-display">{profile.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content-wrapper">
        <div className="content-grid">
          <div className="sidebar-column">
            <div className="profile-section">
              <div className="section-header">
                <h3>About</h3>
                <div className="section-icon"></div>
              </div>
              <div className="about-display">
                {profile.about || "No bio yet."}
              </div>
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Areas of Interest</h3>
                <div className="section-icon"></div>
              </div>
              <div className="interests-display">
                {profile.interests && profile.interests.length > 0 ? (
                  <div className="interests-tags">
                    {profile.interests.map((interest) => (
                      <span key={interest} className="interest-tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No interests shared.</p>
                )}
              </div>
            </div>

            {isOrganization && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>Organization Details</h3>
                  <div className="section-icon"></div>
                </div>
                <div className="details-grid">
                  {profile.organizationId && (
                    <div className="detail-item">
                      <strong>Registration ID:</strong> {profile.organizationId}
                    </div>
                  )}
                  {profile.representativeName && (
                    <div className="detail-item">
                      <strong>Representative:</strong> {profile.representativeName}
                    </div>
                  )}
                  {profile.representativeEmail && (
                    <div className="detail-item">
                      <strong>Representative Email:</strong>{" "}
                      {profile.representativeEmail}
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Joined:</strong> {formatDate(profile.createdAt)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="main-column">
            <div className="profile-section">
              <div className="section-header">
                <h3>{isOrganization ? "Organization Posts" : "Recent Posts"}</h3>
                <div className="section-icon"></div>
              </div>
              <div className="posts-feed">
                {loadingPosts ? (
                  <div className="loading">Loading posts...</div>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <div key={post._id} className="post-item">
                      <div className="post-header">
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img
                            src={
                              post.userId?.profileImage ||
                              profile.profileImage ||
                              defaultAvatar
                            }
                            alt="Profile"
                            className="post-author-avatar"
                          />
                          {post.userId?.isApproved === "approved" && (
                            <Star
                              className="approved-star"
                              style={{
                                position: "absolute",
                                bottom: "0",
                                right: "0",
                                width: "18px",
                                height: "18px",
                                color: "#FFD700",
                                fill: "#FFD700",
                                backgroundColor: "white",
                                borderRadius: "50%",
                                padding: "2px",
                              }}
                            />
                          )}
                        </div>
                        <div className="post-author-info">
                          <div className="post-author-name">{displayName}</div>
                          <div className="post-time">
                            {formatDate(post.createdAt)}
                          </div>
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
                    <p>No posts to display yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserPublicProfile;

