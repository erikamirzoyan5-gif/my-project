// components/Programs.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Programs.css';

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubfilter, setSelectedSubfilter] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Programs', icon: 'fas fa-list', subfilters: [] },
    { id: 'education', label: 'Education', icon: 'fas fa-graduation-cap', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] },
    { id: 'scholarship', label: 'Scholarship', icon: 'fas fa-money-bill-wave', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] },
    { id: 'fellowship', label: 'Fellowship', icon: 'fas fa-handshake', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] },
    { id: 'erasmusmundus', label: 'Erasmus Mundus', icon: 'fas fa-globe', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] },
    { id: 'erasmusplus', label: 'Erasmus Plus', icon: 'fas fa-plane', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] },
    { id: 'training', label: 'Training', icon: 'fas fa-book', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] },
    { id: 'grant', label: 'Grant', icon: 'fas fa-dollar-sign', subfilters: ['Education', 'Scholarship', 'Fellowship', 'ErasmusMundus', 'ErasmusPlus', 'Training', 'Grant'] }
  ];

  useEffect(() => {
    let cleanup = null;
    
    const setup = async () => {
      cleanup = await loadPrograms();
    };
    
    setup();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  useEffect(() => {
    filterPrograms();
  }, [programs, selectedCategory, selectedSubfilter, searchQuery]);

  const loadPrograms = async () => {
    try {
      // First try to load from localStorage (where admin saves approved programs)
      const saved = localStorage.getItem('admin_programs');
      let allPrograms = [];
      
      if (saved) {
        allPrograms = JSON.parse(saved);
      } else {
        // If no localStorage, load from JSON file
        const response = await fetch('/scraper_project (1)/scraper_project/programs_data.json');
        const data = await response.json();
        allPrograms = data;
      }
      
      // Show only approved programs
      const approvedPrograms = allPrograms.filter(p => p.approval_status === 'approved');
      setPrograms(approvedPrograms);
      
      // Listen for storage changes to update when admin approves
      const handleStorageChange = (e) => {
        if (e.key === 'admin_programs' || !e.key) {
          const updated = localStorage.getItem('admin_programs');
          if (updated) {
            const data = JSON.parse(updated);
            const approved = data.filter(p => p.approval_status === 'approved');
            setPrograms(approved);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Also check periodically (for same-tab updates)
      const interval = setInterval(() => {
        const updated = localStorage.getItem('admin_programs');
        if (updated) {
          const data = JSON.parse(updated);
          const approved = data.filter(p => p.approval_status === 'approved');
          setPrograms(prev => {
            if (prev.length !== approved.length || 
                JSON.stringify(prev.map(p => p.id).sort()) !== JSON.stringify(approved.map(p => p.id).sort())) {
              return approved;
            }
            return prev;
          });
        }
      }, 1000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
      };
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
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

  const toggleCategory = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategory('all');
      setSelectedSubfilter(null);
      setExpandedCategories(new Set());
      return;
    }

    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
      setSelectedSubfilter(null);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
    setSelectedCategory(categoryId);
  };

  const handleSubfilterClick = (subfilter, e) => {
    e.stopPropagation();
    setSelectedSubfilter(subfilter);
  };

  const filterPrograms = () => {
    let filtered = [...programs];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(program => {
        const programCategory = getProgramCategory(program);
        return programCategory === selectedCategory;
      });
    }

    // Filter by subfilter
    if (selectedSubfilter) {
      filtered = filtered.filter(program => {
        const title = (program.title || '').toLowerCase();
        const description = (program.description || '').toLowerCase();
        const fullText = (program.full_text || '').toLowerCase();
        const text = `${title} ${description} ${fullText}`;
        const subfilterLower = selectedSubfilter.toLowerCase();
        
        // Check for exact matches
        if (selectedSubfilter === 'Education') {
          return text.includes('education') || text.includes('university') || text.includes('degree') || text.includes('academic');
        } else if (selectedSubfilter === 'Scholarship') {
          return text.includes('scholarship') || text.includes('scholar') || text.includes('tuition');
        } else if (selectedSubfilter === 'Fellowship') {
          return text.includes('fellowship') || text.includes('fellow');
        } else if (selectedSubfilter === 'ErasmusMundus') {
          return text.includes('erasmus mundus') || text.includes('erasmusmundus') || text.includes('emjmd');
        } else if (selectedSubfilter === 'ErasmusPlus') {
          return text.includes('erasmus+') || text.includes('erasmus plus') || text.includes('erasmusplus') || text.includes('ka1') || text.includes('ka2') || text.includes('ka3');
        } else if (selectedSubfilter === 'Training') {
          return text.includes('training') || text.includes('workshop') || text.includes('course');
        } else if (selectedSubfilter === 'Grant') {
          return text.includes('grant') || text.includes('funding') || text.includes('financial support');
        }
        
        return text.includes(subfilterLower);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(program => {
        const title = (program.title || '').toLowerCase();
        const description = (program.description || '').toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    setFilteredPrograms(filtered);
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="programs-loading">
          <div className="loading-spinner"></div>
          <p>Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="programs-page">
        <div className="programs-container">
          {/* Left Sidebar - Filters */}
          <div className="programs-sidebar">
            <h3>Categories</h3>
            <div className="category-filters">
              {categories.map(category => (
                <div key={category.id}>
                  <button
                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => toggleCategory(category.id)}
                  >
                    <div className="category-icon">
                      <i className={category.icon}></i>
                    </div>
                    <div className="category-info">
                      <div className="category-name">{category.label}</div>
                      {selectedCategory === category.id && (
                        <div className="category-count">{filteredPrograms.length} programs</div>
                      )}
                    </div>
                  </button>
                  {category.subfilters && category.subfilters.length > 0 && (
                    <div className={`subfilters ${expandedCategories.has(category.id) ? 'open' : ''}`}>
                      {category.subfilters.map(subfilter => (
                        <button
                          key={subfilter}
                          className={`subfilter-btn ${selectedSubfilter === subfilter ? 'active' : ''}`}
                          onClick={(e) => handleSubfilterClick(subfilter, e)}
                        >
                          {subfilter}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content - Programs List */}
          <div className="programs-content">
            {/* Search Bar */}
            <div className="search-section">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-box"
                />
                <i className="fas fa-search search-icon"></i>
              </div>
            </div>

            {filteredPrograms.length === 0 ? (
              <div className="no-programs">
                <div className="no-programs-icon">📭</div>
                <h3>No programs found</h3>
                <p>
                  {selectedCategory !== 'all' 
                    ? `No programs found in the "${categories.find(c => c.id === selectedCategory)?.label}" category.`
                    : 'No approved programs available at the moment.'}
                </p>
                {selectedCategory !== 'all' && (
                  <button 
                    className="clear-filter-btn"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Show All Programs
                  </button>
                )}
              </div>
            ) : (
              <div className="programs-grid">
                {filteredPrograms.map(program => (
                  <div key={program.id} className="program-card">
                    <div className="program-image-wrapper">
                      {program.image_url ? (
                        <img 
                          src={program.image_url} 
                          alt={program.title}
                          className="program-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('program-image-placeholder');
                            e.target.parentElement.textContent = 'No Image';
                          }}
                        />
                      ) : (
                        <div className="program-image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="program-title">{program.title}</div>
                    <div className="program-description">
                      {program.description?.substring(0, 200)}
                      {program.description?.length > 200 ? '...' : ''}
                    </div>
                    <div className="program-footer">
                      <div className="program-category">
                        <span className="dot"></span>
                        <span>{getProgramCategory(program)}</span>
                      </div>
                      <a 
                        href={program.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="program-link"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Programs;
