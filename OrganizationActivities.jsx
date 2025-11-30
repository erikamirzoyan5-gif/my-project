import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

function OrganizationActivities() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [activities, setActivities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      let endpoint = '';
      switch (activeTab) {
        case 'all':
          endpoint = '/api/user/activities';
          break;
        case 'posts':
          endpoint = '/api/user/posts';
          break;
        case 'liked':
          endpoint = '/api/user/liked-posts';
          break;
        case 'saved':
          endpoint = '/api/user/saved-posts';
          break;
        default:
          endpoint = '/api/user/activities';
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        switch (activeTab) {
          case 'all':
            setActivities(data.activities || []);
            break;
          case 'posts':
            setPosts(data.posts || []);
            break;
          case 'liked':
            setLikedPosts(data.posts || []);
            break;
          case 'saved':
            setSavedPosts(data.posts || []);
            break;
        }
      } else {
        throw new Error(data.error || 'Unknown API error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? It will be moved to trash for 30 days before permanent deletion.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove post from local state
        setPosts(prev => prev.filter(post => post._id !== postId));
        // Refresh activities
        if (activeTab === 'all') {
          fetchUserData();
        }
      } else {
        const data = await response.json();
        alert('Error deleting post: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post: ' + error.message);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="error-state">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchUserData} className="retry-btn">
            Try Again
          </button>
        </div>
      );
    }

    if (loading) {
      return <div className="loading">Loading your {activeTab}...</div>;
    }

    switch (activeTab) {
      case 'all':
        return (
          <div className="activities-list">
            {activities.length === 0 ? (
              <p className="empty-state">No activities yet. Start by creating your first post!</p>
            ) : (
              activities.map(activity => (
                <div key={activity._id} className="activity-item">
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-text">{getActivityText(activity)}</p>
                    <div className="activity-time-wrapper">
                      <span className="activity-time">
                        {formatTime(activity.createdAt)}
                      </span>
                      {activity.postId?.content && (
                        <span className="activity-preview">
                          "{activity.postId.content.substring(0, 50)}..."
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'posts':
        return (
          <div className="posts-grid">
            {posts.length === 0 ? (
              <p className="empty-state">No posts yet. Create your first post from your profile!</p>
            ) : (
              posts.map(post => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <img 
                      src={post.userId?.profileImage || "/nkarner/default-avatar.jpg"} 
                      alt="Profile" 
                      className="post-avatar" 
                    />
                    <div className="post-author">
                      <span className="author-name">
                        {post.userId?.organizationName || post.userId?.name || 'Organization'}
                      </span>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button 
                      className="delete-post-btn"
                      onClick={() => handleDeletePost(post._id)}
                      title="Delete post"
                    >
                      <img src="/nkarner/trash.png" alt="Delete" className="action-icon" />
                    </button>
                  </div>
                  
                  {post.image && (
                    <img src={post.image} alt="Post" className="post-image" />
                  )}
                  <p className="post-content">{post.content}</p>
                  
                  <div className="post-stats">
                    <div className="stat-item">
                      <img src="/nkarner/heart (1).png" alt="Likes" className="stat-icon" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <img src="/nkarner/chat (1).png" alt="Comments" className="stat-icon" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <img src="/nkarner/bookmark (1).png" alt="Saves" className="stat-icon" />
                      <span>{post.saves?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'liked':
        return (
          <div className="posts-grid">
            {likedPosts.length === 0 ? (
              <p className="empty-state">No liked posts yet. Start exploring and liking posts!</p>
            ) : (
              likedPosts.map(post => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <img 
                      src={post.userId?.profileImage || "/nkarner/default-avatar.jpg"} 
                      alt="Profile" 
                      className="post-avatar" 
                    />
                    <div className="post-author">
                      <span className="author-name">
                        {post.userId?.organizationName || post.userId?.name || 'Unknown'}
                      </span>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {post.image && (
                    <img src={post.image} alt="Post" className="post-image" />
                  )}
                  <p className="post-content">{post.content}</p>
                  
                  <div className="post-stats">
                    <div className="stat-item">
                      <img src="/nkarner/heart (1).png" alt="Likes" className="stat-icon" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <img src="/nkarner/chat (1).png" alt="Comments" className="stat-icon" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'saved':
        return (
          <div className="posts-grid">
            {savedPosts.length === 0 ? (
              <p className="empty-state">No saved posts yet. Save posts to find them later!</p>
            ) : (
              savedPosts.map(post => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <img 
                      src={post.userId?.profileImage || "/nkarner/default-avatar.jpg"} 
                      alt="Profile" 
                      className="post-avatar" 
                    />
                    <div className="post-author">
                      <span className="author-name">
                        {post.userId?.organizationName || post.userId?.name || 'Unknown'}
                      </span>
                      <span className="post-date">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {post.image && (
                    <img src={post.image} alt="Post" className="post-image" />
                  )}
                  <p className="post-content">{post.content}</p>
                  
                  <div className="post-stats">
                    <div className="stat-item">
                      <img src="/nkarner/heart (1).png" alt="Likes" className="stat-icon" />
                      <span>{post.likes?.length || 0}</span>
                    </div>
                    <div className="stat-item">
                      <img src="/nkarner/chat (1).png" alt="Comments" className="stat-icon" />
                      <span>{post.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return '📝';
      case 'like': return '❤️';
      case 'save': return '💾';
      case 'comment': return '💬';
      default: return '🔔';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'post': return 'Your organization created a new post';
      case 'like': return 'Your organization liked a post';
      case 'save': return 'Your organization saved a post';
      case 'comment': return 'Your organization commented on a post';
      default: return activity.content || 'New activity';
    }
  };

  return (
    <div className="activities-page">
      <div className="page-header">
        <h1>Organization Activities</h1>
        <p>Track your organization's engagement and content</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Activities
          </button>
          <button 
            className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Organization Posts
          </button>
          <button 
            className={`tab ${activeTab === 'liked' ? 'active' : ''}`}
            onClick={() => setActiveTab('liked')}
          >
            Liked Posts
          </button>
          <button 
            className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            Saved Posts
          </button>
        </div>
      </div>

      <div className="activities-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default OrganizationActivities;

