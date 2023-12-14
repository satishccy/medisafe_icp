import React, { useState,useEffect } from 'react';
import { Link,Navigate } from 'react-router-dom';
import '../DoctorDetails.css';

const PatientReports = ({restapi,handleDisconnectWalletClick}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  useEffect(() => {
    async function sendRequest() {
      try {
        const response = await restapi.get("/patient_access");
        const responseData = response.data;
        if (responseData.statusCode === 200) {
          setData(responseData.data);
        } else {
          <Navigate to="/" />;
        }
      } catch (error) {
        console.log(error);
      }
    }
    sendRequest();
  }, []);

  const handleRowClick = (index) => {
    setSelectedRow(index);
  };

  const handleBackClick = () => {
    setSelectedRow(null);
  };

  const renderTable = () => {
    if (selectedRow === null) {
      return (
        <div className={`tablecard ${blur_class}`}>
           <div class="tools">
            <div class="circle">
              <span class="red box"></span>
            </div>
            <div class="circle">
              <span class="yellow box"></span>
            </div>
            <div class="circle">
              <span class="green box"></span>
            </div>
          </div>
        <table className="table content-table">
          <thead>
            <tr>
              <th>SNum</th>
              <th>Date</th>
              <th>Doctor Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr className='table-row' key={index} onClick={() => handleRowClick(index)}>
                <td>{row.snum}</td>
                <td>{row.date}</td>
                <td>{row.doctorname}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      );
    } else {
      const selectedData = data[selectedRow];
      const doctordetails = selectedData.doctordetails;
      return (
        <div className={`doctor-details ${blur_class}`}>
          <div className='hide table'>

          </div>
          <div className="left-card card">
            <div class="tools">
              <div class="circle">
                <span class="red box"></span>
              </div>
              <div class="circle">
                <span class="yellow box"></span>
              </div>
              <div class="circle">
                <span class="green box"></span>
              </div>
            </div>
            <div className='details'>
            <h2 className='h2'>Row Details</h2>
            <h4>Prescription</h4>
            <p>{selectedData.patient_prescription}</p>
            <h4>Date</h4>
            <p>{selectedData.date}</p>
            <h4>Attachment</h4>
             {(selectedData.patient_attachments==="")?<p>No Attachments</p>:<a href={selectedData.patient_attachments}>{selectedData.patient_attachments}</a>}
            <a href={`${selectedData.patient_attachments}`}>Attachments</a>
            <button onClick={handleBackClick} className="back-button button1">
              Back to Table
            </button>
            </div>
          </div>
          <div className="right-card card">
            <div class="tools">
                <div class="circle">
                  <span class="red box"></span>
                </div>
                <div class="circle">
                  <span class="yellow box"></span>
                </div>
                <div class="circle">
                  <span class="green box"></span>
                </div>
              </div>
            <div className='details'>
            <h2 className='h2'>Doctor Details</h2>
            <p>Name: {doctordetails.name}</p>
            <p>DOB: {doctordetails.DOB}</p>
            <p>Specialisation: Cardiology</p>
            <p>Experience: 6 Years</p>
            </div>
          </div>
        </div>
      );
    }
  };
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsBlurred(!isBlurred); // Toggle the blur effect when the menu is opened/closed
  };
  const hamburger_class = isMenuOpen ? 'hamburger hamburger--spring is-active' : 'hamburger hamburger--spring';
  const blur_class = isBlurred ? 'blur' : '';

  return (
    <div className="navbar-container profile-body">
      <nav className="navbar"> {/* Use the class name directly */}
        <div className="logo">
          <img src="logo.png" alt="Medisafe Logo" />
          <span className='nav-heading'>MEDISAFE</span>
        </div>
        <div className="profile">
          <a href="/patientprofile">
            <img src="profile.png" alt="Profile Pic" />
          </a>
          {/* <span>Hello, {userName}</span> */}
          <button class={hamburger_class} type="button" onClick={toggleMenu}>
            <span class="hamburger-box">
              <span class="hamburger-inner"></span>
            </span>
          </button>  
        </div>
      </nav>
    <div className='doctor-details-container'>
      <h1 className="center-heading">Past Reports</h1>
      {renderTable()}
    </div>
      
    <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className='dropdown-box'>
          <Link className='button' to="/patient_logs">Request Logs</Link>
          <Link className='button' to="/patient_contacts">Contacts</Link>
          <Link className='button' to="/patient_reports">Reports</Link>
          <Link className='button' to="/patient_add">Add Data</Link> 
          <Link className='button' to="/patient_qr">QR Scan</Link>
          <a className='button' href="https://0fea70bb93826fd071.gradio.live">Chat Bot</a>
        </div>
        <div className='dropdown-box'>
        <hr />
        <button className='button' onClick={handleDisconnectWalletClick}>Logout</button>
        <div className="social-icons">
          <i className="fab fa-facebook"></i>
          <i className="fab fa-twitter"></i>
          <i className="fab fa-instagram"></i>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReports;




// {
//   // if length of data is greater than 0 then show the data
//   Object.keys(data).length > 0 ? (
//     <div className="patient-details">
//       <div className="patient-info">
//         <p>name: {data.patient_details.name}</p>
//         <p>dob: {data.patient_details.DOB}</p>
//         <p>role: {data.patient_details.role}</p>
//         <p>address: {data.user_add}</p>
//       </div>
//       {
//       requestAccess ? (
//         <div className="request-access">
//             <select id='request_type'>
//             <option value="1">Normal Access</option>
//             <option value="2">Emergency Access</option>
//             </select>
//             <textarea id='data' placeholder="Enter your note"></textarea>
//             <button id='request_btn' onClick={handleRequestAccess}>Request Access</button>
//         </div>
//       ) : (
//         <div>{err}</div>
//       )
//       }
//     </div>
//   ) : (
//     <div></div>
//   )
// }