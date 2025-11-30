import React from "react";

function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-left">
          <h4>Contact Us</h4>
          <p>+374 ------</p>
          <p>example@gmail.ru</p>
          <p>Office place</p>
          <div className="social-icons">
            <a href="#"><img src="/nkarner/10483439.png" alt="Telegram" /></a>
            <a href="#"><img src="/nkarner/10483448.png" alt="Facebook" /></a>
            <a href="#"><img src="/nkarner/10483448.png" alt="Instagram" /></a>
          </div>
        </div>

        <div className="footer-middle">
          <ul>
            <li>Who we are</li>
            <li>Notification</li>
            <li>Organizations</li>
            <li>Programs</li>
          </ul>
        </div>

        <div className="footer-right">
          <ul>
            <li>Projects</li>
            <li>Community</li>
            <li>Feed</li>
            <li>Donate</li>
          </ul>

          <ul>
            <li>Reels</li>
            <li>Account</li>
            <li>Contact us</li>
            <li>Registration</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;