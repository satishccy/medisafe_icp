import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrReader } from "react-qr-reader";
import "../ScanQR.css";
import { Navigate, Link } from "react-router-dom";

import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";


function ScanQR() {
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
  const [dob, setDob] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [noofreq, setNoofreq] = useState(0);


  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [requestAccess, setRequestAccess] = useState(false);
  const [data, setData] = useState({});
  const [err, setErr] = useState('');
  const [patient_add, setPatient_add] = useState("");


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

  useEffect(() => {
    async function sendRequest() {
      await reconnectWallet();
      console.log("comple");
      setIsLoading(false);
      var resp = await actor.getDocDetails();
      console.log(resp);
      if (resp.statusCode == BigInt(200)) {
        var doc = resp.doc[0];
        setDob(doc.dob);
        setName(doc.name);
        setGender(Object.keys(doc.gender)[0]);
        setSpecialization(doc.specialization);
        setNoofreq(doc.requests.length);
      }
    }
    sendRequest();
  }, []);

  // authentication ends


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsBlurred(!isBlurred); // Toggle the blur effect when the menu is opened/closed
  };
  const hamburger_class = isMenuOpen ? 'hamburger hamburger--spring is-active' : 'hamburger hamburger--spring';
  const blur_class = isBlurred ? 'blur' : '';

  async function handleRequestAccess() {
    var btn = document.getElementById('request_btn');
    btn.disabled = true;
    var request_type = document.getElementById('request_type').value;
    var note = document.getElementById('data').value
    if (note.length < 1) {
      alert("Enter note");
      btn.disabled = false;
      return;
    }
    if (note.length > 500) {
      alert("note must be less than 500 chars");
      btn.disabled = false;
      return;
    }
    var isEmergency = false;
    if (request_type == "2") {
      isEmergency = true;
    }
    var authClient = await AuthClient.create();
    const identity = await authClient.getIdentity();
    var actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    var resp = await actor.addRequest(patient_add, isEmergency, note);

    console.log(resp);
    if (resp.statusCode === 200) {
      setRequestAccess(false);
      setErr("Request successfully to the patient, check status of the request in patients section");
      alert(resp.msg);
    }
    else {
      alert(resp.msg);
    }
    btn.disabled = false;
  }


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
          {showCamera ? (
            <div className="camera">
              <QrReader
                delay={300}
                onResult={async (result, error) => {
                  console.log(result);
                  if (!!result) {
                    console.log(result);

                    var authClient = await AuthClient.create();
                    const identity = await authClient.getIdentity();
                    var actor = createActor(canisterId, {
                      agentOptions: {
                        identity,
                      },
                    });
                    if (result == "http://plus.crrepa.com/app-download/dafit") {
                      result = "7nlzr-slwah-k65ta-7zeiy-etcr5-vwopv-nadm2-jvywx-qzmqq-cujd6-lqe";
                      // result = "25fxy-ner6t-4mnh5-dsdju-jgnid-t6zcr-jjvvg-dftid-jds2k-whxnq-gqe";
                    }
                    setPatient_add(result);
                    var resp = await actor.doctorScan(result);
                    resp.principal = result;
                    console.log(resp)

                    if (resp.statusCode === BigInt(200)) {
                      setData(resp);
                      await closeCamera();
                      if (resp.is_having_access === true) {
                        setErr('You have General access for data of this Patient, go to Patients Section for Accessing Data')
                      }
                      else if (resp.is_having_emergency === true) {
                        setErr('You have Emergency access for data of this Patient, go to Patients Section for Accessing Data')
                      }
                      else if (resp.is_pending === true) {
                        setErr('You have Pending Request for data of this Patient, go to Patients Section for Accessing Status of Request')
                      }
                      else {
                        setRequestAccess(true);
                      }
                      setShowQrCard(false);
                    } else {
                      alert(resp.msg);
                    }
                  }


                }

                }

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
              <p>Role: Doctor</p>
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
          <div className="patient-details">
            <div className="patient-info">
              <p><b>Name:</b> {data.patient[0].name}</p>
              <p><b>Dob:</b> {data.patient[0].dob}</p>
              <p><b>Gender:</b> {Object.keys(data.patient[0].gender)[0]}</p>
              <p><b>No.of Records Available:</b> {Number(data.patient[0].noofrecords)}</p>
              <p><b>Role:</b> Patient</p>
              <p><b>Principal:</b>{data.principal}</p>
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
        {(!isDoctor) ? (<Navigate to="/" />) : (null)}

        <nav className="navbar"> {/* Use the class name directly */}
          <div className="logo">
            <img src="assets/logo.png" alt="Medisafe Logo" />
            <span className='nav-heading'>MEDISAFE</span>
          </div>
          <div className="profile">
            <img src="assets/profile.png" alt="Profile Pic" />
            {/* <span>Hello, {userName}</span> */}
            <button className={hamburger_class} type="button" onClick={toggleMenu}>
              <span className="hamburger-box">
                <span className="hamburger-inner"></span>
              </span>
            </button>
          </div>
        </nav>
        {scanResult()}


        <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="dropdown-box">
            <Link className="button" to="/doctor_access">Patients dealed</Link>
            <Link className="button" to="/profile_qr">QR Scan</Link>
          </div>
          <div className="dropdown-box">
            <hr />
            <button className="button" onClick={handleWalletClick}>Logout</button>
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