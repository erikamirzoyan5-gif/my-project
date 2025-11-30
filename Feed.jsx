import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Search, X } from 'lucide-react';
import './Feed.css';

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [newPostContent, setNewPostContent] = useState('');
  const [suggestedUsers] = useState([
    { id: '1', name: 'Jake Smith', image: '/nkarner/person3.png' },
    { id: '2', name: 'Ann Brais', image: '/nkarner/person4.png' },
    { id: '3', name: 'Sane Rail', image: '/nkarner/person5.png' },
    { id: '4', name: 'Alex Morgan', image: '/nkarner/person6.png' },
    { id: '5', name: 'Taylor Swift', image: '/nkarner/person7.png' },
  ]);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view the feed');
        setLoading(false);
        return;
      }

      // Fetch posts from verified organizations
      const orgResponse = await fetch('http://localhost:5000/api/posts/organizations/verified', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Fetch posts from all players
      const playersResponse = await fetch('http://localhost:5000/api/posts/players', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (orgResponse.ok && playersResponse.ok) {
        const orgData = await orgResponse.json();
        const playersData = await playersResponse.json();
        
        // Combine and sort posts by creation date (newest first)
        const allPosts = [...orgData.posts, ...playersData.posts].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        setPosts(allPosts);
        
        if (allPosts.length === 0) {
          setError('No posts available yet. Be the first to post!');
        }
      } else {
        const errorText = await orgResponse.text().catch(() => 'Failed to load organization posts');
        if (!orgResponse.ok) {
          throw new Error(`Error loading organization posts: ${errorText}`);
        }
        const playersError = await playersResponse.text().catch(() => 'Failed to load player posts');
        throw new Error(`Error loading player posts: ${playersError}`);
      }
    } catch (error) {
      console.error('Error loading feed:', error);
      setError(error.message || 'Failed to load feed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p => p._id === postId ? data.post : p));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: comment })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(posts.map(p => p._id === postId ? data.post : p));
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCopyLink = async (postId) => {
    const postUrl = `${window.location.origin}/feed/post/${postId}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopiedPostId(postId);
      setTimeout(() => setCopiedPostId(null), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const handleShare = (postId) => {
    const postUrl = `${window.location.origin}/feed/post/${postId}`;
    const post = posts.find(p => p._id === postId);
    const shareText = post?.content?.substring(0, 100) || 'Check out this post on Greenwich!';
    
    if (navigator.share) {
      navigator.share({
        title: 'Greenwich Post',
        text: shareText,
        url: postUrl
      }).catch(err => console.log('Error sharing:', err));
    } else {
      handleCopyLink(postId);
    }
  };

  const isLiked = (post) => {
    if (!user || !post.likes) return false;
    return post.likes.some(like => 
      (typeof like === 'object' ? like._id : like) === user._id
    );
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="feed-loading">
          <div className="loading-spinner"></div>
          <p>Loading feed...</p>
        </div>
      </div>
    );
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to post');
        return;
      }

      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPostContent,
          // Add any other post data needed by your API
        })
      });

      if (response.ok) {
        const newPost = await response.json();
        setPosts([newPost, ...posts]);
        setNewPostContent('');
      } else {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
    }
  };

  return (
    <div className="feed-container">
      {/* Main Content */}
      <div className="feed-main">
        {/* Create Post */}
        <div className="create-post">
          <img 
            src={user?.profileImage || '/nkarner/person.png'} 
            alt="User" 
            className="user-avatar"
          />
          <form onSubmit={handlePostSubmit} className="post-form">
            <input
              type="text"
              placeholder="Share your update..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            <button type="submit" className="post-button">Post</button>
          </form>
        </div>

      {error && <div className="error-message">{error}</div>}

      {/* Posts */}
      <div className="feed-posts">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <img 
                    src={post.author?.profileImage || '/nkarner/person.png'} 
                    alt={post.author?.name || 'User'}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <div className="author-name">
                      {post.author?.name} {post.author?.surname}
                      {post.author?.isOrganization && (
                        <span className="verified-badge" title="Verified Organization">✓</span>
                      )}
                      <span className="post-time">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button className="more-options">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="post-content">
                <p>{post.content}</p>
                {post.images && post.images.length > 0 && (
                  <div className="post-image">
                    <img src={post.images[0]} alt="Post content" />
                  </div>
                )}
                
                {/* Show event details if this is an event post */}
                {post.eventDetails && (
                  <div className="post-details">
                    {post.eventDetails.title && <h4>{post.eventDetails.title}</h4>}
                    {post.eventDetails.date && <p>📅 {post.eventDetails.date}</p>}
                    {post.eventDetails.location && <p>📍 {post.eventDetails.location}</p>}
                    {post.eventDetails.price && <p>💵 {post.eventDetails.price}</p>}
                    {post.eventDetails.audience && <p>👥 {post.eventDetails.audience}</p>}
                    {post.eventDetails.contact && <p>📧 {post.eventDetails.contact}</p>}
                  </div>
                )}
              </div>

              <div className="post-actions">
                <button className="action-button">
                  <Heart size={20} />
                  <span>Like</span>
                </button>
                <button className="action-button">
                  <MessageCircle size={20} />
                  <span>Comment</span>
                </button>
                <button className="action-button">
                  <Send size={20} />
                  <span>Share</span>
                </button>
                <button className="action-button save-button">
                  <Bookmark size={20} />
                </button>
              </div>

              {/* Add Comment */}
              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ''}
                  onChange={(e) => setCommentInputs({
                    ...commentInputs,
                    [post._id]: e.target.value
                  })}
                  onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                  className="comment-input"
                />
                {commentInputs[post._id] && (
                  <button 
                    className="comment-submit-btn"
                    onClick={() => handleComment(post._id)}
                  >
                    Post
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="feed-sidebar">
        <div className="suggested-section">
          <h3>People & Organizations You May GreenLink</h3>
          <div className="suggested-users">
            {suggestedUsers.map(suggestedUser => (
              <div key={suggestedUser.id} className="suggested-user">
                <img src={suggestedUser.image} alt={suggestedUser.name} />
                <span>{suggestedUser.name}</span>
              </div>
            ))}
          </div>
          <button className="see-more">See more</button>
        </div>
      </div>
    </div>
  );
}

export default Feed;
