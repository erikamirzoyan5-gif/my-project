import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

function PendingApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminGetPendingApprovals, adminApproveUser, adminRejectUser } = useAuth();

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const data = await adminGetPendingApprovals();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this organization?')) return;

    try {
      const data = await adminApproveUser(userId);
      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
        alert('Organization approved successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Error approving organization');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const data = await adminRejectUser(userId, reason);
      if (data.success) {
        setUsers(users.filter(user => user._id !== userId));
        alert('Organization rejected successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Error rejecting organization');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="pending-approvals">
      <div className="page-header">
        <h1>Pending Approvals ({users.length})</h1>
        <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
      </div>

      <div className="approvals-list">
        {users.map(user => (
          <div key={user._id} className="approval-card">
            <div className="user-details">
                <div className="user-header">
                    {user.profileImage && (
                    <img 
                        src={user.profileImage} 
                        alt="Organization Logo" 
                        style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        border: '1px solid #ddd'
                        }}
                    />
                    )}
                    <div className="user-info-main">
                    <h3>{user.name} {user.surname}</h3>
                    <p className="user-email">{user.email}</p>
                    <p className="user-org">{user.orgName}</p>
                    </div>
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <strong>Organization ID:</strong> {user.orgId}
                </div>
                <div className="detail-item">
                  <strong>VAT Number:</strong> {user.vatNumber || 'Not provided'}
                </div>
                <div className="detail-item">
                  <strong>Contact:</strong> {user.phone || 'Not provided'}
                </div>
                <div className="detail-item">
                  <strong>Registered:</strong> {new Date(user.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="approval-actions">
              <button 
                onClick={() => handleApprove(user._id)}
                className="btn-approve"
              >
                Approve
              </button>
              <button 
                onClick={() => handleReject(user._id)}
                className="btn-reject"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="no-pending">
            <h3>No pending approvals</h3>
            <p>All registration requests have been processed.</p>
            <Link to="/admin/dashboard" className="btn-primary">Go to Dashboard</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default PendingApprovals;