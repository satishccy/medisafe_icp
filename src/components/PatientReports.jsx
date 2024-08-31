import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import '../DoctorDetails.css';

import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";

const PatientReports = ({ }) => {
  const [principal, setPrincipal] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  var authClient;
  var actor;

  async function handleAuthenticated(authClient) {
    setIsConnected(true);
    const identity = await authClient.getIdentity();
    actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    var resp = await actor.isAccountExists();
    console.log(resp);
    if (resp.statusCode == BigInt(200)) {
      setPrincipal(resp.principal.toString());
      if (resp.msg == "null") {
        setLoggedIn(true);
        setIsConnected(true);
      } else if (resp.msg == "doctor") {
        setIsConnected(true);
        setIsDoctor(true);
        setLoggedIn(true);
      } else {
        setIsConnected(true);
        setIsPatient(true);
        setLoggedIn(true);
      }
    }
    console.log(isConnected, isDoctor, isPatient, loggedIn);
  }

  async function handleWalletClick() {
    var authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      authClient.logout();
      window.location.href = "/";
    } else {
      authClient.login({
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
        identityProvider: process.env.DFX_NETWORK === "ic"
          ? "https://identity.ic0.app/#authorize"
          : `http://localhost:4943?canisterId=${process.env.CANISTER_ID_internet_identity}`,
        onSuccess: async () => {
          handleAuthenticated(authClient);
        },
      });
    }
  }

  async function reconnectWallet() {
    console.log("connec");
    authClient = await AuthClient.create();
    if (await authClient.isAuthenticated()) {
      await handleAuthenticated(authClient);
    } else {
      actor = backend;
    }

  }

  function DateFromTimestamp(timestam) {
    const timestamp = timestam; // Replace this with your bigint timestamp

    // Convert bigint timestamp to milliseconds
    const milliseconds = Number(timestamp);
    var myDate = new Date(milliseconds / 1000000);
    // document.write(myDate.toGMTString()+"<br>"+myDate.toLocaleString());

    return myDate.toLocaleString();

  }

  const convertDataURIToBinary = dataURI =>
    Uint8Array.from(window.atob(dataURI.replace(/^data[^,]+,/, '')), v => v.charCodeAt(0));


  async function bufferToBase64(buffer) {
    // use a FileReader to generate a base64 data URI:
    const base64url = await new Promise(r => {
      const reader = new FileReader()
      reader.onload = () => r(reader.result)
      reader.readAsDataURL(new Blob([buffer]))
    });
    // remove the `data:...;base64,` part from the start
    return base64url.slice(base64url.indexOf(',') + 1);
  }

  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    async function sendRequest() {
      await reconnectWallet();
      setIsLoading(false);
      // var authClient = await AuthClient.create();
      // const identity = await authClient.getIdentity();
      // var actor = createActor(canisterId, {
      //   agentOptions: {
      //     identity,
      //   },
      // });
      let resp = await actor.patientRecords();
      console.log(resp);
      if (resp.statusCode == BigInt(200)) {
        for (var i = 0; i < resp.data[0].length; i++) {
          resp.data[0][i].snum = i + 1;
          resp.data[0][i].date = DateFromTimestamp(resp.data[0][i].date);
          resp.data[0][i].attachment = await bufferToBase64(resp.data[0][i].attachment);
          resp.data[0][i].doctordetails.gender = Object.keys(resp.data[0][i].doctordetails.gender)[0];
        }
        setData(resp.data[0]);
      } else {
        (alert(resp.msg)) ? "" : window.location.href = "/";
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
            <tbody>{(data.length > 0) ?
              (data.map((row, index) => (
                <tr className='table-row' key={index} onClick={() => handleRowClick(index)}>
                  <td>{row.snum}</td>
                  <td>{row.date}</td>
                  <td>{row.doctordetails.name}</td>
                </tr>
              ))) : (<tr><td colSpan={3} style={{ textAlign: "center" }}>No Data Available</td></tr>)}
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
            <div style={{padding:"0px",margin:"0px 80px"}} className='details'>
              <h2 className='h2'>Row Details</h2>
              <h4>Prescription</h4>
              <p>{selectedData.prescription}</p>
              <h4>Date</h4>
              <p>{selectedData.date}</p>
              <h4>Attachment</h4>
              {<a className="pointer" style={{ cursor: "pointer",color: "black",textDecoration:"underline" }}
                onClick={() => {
                  let data = "data:image/jpeg;base64,"+selectedData.attachment;

                  let w = window.open("about:blank");
                  let image = new Image();
                  image.src = data;
                  setTimeout(function () {
                    w.document.write(image.outerHTML);
                  }, 0)
                }}
              >View Attachment</a>}
              <button onClick={handleBackClick} style={{marginTop:"24px"}} className="back-button button1">
                Back to Table
              </button>
            </div>
          </div>
          <div  className="right-card card">
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
            <div style={{padding:"0px",margin:"0px 80px"}}  className='details'>
              <h2 className='h2'>Doctor Details</h2>
              <p><b>Name: </b>{selectedData.doctordetails.name}</p>
              <p><b>Date of Birth:</b> {selectedData.doctordetails.dob}</p>
              <p><b>Gender:</b> {selectedData.doctordetails.gender}</p>
              <p><b>Specialization:</b> {selectedData.doctordetails.specialization}</p>
              <p><b>No.of Requests To Patients:</b> {selectedData.doctordetails.requests.length}</p>
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
    (isLoading == false) ? (
    <div className="navbar-container profile-body">
      <nav className="navbar"> {/* Use the class name directly */}
        <div className="logo">
        {(!isPatient) ? (<Navigate to="/" />) : (null)}
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
          <Link className='button' to="/patient_reports">Reports</Link>
          <Link className='button' to="/patient_qr">QR Scan</Link>
          <a className='button' href="https://srinuksv-srunu347.hf.space">Chat Bot</a>
        </div>
        <div className='dropdown-box'>
          <hr />
          <button className='button' onClick={handleBackClick}>Logout</button>
          <div className="social-icons">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
          </div>
        </div>
      </div>
    </div>
    ) : (<div>Loading...</div>)
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