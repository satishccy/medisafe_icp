import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrReader } from "react-qr-reader";
import "../ScanQR.css";
import { Navigate, Link } from "react-router-dom";

import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";



function ScanQR({ }) {
  const [showCamera, setShowCamera] = useState(false);
  const toggleCamera = async () => {
    setShowCamera(!showCamera);
    if (showCamera == true) {
      console.log('camera closed');
      await closeCamera();
    }
  };
  const [qrscan, setQrscan] = useState(' ');

  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [requestAccess, setRequestAccess] = useState(false);
  const [name, setName] = useState('');

  //authentication starts

  const [principal, setPrincipal] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);
  let authClient;
  let actor;

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


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsBlurred(!isBlurred); // Toggle the blur effect when the menu is opened/closed
  };
  const hamburger_class = isMenuOpen ? 'hamburger hamburger--spring is-active' : 'hamburger hamburger--spring';
  const blur_class = isBlurred ? 'blur' : '';

  useEffect(() => {
    async function sendRequest() {
      await reconnectWallet();
      setIsLoading(false);
      var resp = await actor.getPatientDetails();
      console.log(resp);
      if (resp.statusCode == BigInt(200)) {
        var doc = resp.patient[0];
        setName(doc.name);
      }
    }
    sendRequest();
  }
    , []);

  const [showQrCard, setShowQrCard] = useState(true);
  const handleBackClick = () => {
    setShowQrCard(true);
  };
  async function closeCamera() {
    console.log('in close');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
    stream.getTracks().forEach(function (track) {
      console.log('tra');
      track.stop();
      track.enabled = false;
    });
  }

  const scanResult = () => {
    if (showQrCard) {
      return (
        <div className={`card Qrcard ${blur_class}`}>
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
          {showCamera ? (
            <div className="camera">
              <QrReader
                delay={300}
                onResult={async (result, error) => {
                  console.log(result);
                  if (!!result) {
                    console.log(result);
                  }
                  if (!!error) {
                    //console.info(error);
                  }
                }}

                style={{ height: '20px', width: '20px' }}
              />
              <a href={qrscan}>link:{qrscan}</a>

            </div>
          ) : (
            <div className="user-info">
              <div className="qr">
                <QRCodeSVG
                  value={`${principal}`}
                  bgColor={"#fff"}
                  fgColor={"#000"}
                />
              </div>
              <p>Username: {name}</p>
              <p>Role: Patient</p>
            </div>
          )}
          <div className="back-button">
            <button onClick={toggleCamera} className="button1">
              {showCamera ? 'Show QR' : 'Scan QR'}
            </button>
          </div>

        </div>
      );
    }
    else if (Object.keys(data).length > 0) {
      return (
        <div className={`card ${blur_class}`}>
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
          <div className="patient-details">
            <div className="patient-info">
              <p><b>Name:</b> {data.patient_details.name}</p>
              <p><b>Dob:</b> {data.patient_details.DOB}</p>
              <p><b>Role:</b> {data.patient_details.role}</p>
              <p style={{ overflow: "scroll" }}><b>Address:</b>{data.user_add}</p>
            </div>
            {
              requestAccess ? (
                <div className="request-access">
                  <textarea rows={7} id='data' placeholder="Enter your note"></textarea>
                  <div className="select-button-container">
                    <div className="select">
                      <select id='request_type'>
                        <option value="1">Normal Access</option>
                        <option value="2">Emergency Access</option>
                      </select>
                    </div>
                    <button className="button1 request-button" id="request_btn" onClick={handleRequestAccess}>Request Access</button>
                  </div>
                </div>
              ) : (
                <div>{err}</div>
              )
            }
            <div className="back-button">
              <button className="button1 back" onClick={handleBackClick}>Back</button>
            </div>
          </div>
        </div>
      );
    } else {
      return <div></div>
    }
  }
  return (
    (isLoading == false) ? (
    <div className="navbar-container scan-body">
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
      {scanResult()}


      <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className='dropdown-box'>
          <Link className='button' to="/patient_logs">Request Logs</Link>
          <Link className='button' to="/patient_reports">Reports</Link>
          <Link className='button' to="/patient_qr">QR Scan</Link>
          <a className='button' href="https://srinuksv-srunu347.hf.space">Chat Bot</a>
        </div>
        <div className='dropdown-box'>
          <hr />
          <button className='button' onClick={handleWalletClick}>Logout</button>
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
}

export default ScanQR;