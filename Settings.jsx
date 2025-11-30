// Settings.jsx - ուղղված տարբերակ debug-ով
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Star } from "lucide-react";

function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [trashPosts, setTrashPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'trash') {
      fetchTrashPosts();
    }
  }, [activeTab]);

  const fetchTrashPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log('🔄 Fetching trash posts...');
      
      const response = await fetch('http://localhost:5000/api/user/trash', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Trash response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🗑️ Trash data:', data);

      if (data.success) {
        setTrashPosts(data.posts || []);
        console.log(`✅ Loaded ${data.posts?.length || 0} posts from trash`);
      } else {
        console.error('❌ API error:', data.error);
        alert('Error loading trash: ' + data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching trash:', error);
      alert('Error loading trash: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePost = async (postId) => {
    if (!window.confirm('Are you sure you want to restore this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log(`🔄 Restoring post: ${postId}`);
      
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/restore`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Restore response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Restore response:', data);
        
        if (data.success) {
          alert('Post restored successfully!');
          fetchTrashPosts(); // Refresh the list
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Restore error:', errorData);
        alert('Error restoring post: ' + errorData.error);
      }
    } catch (error) {
      console.error('❌ Error restoring post:', error);
      alert('Error restoring post: ' + error.message);
    }
  };

  const handlePermanentDelete = async (postId) => {
    if (!window.confirm('This action cannot be undone. Are you sure you want to permanently delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log(`💀 Permanent delete: ${postId}`);
      
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/permanent`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📨 Permanent delete response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Permanent delete response:', data);
        
        if (data.success) {
          alert('Post permanently deleted!');
          fetchTrashPosts(); // Refresh the list
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Permanent delete error:', errorData);
        alert('Error deleting post: ' + errorData.error);
      }
    } catch (error) {
      console.error('❌ Error permanent deleting post:', error);
      alert('Error deleting post: ' + error.message);
    }
  };

  const getDaysUntilPermanentDeletion = (deletedAt) => {
    if (!deletedAt) return 30;
    
    const deletedDate = new Date(deletedAt);
    const now = new Date();
    const daysDiff = Math.floor((now - deletedDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysDiff);
  };

  const renderTrashContent = () => {
    if (loading) {
      return <div className="loading">Loading deleted posts...</div>;
    }

    console.log('🔄 Rendering trash content, posts count:', trashPosts.length);

    if (trashPosts.length === 0) {
      return (
        <div className="empty-trash">
          <div className="empty-icon">🗑️</div>
          <h3>Trash is Empty</h3>
          <p>Deleted posts will appear here for 30 days before being permanently deleted.</p>
          <button 
            onClick={fetchTrashPosts}
            className="retry-btn"
            style={{marginTop: '20px', padding: '10px 20px'}}
          >
            Refresh Trash
          </button>
        </div>
      );
    }

    return (
      <div className="trash-posts">
        <div className="trash-header">
          <h3>Deleted Posts ({trashPosts.length})</h3>
          <p className="trash-warning">
            ⚠️ Posts in trash will be automatically permanently deleted after 30 days.
          </p>
          <button 
            onClick={fetchTrashPosts}
            className="refresh-btn"
          >
            Refresh
          </button>
        </div>

        <div className="posts-grid">
          {trashPosts.map(post => {
            const daysLeft = getDaysUntilPermanentDeletion(post.deletedAt);
            
            return (
              <div key={post._id} className="post-card deleted-post">
                <div className="post-header">
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={post.userId?.profileImage || "/nkarner/default-avatar.jpg"} 
                      alt="Profile" 
                      className="post-avatar" 
                    />
                    {post.userId?.isApproved === 'approved' && (
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
                  <div className="post-author">
                    <span className="author-name">
                      {post.userId?.name || 'You'} {post.userId?.surname || ''}
                    </span>
                    <span className="post-date">
                      Deleted: {new Date(post.deletedAt || post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {post.image && (
                  <img src={post.image} alt="Post" className="post-image" />
                )}
                <p className="post-content">{post.content}</p>
                
                <div className="deletion-info">
                  <div className="days-left">
                    <span className={`days-count ${daysLeft <= 7 ? 'warning' : ''}`}>
                      {daysLeft} days left
                    </span>
                    <span className="deletion-text">until permanent deletion</span>
                  </div>
                </div>

                <div className="trash-actions">
                  <button 
                    className="restore-btn"
                    onClick={() => handleRestorePost(post._id)}
                  >
                    📥 Restore
                  </button>
                  <button 
                    className="permanent-delete-btn"
                    onClick={() => handlePermanentDelete(post._id)}
                  >
                    🗑️ Delete Forever
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ... մնացած կոդը նույնը
  const renderAccountSettings = () => {
    return (
      <div className="account-settings">
        <h3>Account Settings</h3>
        <div className="settings-section">
          <div className="setting-item">
            <label>Email Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Push Notifications</label>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="setting-item">
            <label>Privacy</label>
            <select defaultValue="public">
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="friends">Friends Only</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Language</label>
            <select defaultValue="en">
              <option value="en">English</option>
              <option value="hy">Armenian</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and content</p>
      </div>

      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <div className="settings-sidebar">
          <button 
            className={`sidebar-tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <span className="tab-icon">👤</span>
            Account Settings
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'trash' ? 'active' : ''}`}
            onClick={() => setActiveTab('trash')}
          >
            <span className="tab-icon">🗑️</span>
            Trash Management
            {trashPosts.length > 0 && (
              <span className="tab-badge">{trashPosts.length}</span>
            )}
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            <span className="tab-icon">🔒</span>
            Privacy & Security
          </button>
          <button 
            className={`sidebar-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="tab-icon">🔔</span>
            Notifications
          </button>
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'trash' && renderTrashContent()}
          {activeTab === 'privacy' && (
            <div className="privacy-settings">
              <h3>Privacy & Security</h3>
              <p>Privacy settings coming soon...</p>
            </div>
          )}
          {activeTab === 'notifications' && (
            <div className="notification-settings">
              <h3>Notification Preferences</h3>
              <p>Notification settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;