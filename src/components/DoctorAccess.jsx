import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import "../DoctorDetails.css";

import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";


const DoctorAccess = ({ }) => {
  const [principal, setPrincipal] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
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

  useEffect(() => {
    async function sendRequest() {
      await reconnectWallet();
    }
    sendRequest();
  }, []);

  function DateFromTimestamp(timestam) {
    const timestamp = timestam; // Replace this with your bigint timestamp
  
    // Convert bigint timestamp to milliseconds
    const milliseconds = Number(timestamp);
    var myDate = new Date(milliseconds / 1000000);
    // document.write(myDate.toGMTString()+"<br>"+myDate.toLocaleString());
  
    return myDate.toLocaleString();
  
  }


  const [selectedRow, setSelectedRow] = useState(null);
  const [data, setData] = useState([]);
  useEffect(() => {
    console.log("useeffect");
    // when page loads for the first time send a request to the server to get the data
    async function sendRequest() {
      try {
        var authClient = await AuthClient.create();
        const identity = await authClient.getIdentity();
        var actor = createActor(canisterId, {
          agentOptions: {
            identity,
          },
        });
        const resp = await actor.doctorAccess();
        console.log(resp);
        if (resp.statusCode === BigInt(200)) {
          for(var i=0;i<resp.data[0].length;i++){
            resp.data[0][i].sno = i+1;
            var re_acc = Object.keys(resp.data[0][i].request_access)[0];
            if(re_acc=="Nota"){
              resp.data[0][i].request_access = "Pending";
            }else if(re_acc=="Accept"){
              resp.data[0][i].request_access = "Accepted";
            }else if(re_acc=="Reject"){
              resp.data[0][i].request_access = "Rejected";
            }else{
              resp.data[0][i].request_access = "Completed";
            }

            if(resp.data[0][i].access_endson.length==0){
              resp.data[0][i].access_endson = "-";
            }else{
              resp.data[0][i].access_endson = DateFromTimestamp(resp.data[0][i].access_endson)
            }
          }
          setData(resp.data[0]);
        } else {
          alert(resp.msg);
        }
      } catch (error) {
        console.log(error);
      }
    }
    sendRequest();
  }, []);

  async function submitData() {
    if (document.getElementById("area")) {
      let patient_add = data[selectedRow]["patient_add"];
      let access_hash = data[selectedRow]["access_hash"];
      let text = document.getElementById("area").value;
      if (text.length < 1) {
        alert("Please enter some data");
        return;
      }
      const response = await restapi.post(
        "/send_data",
        JSON.stringify({
          patient_add: patient_add,
          access_hash: access_hash,
          data: text,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const responseData = response.data;
      if (responseData.statusCode === 200) {
        alert("Data submitted successfully");
        window.location.reload();
      } else if (responseData.statusCode === 403) {
        alert(responseData.notify);
      } else {
        alert("Some error occured");
      }
    }
  }

  const handleRowClick = (index) => {
    if (data[index].request_access === "Accepted") {
      setSelectedRow(index);
    }
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
                <th style={{ textAlign: "center" }}>SNum</th>
                <th>Patient Name</th>
                <th style={{ textAlign: "center" }}>Patient DOB</th>
                <th style={{ textAlign: "center" }}>Access Type</th>
                <th style={{ textAlign: "center" }}>Access Ends In</th>
                <th style={{ textAlign: "center" }}>Request Status</th>
              </tr>
            </thead>
            <tbody>{(data.length > 0) ?
              (data.map((row, index) => (
                <tr
                  className="table-row"
                  key={index}
                  onClick={() => {
                    handleRowClick(index);
                  }}
                >
                  <td style={{ textAlign: "center" }}>{row.sno}</td>
                  <td>{row.patient_name}</td>
                  <td style={{ textAlign: "center" }}>{row.patient_dob}</td>
                  <td style={{ textAlign: "center" }}>{row.access_type}</td>
                  <td style={{ textAlign: "center" }}>{row.access_endson}</td>
                  <td style={{ textAlign: "center" }}>{row.request_access}</td>
                </tr>
              ))) : (<tr><td colSpan={6} style={{ textAlign: "center" }}>No Data Available</td></tr>)}
            </tbody>
          </table>
        </div>
      );
    } else {
      const selectedData = data[selectedRow];
      const doctorDetails = selectedData.doctorDetails;

      return (
        <div>
          <div className={`doctor-details ${blur_class}`}>
            <div className="hide table"></div>
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
              <div className="details">
                <h2>Row Details</h2>
                <p>
                  <b>SNum:</b> {selectedData.sno}
                </p>
                <p>
                  <b>Patient Name:</b> {selectedData.patient_name}
                </p>
                <p>
                  <b>Patient DOB:</b> {selectedData.patient_dob}
                </p>
                <p>
                  <b>Access Type:</b> {selectedData.access_type}
                </p>
                <p>
                  <b>Access Ends In:</b> {selectedData.access_endson}
                </p>
                <button
                  onClick={handleBackClick}
                  className="back-button button1"
                >
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
              {selectedData.writeable === "yes" ? (
                <div className="details">
                  <h2>Doctor Actions</h2>
                  <textarea
                    name="data"
                    id="area"
                    cols="30"
                    rows="10"
                  ></textarea>
                  <input name="uploadedAttachment" type="file" />
                  <button onClick={submitData} className="button1 back-button">
                    Submit
                  </button>
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>
          <div className={`doctor-details ${blur_class}`}>
            <div
              style={{ width: `100%` }}
              className={`tablecard ${blur_class}`}
            >
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
                    <th>Past Prescription</th>
                    <th>Added By</th>
                    <th>Added On</th>
                    <th>Attachments</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedData.patient_history.map((row, index) => (
                    <tr className="table-row" key={index}>
                      <td>{row.snum}</td>
                      <td>{row.past_prescription}</td>
                      <td>{row.addedby}</td>
                      <td>{row.addedon}</td>
                      <td>{row.attachments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  const hamburger_class = isMenuOpen
    ? "hamburger hamburger--spring is-active"
    : "hamburger hamburger--spring";
  const blur_class = isBlurred ? "blur" : "";

  return (
    <div className="navbar-container profile-body">
      <nav className="navbar">
        {" "}
        {/* Use the class name directly */}
        <div className="logo">
          <img src="assets/logo.png" alt="Medisafe Logo" />
          <span className="nav-heading">MEDISAFE</span>
        </div>
        <div className="profile">
          <img src="assets/profile.png" alt="Profile Pic" />
          {/* <span>Hello, {userName}</span> */}
          <button class={hamburger_class} type="button" onClick={toggleMenu}>
            <span class="hamburger-box">
              <span class="hamburger-inner"></span>
            </span>
          </button>
        </div>
      </nav>
      <div className="doctor-details-container">
        <h1 className="center-heading">Patients Dealed</h1>
        {renderTable()}
      </div>

      <div className={`dropdown-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="dropdown-box">
          <Link className="button" to="/doctor_access">
            Patients dealed
          </Link>
          <Link className="button" to="/profile_qr">
            QR Scan
          </Link>
        </div>
        <div className="dropdown-box">
          <hr />
          <button className="button" onClick={handleWalletClick}>
            Logout
          </button>
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

export default DoctorAccess;
