import React from 'react';
import { useNavigate } from 'react-router-dom';

const Registratioon = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handlePlayerSelect = () => {
    console.log("Player selected - navigating to /player-registration");
    onClose();
  
    setTimeout(() => {
      navigate('/player-registration');
    }, 100);
  };

  const handleOrganizerSelect = () => {
    console.log("Organizer selected - navigating to /organizer-registration");
    onClose();
    setTimeout(() => {
      navigate('/registration');
    }, 100);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2>Choose Account Type</h2>
        <p>Select how you want to use our platform</p>
        
        <div className="type-selection">
          <div className="type-card" onClick={handlePlayerSelect}>
            <img src="/nkarner/plyr.png" alt="Player" className="type-image" />
            <h3>Player</h3>
            <p>Join tournaments and compete with other players</p>
          </div>
          
          <div className="type-card" onClick={handleOrganizerSelect}>
            <img src="/nkarner/kostyum.png" alt="Organizer" className="type-image" />
            <h3>Organizer</h3>
            <p>Create and manage tournaments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registratioon;