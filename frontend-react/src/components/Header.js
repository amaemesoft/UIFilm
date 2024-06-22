import React, { useState } from 'react';
import './Header.css';

const Header = () => {
  const [profilePicture, setProfilePicture] = useState(`${process.env.PUBLIC_URL}/ama.png`);

  const handleProfilePictureClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfilePicture(reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  return (
    <div className="header">
      <img src={profilePicture} alt="User Avatar" className="avatar" onClick={handleProfilePictureClick} />
      <div className="user-info">
        <div className="username">Ama</div>
        <div className="status">
          <span>Online</span>
        </div>
      </div>
      <div className="icons">
        <img src={`${process.env.PUBLIC_URL}/resources/icons/video.png`} alt="Video Call" className="icon video-icon"/>
        <img src={`${process.env.PUBLIC_URL}/resources/icons/phone.png`} alt="Phone Call" className="icon phone-icon"/>
      </div>
    </div>
  );
};

export default Header;
