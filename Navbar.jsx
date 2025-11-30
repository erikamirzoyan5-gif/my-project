import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Search, User, Settings } from "lucide-react";
import Registratioon from "./registratioon";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const searchInputRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  const handleUserClick = () => {
    setIsUserModalOpen(true);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
  };

  const clearSearchState = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchError("");
    setSearchLoading(false);
  };

  // Feed-ի համար
  const handleFeedClick = (e) => {
    e.preventDefault();
    navigate('/feed');
    setMenuOpen(false);
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    } else {
      clearSearchState();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  // Load notifications count
  useEffect(() => {
    const loadNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotificationCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const performSearch = async (value) => {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setSearchError("Please log in to search profiles.");
        setSearchLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/users/search?q=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Search failed");
      }

      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(error.message);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 400);
  };

  const handleProfileOpen = (id) => {
    setIsSearchOpen(false);
    clearSearchState();
    navigate(`/profile/${id}`);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <img src="/nkarner/logo.png" alt="logo" />
          <span>Greenwich</span>
        </div>
        
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li onClick={handleFeedClick} style={{ cursor: "pointer" }}>Feed</li>
          <li style={{ cursor: "pointer" }}>Community</li>
          <li>
    <Link 
      to="/programs" 
      style={{ 
        cursor: "pointer", 
        textDecoration: "none",
        color: "inherit"
      }}
      onClick={() => setMenuOpen(false)}
    >
      Projects
    </Link>
  </li>
          <li style={{ cursor: "pointer" }}>Organizations</li>
        </ul>

        <div className="nav-right">
          <button className="donate-btn">Donate now</button>

          <div className="social-icons">
            <a href="https://www.Facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/nkarner/plo.png" alt="Reel" style={{ width: "28px", height: "28px" }} />
            </a>
            <div className="notification-icon-wrapper" style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell style={{ color: "white" }} />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount > 99 ? '99+' : notificationCount}</span>
              )}
            </div>
            
            <div className="navbar-search" ref={searchContainerRef}>
              <button 
                className="search-toggle-btn" 
                type="button"
                onClick={toggleSearch}
                aria-label="Search members"
              >
                <Search style={{ color: "white" }} />
              </button>

              {isSearchOpen && (
                <div className="search-panel">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search name or organization..."
                  />

                  {searchLoading && (
                    <div className="search-loading">Searching...</div>
                  )}

                  {searchError && (
                    <div className="search-error">{searchError}</div>
                  )}

                  {!searchLoading && !searchError && searchQuery.trim().length < 2 && (
                    <div className="search-empty">Type at least 2 characters</div>
                  )}

                  {!searchLoading && !searchError && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                    <div className="search-empty">No members found</div>
                  )}

                  <div className="search-results">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        className="search-result-item"
                        type="button"
                        onClick={() => handleProfileOpen(result.id)}
                      >
                        <img
                          src={result.profileImage || "/nkarner/default-avatar.jpg"}
                          alt={result.name || result.organizationName || 'Profile'}
                          className="result-avatar"
                        />
                        <div className="search-result-text">
                          <span className="result-name">
                            {result.organizationName && result.accountType === "organization"
                              ? result.organizationName
                              : `${result.name || ""} ${result.surname || ""}`.trim() || result.username}
                          </span>
                          <span className="result-meta">
                            {result.accountType === "organization" ? "Organization" : "Member"}
                            {result.title ? ` • ${result.title}` : ""}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button className="user-btn" onClick={handleUserClick}>
              <User style={{ color: "white" }} />
            </button>
            
            <div className="settings-dropdown">
              <button 
                className="settings-btn"
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <Settings style={{ color: "white" }} />
              </button>
              
              {settingsOpen && (
                <div className="dropdown-menu">
                  <Link to="/whoweare" onClick={() => setSettingsOpen(false)}>
                    Who We Are
                  </Link>
                  <a href="#">Language</a>
                  <a href="#">Question</a>
                  <a href="#">Dark Mode</a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </nav>

      <Registratioon 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
      />
    </>
  );
}

export default Navbar;