import React from 'react';
import './ProfilePicture.css';

const ProfilePicture = ({ avatar }) => {
  return (
    <img src={avatar} alt="Profile" className="profile-picture" />
  );
};

export default ProfilePicture;
