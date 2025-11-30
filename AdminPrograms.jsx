import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext.jsx';
import './admin.css';

function AdminPrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [filterCategory, setFilterCategory] = useState('all'); // all, education, scholarship, etc.
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const categories = [
    { id: 'all', label: 'All Categories', icon: '📋' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'scholarship', label: 'Scholarship', icon: '💰' },
    { id: 'fellowship', label: 'Fellowship', icon: '🤝' },
    { id: 'erasmusmundus', label: 'Erasmus Mundus', icon: '🌍' },
    { id: 'erasmusplus', label: 'Erasmus Plus', icon: '✈️' },
    { id: 'training', label: 'Training', icon: '📚' },
    { id: 'grant', label: 'Grant', icon: '💵' }
  ];

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      // Load from JSON file (in production, this would be an API call)
      const response = await fetch('/scraper_project (1)/scraper_project/programs_data.json');
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error loading programs:', error);
      // Fallback: try to load from localStorage
      const saved = localStorage.getItem('admin_programs');
      if (saved) {
        setPrograms(JSON.parse(saved));
      }
    } finally {
      setLoading(false);
    }
  };

  const savePrograms = (updatedPrograms) => {
    setPrograms(updatedPrograms);
    localStorage.setItem('admin_programs', JSON.stringify(updatedPrograms));
    // In production, this would be an API call to save to backend
  };

  const handleApprove = (programId) => {
    const updated = programs.map(p => 
      p.id === programId ? { ...p, approval_status: 'approved' } : p
    );
    savePrograms(updated);
  };

  const handleReject = (programId) => {
    const updated = programs.map(p => 
      p.id === programId ? { ...p, approval_status: 'rejected' } : p
    );
    savePrograms(updated);
  };

  const handleEdit = (program) => {
    setEditingProgram({ ...program });
  };

  const handleSaveEdit = () => {
    if (!editingProgram) return;
    const updated = programs.map(p => 
      p.id === editingProgram.id ? editingProgram : p
    );
    savePrograms(updated);
    setEditingProgram(null);
  };

  const handleCancelEdit = () => {
    setEditingProgram(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProgram({
          ...editingProgram,
          image_url: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const getProgramCategory = (program) => {
    const title = (program.title || '').toLowerCase();
    const description = (program.description || '').toLowerCase();
    const fullText = (program.full_text || '').toLowerCase();
    const text = `${title} ${description} ${fullText}`;
    const programCategories = (program.categories || []).map(c => c.toLowerCase());

    // Education
    if (
      text.includes('education') || 
      text.includes('university') || 
      text.includes('degree') || 
      text.includes('bachelor') || 
      text.includes('master') || 
      text.includes('phd') ||
      text.includes('doctoral') ||
      text.includes('academic') ||
      programCategories.includes('formal education')
    ) {
      return 'education';
    }

    // Scholarship
    if (
      text.includes('scholarship') || 
      text.includes('scholar') ||
      text.includes('tuition') ||
      text.includes('bursary') ||
      text.includes('bursar')
    ) {
      return 'scholarship';
    }

    // Fellowship
    if (
      text.includes('fellowship') || 
      text.includes('fellow')
    ) {
      return 'fellowship';
    }

    // Erasmus Mundus
    if (
      text.includes('erasmus mundus') || 
      text.includes('erasmusmundus') ||
      text.includes('emjmd') ||
      text.includes('joint master')
    ) {
      return 'erasmusmundus';
    }

    // Erasmus Plus
    if (
      text.includes('erasmus+') || 
      text.includes('erasmus plus') ||
      text.includes('erasmusplus') ||
      text.includes('ka1') ||
      text.includes('ka2') ||
      text.includes('ka3') ||
      text.includes('key action')
    ) {
      return 'erasmusplus';
    }

    // Training
    if (
      text.includes('training') || 
      text.includes('training course') ||
      text.includes('workshop') ||
      text.includes('capacity building') ||
      programCategories.includes('jobs and internships')
    ) {
      return 'training';
    }

    // Grant
    if (
      text.includes('grant') || 
      text.includes('funding') ||
      text.includes('financial support') ||
      text.includes('financial aid')
    ) {
      return 'grant';
    }

    // Default to training if it's an international program
    if (programCategories.includes('international programs')) {
      return 'training';
    }

    return 'training'; // Default category
  };

  const filteredPrograms = programs.filter(p => {
    // Filter by status
    if (filterStatus !== 'all' && p.approval_status !== filterStatus) {
      return false;
    }

    // Filter by category
    if (filterCategory !== 'all') {
      const programCategory = getProgramCategory(p);
      if (programCategory !== filterCategory) {
        return false;
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const title = (p.title || '').toLowerCase();
      const description = (p.description || '').toLowerCase();
      if (!title.includes(query) && !description.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const getStatusBadge = (status) => {
    const config = {
      'pending': { class: 'status-pending', text: 'Pending' },
      'approved': { class: 'status-approved', text: 'Approved' },
      'rejected': { class: 'status-rejected', text: 'Rejected' }
    };
    const statusConfig = config[status] || config.pending;
    return <span className={`status-badge ${statusConfig.class}`}>{statusConfig.text}</span>;
  };

  if (loading) return <div className="loading">Loading programs...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Programs Management</h1>
        <div className="admin-info">
          <span>Welcome, {user?.name}!</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="admin-search-section">
        <input
          type="text"
          placeholder="Search programs by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search-input"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="filter-tabs">
        <button 
          className={filterStatus === 'all' ? 'active' : ''}
          onClick={() => setFilterStatus('all')}
        >
          All ({programs.length})
        </button>
        <button 
          className={filterStatus === 'pending' ? 'active' : ''}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({programs.filter(p => p.approval_status === 'pending').length})
        </button>
        <button 
          className={filterStatus === 'approved' ? 'active' : ''}
          onClick={() => setFilterStatus('approved')}
        >
          Approved ({programs.filter(p => p.approval_status === 'approved').length})
        </button>
        <button 
          className={filterStatus === 'rejected' ? 'active' : ''}
          onClick={() => setFilterStatus('rejected')}
        >
          Rejected ({programs.filter(p => p.approval_status === 'rejected').length})
        </button>
      </div>

      {/* Category Filter Section */}
      <div className="category-filter-section">
        <h3 className="category-filter-title">Filter by Category:</h3>
        <div className="category-filter-buttons">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-filter-btn ${filterCategory === category.id ? 'active' : ''}`}
              onClick={() => setFilterCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span>{category.label}</span>
              {filterCategory === category.id && (
                <span className="category-count">({filteredPrograms.length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="admin-results-info">
        <p>
          Showing <strong>{filteredPrograms.length}</strong> of <strong>{programs.length}</strong> program{programs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {editingProgram ? (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Edit Program</h2>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={editingProgram.title || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={editingProgram.description || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                rows="5"
              />
            </div>
            <div className="form-group">
              <label>Image URL:</label>
              <input
                type="text"
                value={editingProgram.image_url || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, image_url: e.target.value })}
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ marginTop: '10px' }}
              />
              {editingProgram.image_url && (
                <img 
                  src={editingProgram.image_url} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
              )}
            </div>
            <div className="form-group">
              <label>URL:</label>
              <input
                type="text"
                value={editingProgram.url || ''}
                onChange={(e) => setEditingProgram({ ...editingProgram, url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Categories:</label>
              <input
                type="text"
                value={Array.isArray(editingProgram.categories) ? editingProgram.categories.join(', ') : ''}
                onChange={(e) => setEditingProgram({ 
                  ...editingProgram, 
                  categories: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveEdit} className="btn-primary">Save</button>
              <button onClick={handleCancelEdit} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="programs-list">
        {filteredPrograms.length === 0 ? (
          <div className="no-programs-admin">
            <p>No programs found.</p>
          </div>
        ) : (
          <div className="programs-grid-admin">
            {filteredPrograms.map(program => (
              <div key={program.id} className="program-card-admin">
                <div className="program-image-wrapper-admin">
                  {program.image_url ? (
                    <img src={program.image_url} alt={program.title} className="program-image-admin" />
                  ) : (
                    <div className="program-image-placeholder-admin">No Image</div>
                  )}
                </div>
                <div className="program-card-header">
                  <div className="program-title-section">
                    <h3 className="program-title-admin">{program.title}</h3>
                    {getStatusBadge(program.approval_status)}
                  </div>
                </div>
                <p className="program-description-admin">{program.description?.substring(0, 200)}...</p>
                <div className="program-meta">
                  <span><strong>Source:</strong> {program.source || 'Unknown'}</span>
                  <span><strong>Category:</strong> {getProgramCategory(program)}</span>
                  {program.start_date && <span><strong>Start:</strong> {program.start_date}</span>}
                </div>
                <div className="program-footer-admin">
                  <a href={program.url} target="_blank" rel="noopener noreferrer" className="program-link-admin">
                    View Original →
                  </a>
                  <div className="program-actions">
                    <button onClick={() => handleEdit(program)} className="btn-edit">Edit</button>
                    {program.approval_status !== 'approved' && (
                      <button onClick={() => handleApprove(program.id)} className="btn-approve">
                        Approve
                      </button>
                    )}
                    {program.approval_status !== 'rejected' && (
                      <button onClick={() => handleReject(program.id)} className="btn-reject">
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPrograms;

