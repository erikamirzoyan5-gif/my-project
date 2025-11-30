import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminGetDashboardStats, user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await adminGetDashboardStats();
      
      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentRegistrations || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'status-pending', text: 'Pending' },
      'approved': { class: 'status-approved', text: 'Approved' },
      'rejected': { class: 'status-rejected', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { class: 'status-pending', text: status };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-info">
          <span>Welcome, {user?.name}!</span>
          <div className="admin-nav">
            <Link to="/admin/approvals" className="nav-link">
              Pending Approvals ({stats.pendingApprovals || 0})
            </Link>
            <Link to="/admin/users" className="nav-link">All Users</Link>
            <Link to="/admin/programs" className="nav-link">Programs</Link>
            <button onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/';
            }} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers || 0}</p>
        </div>
        <div className="stat-card warning">
          <h3>Pending Approvals</h3>
          <p className="stat-number">{stats.pendingApprovals || 0}</p>
          <Link to="/admin/approvals" className="stat-link">Review →</Link>
        </div>
        <div className="stat-card success">
          <h3>Approved</h3>
          <p className="stat-number">{stats.approvedUsers || 0}</p>
        </div>
        <div className="stat-card danger">
          <h3>Rejected</h3>
          <p className="stat-number">{stats.rejectedUsers || 0}</p>
        </div>
      </div>

      <div className="recent-registrations">
        <h2>Recent Registrations</h2>
        <div className="users-table">
          <div className="table-header">
            <div>Logo</div>
            <div>Name</div>
            <div>Email</div>
            <div>Organization</div>
            <div>Status</div>
            <div>Date</div>
            <div>Actions</div>
          </div>
          <div className="table-body">
            {recentUsers.map(user => (
              <div key={user._id} className="table-row">
                <div className="logo-cell">
                {user.profileImage ? (
                    <img 
                    src={user.profileImage} 
                    alt="Organization Logo" 
                    style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '3px',
                        border: '1px solid #ddd'
                    }}
                    />
                ) : (
                    <div className="no-logo">No Logo</div>
                )}
                </div>
                <div>{user.name} {user.surname}</div>
                <div>{user.email}</div>
                <div>{user.orgName}</div>
                <div>{getStatusBadge(user.isApproved)}</div>
                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                <div>
                  {user.isApproved === 'pending' && (
                    <Link to="/admin/approvals" className="btn-review">
                      Review
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="no-data">No recent registrations</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
