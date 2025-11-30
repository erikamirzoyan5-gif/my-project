import React from "react";

const Whoweare = () => {
  return (
    <div className="who-container">
      {/* Our History Section */}
      <section className="history-section">
        <div className="history-text">
          <h1>Our History</h1>
          <p>
            Greenwich connects Armenian youth (14–35) with global and local
            opportunities from scholarships and exchanges to volunteering and
            cultural programs. We aim to create a trusted, modern-friendly
            platform where young people can learn, connect, and grow.
          </p>
          <button>See more</button>
        </div>
        <img src="/nkarner/photo_5350645965478030710_y.jpg" alt="Our History" className="history-img" />
      </section>

      {/* Why Greenwich Section */}
      <section className="why-section">
       <div className="why-content">
        <div className="why-text">
         <h1>Why Greenwich?</h1>
         <p>
              Finding opportunities can be hard – they are scattered across
              websites,<br /> social media, and word of mouth. Many young people miss them
              simply <br /> because information isn't accessible in one place. Greenwich
              brings it all <br /> together. We are a trusted platform where scholarships,
              exchanges,<br /> volunteering, and cultural programs are easy to discover.
         </p>
       </div>
    
        <div className="why-image-container">
        <div className="why-box">
         <img src="/nkarner/photo_5323318011991550806_y.jpg" alt="Workshop" />
         <span>Text</span>
       </div>
        <div className="why-box">
          <img src="/nkarner/photo_5323318011991550814_y.jpg" alt="Team collaboration" />
          <span>Text</span>
       </div>
      <div className="why-box">
        <img src="/nkarner/photo_5323318011991550786_y.jpg" alt="Presentation" />
        <span>Text</span>
      </div>
      </div>
      </div>
      </section>

      {/* Overview Section */}
      <section className="overview-section">
        <img src="/nkarner/Screenshot 2025-10-18 192557.png" alt="Greenwich Logo" className="overview-logo" />
        <div className="overview-text">
          <h1>Overview</h1>
          <p>
            Greenwich is a digital platform designed to centralize and simplify
            access to local and international opportunities for Armenian youth
            aged 14 to 35. These opportunities include international exchange
            programs, scholarships, grants, volunteering, educational events,
            and cultural activities. Initially launched as a Telegram-based MVP,
            the project is transitioning into a scalable web platform powered by
            AI and user-generated content.
          </p>
        </div>
      </section>
      
      {/* Vision Section */}
      <section className="vision-section">
        <div className="vision-text">
          <h1>Our Vision</h1>
          <p>
            Greenwich is a digital platform designed to centralize and simplify access to local and international opportunities for Armenian youth aged 14 to 35. These opportunities include international exchange programs, scholarships, grants, volunteering, educational events, and cultural activities. Initially launched as a Telegram-based MVP, the project is transitioning into a scalable web platform powered by AI and user-generated content.


          </p>
        </div>
        <img src="/nkarner/257ba1adee1b54abd49ac6a8c0f49ea9.jpg" alt="Greenwich Logo" className="vision-logo" />
      </section>

      {/* Our Mission */}
      <section className="mission-section">
        <img src="/nkarner/96666.png" alt="Greenwich Logo" className="mission-logo" />
        <div className="mission-text">
          <h1>Our Mission</h1>
          <p>
            Greenwich is a digital platform designed to centralize and simplify
            access to local and international opportunities for Armenian youth
            aged 14 to 35. These opportunities include international exchange
            programs, scholarships, grants, volunteering, educational events,
            and cultural activities. Initially launched as a Telegram-based MVP,
            the project is transitioning into a scalable web platform powered by
            AI and user-generated content.
          </p>
        </div>
      </section>
      {/* Promoting Section */}
      <section className="promoting-section">
        <div className="promoting-text">
          <h1>Promoting the SDG Agenda</h1>
          <p>
            Greenwich is a digital platform designed to centralize and simplify access to local and international opportunities for Armenian youth aged 14 to 35. These opportunities include international exchange programs, scholarships, grants, volunteering, educational events, and cultural activities. Initially launched as a Telegram-based MVP, the project is transitioning into a scalable web platform powered by AI and user-generated content.


          </p>
        </div>
        <img src="/nkarner/Screenshot 2025-10-18 200417.png" alt="Greenwich Logo" className="promoting-logo" />
      </section>
    </div>
  );
};

export default Whoweare;
