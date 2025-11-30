import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function PlayerInterest() {
  const navigate = useNavigate();
  const { user, updateUserInterests } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);

  const interests = [
    { id: 1, name: "Environment", image: "/nkarner/Chyux.png" },
    { id: 2, name: "Education", image: "/nkarner/smart.png" },
    { id: 3, name: "Technology", image: "/nkarner/programm.png" },
    { id: 4, name: "Health", image: "/nkarner/sirt.png" },
    { id: 5, name: "Arts & Culture", image: "/nkarner/art.png" },
    { id: 6, name: "Community Development", image: "/nkarner/ppl.png" },
    { id: 7, name: "Human Rights", image: "/nkarner/peace.png" },
    { id: 8, name: "Social Inclusion", image: "/nkarner/csms.png" },
    { id: 9, name: "International Exchanges", image: "/nkarner/hnd.png" },
    { id: 10, name: "Entrepreneurship", image: "/nkarner/er.png" }
  ];

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter(id => id !== interestId));
    } else {
      setSelectedInterests([...selectedInterests, interestId]);
    }
  };

  const handleNext = () => {
    const selectedInterestNames = interests
      .filter(interest => selectedInterests.includes(interest.id))
      .map(interest => interest.name);
    
    updateUserInterests(selectedInterestNames);
    
    navigate("/account-profile", { 
      state: { 
        selectedInterests: selectedInterestNames 
      } 
    });
  };

  return (
    <div className="interests-page">
      <div className="interests-container">
        <h2>Choose Your Interests</h2>
        <p>Select area you're interested in</p>
        
        <div className="interests-grid">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className={`interest-card ${selectedInterests.includes(interest.id) ? 'selected' : ''}`}
              onClick={() => toggleInterest(interest.id)}
            >
              <div className="interest-image">
                <img src={interest.image} alt={interest.name} />
                <div className="checkmark">✓</div>
              </div>
              <h3>{interest.name}</h3>
            </div>
          ))}
        </div>

        <button 
          className="nextt-btn"
          onClick={handleNext}
          disabled={selectedInterests.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PlayerInterest;