import React from 'react';
import '../Profile.css'; // Import the CSS file

const Profile = ({ principal, name, dob, gender,doctorsVisited,NoofRecords, isBlurred }) => {
  const profileClass = isBlurred ? 'profile-section blurred' : 'profile-section';

  return (
    <div className={profileClass}>
      <div className="tools">
                <div className="circle">
                  <span className="red box"></span>
                </div>
                <div className="circle">
                  <span className="yellow box"></span>
                </div>
                <div className="circle">
                  <span className="green box"></span>
                </div>
      </div>
        <i className="profile-pic fa-solid fa-user fa-2xl"></i>
     
      <div className="profile-info">
      <p><b>Principal:</b> {principal}</p>
      <p><b>Name: </b>{name}</p>
        <p><b>Date of Birth:</b> {dob}</p>
        <p><b>Gender:</b> {gender}</p>
        <p><b>Doctors visited:</b> {doctorsVisited}</p>
        <p><b>No.of Records Stored on Blockchain:</b> {NoofRecords}</p>
      </div>
    </div>
  );
};

export default Profile;
