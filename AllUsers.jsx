import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { adminGetAllUsers } = useAuth();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const data = await adminGetAllUsers();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
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
    <div className="all-users">
      <div className="page-header">
        <h1>All Users ({users.length})</h1>
        <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
      </div>

      <div className="users-table-container">
        <div className="table-header">
          <div>Name</div>
          <div>Email</div>
          <div>Organization</div>
          <div>Status</div>
          <div>Registration Date</div>
          <div>Approval Date</div>
        </div>
        <div className="table-body">
          {users.map(user => (
            <div key={user._id} className="table-row">
              <div>{user.name} {user.surname}</div>
              <div>{user.email}</div>
              <div>{user.orgName}</div>
              <div>{getStatusBadge(user.isApproved)}</div>
              <div>{new Date(user.createdAt).toLocaleDateString()}</div>
              <div>
                {user.approvedAt 
                  ? new Date(user.approvedAt).toLocaleDateString()
                  : '-'
                }
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="no-data">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllUsers;