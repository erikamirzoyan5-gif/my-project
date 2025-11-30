import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <>
      {/* Header */}
      <header className="header">
        <h1>GREENWICH</h1>
        <h3> Greenwich connects Armenian youth (14–35) with global and local
          opportunities – from scholarships and exchanges to volunteering and
          cultural programs.</h3>
      </header>

      {/* Images */}
       <div class="container">
       <div class="box">
       <div class="imgBx">
       <img src="/nkarner/20250920_0856_Երկիրն Իմ Ձեռքերում_remix_01k5jqkgspfd2s258j19rgr9vg (2).png"/>
      </div>
    <div class="content">
      <div>
        <h2>Image Title</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi accusamus molestias quidem iusto.
        </p>
      </div>
    </div>
  </div>
  <div class="box">
    <div class="imgBx">
      <img src="/nkarner/Screenshot 2025-10-04 190211.png" alt="discussion"/>
    </div>
    <div class="content">
      <div>
        <h2>Image Title</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi accusamus molestias quidem iusto.
        </p>
      </div>
    </div>
  </div>
  <div class="box">
    <div class="imgBx">
      <img src="/nkarner/resized_image.png" alt="meeting"/>
    </div>
    <div class="content">
      <div>
        <h2>Image Title</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi accusamus molestias quidem iusto.
        </p>
      </div>
    </div>
  </div>
  <div class="box">
    <div class="imgBx">
      <img src="/nkarner/Screenshot 2025-10-04 190242.png" alt="handshake"/>
    </div>
    <div class="content">
      <div>
        <h2>Image Title</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi accusamus molestias quidem iusto.
        </p>
      </div>
    </div>
  </div>
</div>       
      {/* Register button */}
      <div className="register">
        <button>Register now </button>
      </div>

      {/* Bottom buttons */}
      <section className="roles">
  <div
    className="role"
    style={{
      backgroundImage: "url('/nkarner/playerr.png')",
      cursor: "pointer",
    }}
    onClick={() => (window.location.href = "/player")}
  ></div>

  <Link to="/registration">
  <div
    className="role"
    style={{
      backgroundImage: "url('/nkarner/organizser.png')",
    }}
  ></div>
</Link>


















  <div className="horizontal-line"></div>
</section>

      <section className="about-section">
        <div className="about-image">
          <img src="/nkarner/1.png" alt="About us" />
        </div>

        <div className="about-text">
          <h1>Hot now</h1>
        </div>
        
        <button className="about-button">See more</button>
      </section>

      <section className="gallery-section">
        <div className="gallery-item">
          <img src="/nkarner/photo_5330107234300064759_y.jpg" alt="Photo 1" />
          <p>Data ARMs</p>
        </div>
        <div className="gallery-item">
          <img src="/nkarner/photo_5332355430636187969_w.jpg" alt="Photo 2" />
          <p>PLUGandPLAY</p>
        </div>
        <div className="gallery-item">
          <img src="/nkarner/photo_5330107234300064759_y.jpg" alt="Photo 1" />
          <p>Data ARMs</p>
        </div>
        <div className="gallery-item">
          <img src="/nkarner/photo_5330103630822504728_y.jpg" alt="Photo 4" />
          <p>MedMeet</p>
        </div>
        <div className="gallery-item">
          <img src="/nkarner/photo_5323373361235097725_y.jpg" alt="Photo 5" />
          <p>CodeWeek</p>
        </div>
        <div className="gallery-item">
          <img src="/nkarner/photo_5332355430636187969_w.jpg" alt="Photo 2" />
          <p>PLUGandPLAY</p>
        </div>
      </section>
      <hr className="section-divider" />

      <section className="text-image-section">
        <div className="top-part">
          <div className="text-content">
            <h1>Top Organizations of the Month</h1>
            <p>
              The ranking is based on the impact of our programs, the number of participants,
              feedback, visibility, and other key indicators. It highlights organizations that
              actively contribute to community growth, foster meaningful engagement, and create
              sustainable positive change.
            </p>
          </div>
          <div className="image-content">
            <img src="/nkarner/Untitled-3.png" alt="Project" />
          </div>
        </div>

        <div className="three-images">
          <img src="/nkarner/aa.png" alt="UNDP" />
          <img src="/nkarner/bb.png" alt="UNICEF" />
          <img src="/nkarner/cc.png" alt="USAID" />
        </div>

        <div className="button-container">
          <button className="see-top-list">See Top List</button>
        </div>
      </section>

      <section className="partners-section">
        <h1>Partners</h1>
        <div className="partners-container">
         <div className="partners-logos">
         <div className="partners-scroll">
          <img src="/nkarner/partner.png" alt="Partner 1" />
          <img src="/nkarner/partner1.png" alt="Partner 2" />
          <img src="/nkarner/partner2.png" alt="Partner 3" />
          <img src="/nkarner/partner3.png" alt="Partner 4" />
          <img src="/nkarner/partner4.png" alt="Partner 5" />
        
          <img src="/nkarner/partner.png" alt="Partner 1" />
          <img src="/nkarner/partner1.png" alt="Partner 2" />
          <img src="/nkarner/partner2.png" alt="Partner 3" />
          <img src="/nkarner/partner3.png" alt="Partner 4" />
          <img src="/nkarner/partner4.png" alt="Partner 5" />
            </div>
          </div>
        </div>
      </section>
      <hr className="section-divider" />

      <section className="feedback-section">
        <h1>Feedback from <br />Greenwich members</h1>
        <div className="feedback-cards">
          {/* CARD 1 */}
          <div className="feedback-card">
            <div className="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <p>
              "An amazing experience! The team was very supportive and helped me learn new
              skills in community gardening and event planning."
            </p>
            <div className="profile">
              <div className="avatar"></div>
              <div className="info">
                <h4>John</h4>
                <p>Volunteer</p>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="feedback-card">
            <div className="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <p>
              "An amazing experience! The team was very supportive and helped me learn new
              skills in community gardening and event planning."
            </p>
            <div className="profile">
              <div className="avatar"></div>
              <div className="info">
                <h4>John</h4>
                <p>Volunteer</p>
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="feedback-card">
            <div className="stars">
              <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
            </div>
            <p>
              "An amazing experience! The team was very supportive and helped me learn new
              skills in community gardening and event planning."
            </p>
            <div className="profile">
              <div className="avatar"></div>
              <div className="info">
                <h4>John</h4>
                <p>Volunteer</p>
              </div>
            </div>
          </div>
        </div>

        <div className="feedback-button">
          <button className="see-more">See more</button>
        </div>
      </section>
      <section className="supported-section">
       <h1>Supported by</h1>
       <div className="partners-container">
       <div className="partners-logos">
       <div className="partners-scroll">
          <img src="/nkarner/partner5.png" alt="Partner 6" />
          <img src="/nkarner/partner6.png" alt="Partner 7" />
          <img src="/nkarner/partner7.png" alt="Partner 8" />
          <img src="/nkarner/partner8.png" alt="Partner 9" />
          <img src="/nkarner/partner9.png" alt="Partner 10" />
        
          <img src="/nkarner/partner5.png" alt="Partner 6" />
          <img src="/nkarner/partner6.png" alt="Partner 7" />
          <img src="/nkarner/partner7.png" alt="Partner 8" />
          <img src="/nkarner/partner8.png" alt="Partner 9" />
          <img src="/nkarner/partner9.png" alt="Partner 10" />
            </div>
          </div>
        </div>
      </section>
    
    </>
  );
}

export default HomePage;