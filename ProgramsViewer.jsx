import React, { useState, useEffect } from "react";
import "./ProgramsViewer.css";

function ProgramsViewer() {
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("all");
  const [currentSubfilter, setCurrentSubfilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categoryConfig = {
    "Formal education": {
      icon: "fa-graduation-cap",
      label: "Formal Education",
      subfilters: ["Education", "Scholarship", "Fellowship", "ErasmusMundus", "ErasmusPluse", "Training", "Grant"],
      color: "#2196F3"
    },
    "Jobs and internships": {
      icon: "fa-briefcase",
      label: "Jobs & Internships",
      subfilters: ["Tech", "Award", "Competition", "Networking", "ForStudent", "ForWoman"],
      color: "#FF9800"
    },
    "International programs": {
      icon: "fa-plane",
      label: "International Programs",
      subfilters: ["Exchange", "YouthProgram", "YouthProject", "Cultural", "Event", "Expo", "Discussion", "Webinar"],
      color: "#9C27B0"
    },
    "Volunteering": {
      icon: "fa-handshake",
      label: "Volunteering",
      subfilters: ["Volunteering", "Eco", "Medical", "Concert"],
      color: "#4CAF50"
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [programs, currentCategory, currentSubfilter, searchQuery]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("http://localhost:5000/scraper/programs_data.json");
      const data = await response.json();
      setPrograms(data);
      setFilteredPrograms(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching programs:", error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...programs];

    // Category filter
    if (currentCategory !== "all") {
      filtered = filtered.filter(program => 
        program.categories && program.categories.includes(currentCategory)
      );
    }

    // Subfilter
    if (currentSubfilter) {
      filtered = filtered.filter(program => {
        const fullText = (program.title + " " + program.description).toLowerCase();
        return fullText.includes(currentSubfilter.toLowerCase());
      });
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(program => {
        const title = (program.title || "").toLowerCase();
        const description = (program.description || "").toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    setFilteredPrograms(filtered);
  };

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setCurrentSubfilter(null);
  };

  const handleSubfilterClick = (category, subfilter) => {
    setCurrentCategory(category);
    setCurrentSubfilter(subfilter);
  };

  const getCategoryCounts = () => {
    const counts = { all: programs.length };
    Object.keys(categoryConfig).forEach(cat => {
      counts[cat] = programs.filter(p => p.categories && p.categories.includes(cat)).length;
    });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  const getFirstCategory = (categories) => {
    if (!categories || categories.length === 0) return "International programs";
    return categories[0];
  };

  if (loading) {
    return (
      <div className="programs-viewer-loading">
        <div>Loading programs...</div>
      </div>
    );
  }

  return (
    <div className="programs-viewer">
      {/* Search Section */}
      <div className="programs-search-section">
        <div className="programs-search-container">
          <i className="fas fa-search programs-search-icon"></i>
          <input
            type="text"
            className="programs-search-box"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="programs-main-container">
        {/* Sidebar */}
        <aside className="programs-sidebar">
          <h3>Categories</h3>
          
          {/* All Programs */}
          <div
            className={`programs-category-item ${currentCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategoryClick("all")}
          >
            <div className="programs-category-icon">
              <i className="fas fa-th"></i>
            </div>
            <div className="programs-category-info">
              <div className="programs-category-name">All Programs</div>
              <div className="programs-category-count">{categoryCounts.all} programs</div>
            </div>
          </div>

          {/* Category Items */}
          {Object.entries(categoryConfig).map(([key, config]) => {
            const safeKey = key.replace(/\s+/g, "-").replace("&", "and");
            const isActive = currentCategory === key;
            
            return (
              <div key={key}>
                <div
                  className={`programs-category-item ${isActive ? "active" : ""}`}
                  onClick={() => handleCategoryClick(key)}
                >
                  <div className="programs-category-icon" style={{ background: isActive ? config.color : "#ffc107" }}>
                    <i className={`fas ${config.icon}`}></i>
                  </div>
                  <div className="programs-category-info">
                    <div className="programs-category-name">{config.label}</div>
                    <div className="programs-category-count">{categoryCounts[key]} programs</div>
                  </div>
                </div>
                
                {/* Subfilters */}
                {isActive && (
                  <div className="programs-subfilters">
                    {config.subfilters.map((subfilter) => (
                      <button
                        key={subfilter}
                        className={`programs-subfilter-btn ${currentSubfilter === subfilter ? "active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubfilterClick(key, subfilter);
                        }}
                      >
                        {subfilter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* Content */}
        <main className="programs-content">
          <div className="programs-grid">
            {filteredPrograms.length === 0 ? (
              <div className="programs-no-results">
                <p>No programs found</p>
              </div>
            ) : (
              filteredPrograms.map((program) => {
                const firstCategory = getFirstCategory(program.categories);
                const categoryInfo = categoryConfig[firstCategory] || categoryConfig["International programs"];
                const categoryColor = categoryInfo.color;

                return (
                  <div key={program.id} className="programs-card">
                    <div className="programs-card-title">{program.title}</div>
                    <div className="programs-card-description">
                      {program.description?.substring(0, 200)}...
                    </div>
                    <div className="programs-card-footer">
                      <div className="programs-card-category">
                        <span 
                          className="programs-card-dot" 
                          style={{ background: categoryColor }}
                        ></span>
                        <span>{categoryInfo.label}</span>
                      </div>
                      <a
                        href={program.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="programs-card-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View →
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProgramsViewer;

