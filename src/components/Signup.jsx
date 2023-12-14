import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";
import '../Signup.css';

function Signup({ }) {
  const [isDoctor, setIsDoctor] = useState(true);

  const [principal, setPrincipal] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isxDoctor, setIsxDoctor] = useState(false);
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
        setIsxDoctor(true);
        setLoggedIn(true);
      } else {
        setIsConnected(true);
        setIsPatient(true);
        setLoggedIn(true);
      }
    }
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




  const toggleUserType = () => {
    setIsDoctor((prevIsDoctor) => !prevIsDoctor);
  };


  async function ski() {
    var name = document.getElementById("name").value;
    var dob = document.getElementById("date").value;
    var gender = document.getElementById("gender").value;
    var specialization = document.getElementById("specialization").value;
    var g;
    if (gender == 'male') {
      g = { Male: null };
    } else {
      g = { Female: null };
    }
    if(!isConnected){
      alert("Connect Wallet to continue");
    }
    var authClient = await AuthClient.create();
    const identity = await authClient.getIdentity();
    var actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });

    if (isDoctor) {
      if ((name == null || name == "") || (dob == null || dob == "") || (gender == null || gender == "") || (specialization == null || specialization == "")) {
        alert("Fill in All Details to Signup.");
        return;
      }
    
      var resp = await actor.createDoctor(name, dob, g, specialization);
      if(resp.statusCode == BigInt(200)){
        setIsxDoctor(true);
      }else{
        alert(resp.msg);
      }

    }
    else {
      if ((name == null || name == "") || (dob == null || dob == "") || (gender == null || gender == "")) {
        alert("Fill in All Details to Signup.");
        return;
      }
      var resp = await actor.createPatient(name, dob, g);
      if(resp.statusCode == BigInt(200)){
        setIsPatient(true);
      }else{
        alert(resp.msg);
      }

    }
  }



  return (

    <div className="signup-container">
      {
        isxDoctor ? <Navigate to="/doctorprofile" /> : null
      }
      {
        isPatient ? <Navigate to="/patientprofile" /> : null
      }
      <div className={`content ${isDoctor ? 'left' : 'right'}`}>
        <div className={`left-content ${isDoctor ? '' : 'blur'}`}>
          <img
            src="doctor-image.png"
            alt="Doctor"
            className="image"
          />
          <p className="label">Doctor</p>
        </div>
        <label className={`switch ${isDoctor ? 'left' : 'right'}`}>
          <input
            type="checkbox"
            className="toggle-button"
            onChange={toggleUserType}
            checked={!isDoctor}
          />
          <span className="slider"></span>
        </label>
        <div className={`right-content ${isDoctor ? 'blur' : ''}`}>
          <img
            src="patient-image.png"
            alt="Patient"
            className="image"
          />
          <p className="label">Patient</p>
        </div>
      </div>
      <div className="signup-form">
        <h2>Sign up as a {isDoctor ? 'Doctor' : 'Patient'}</h2>
        {/* Add your signup form fields here */}
        {/* Example: */}
        <form>
          <label>
            Username:
            <input id='name' type="name" />
          </label>
          <label>
            Date of Birth:
            <input id='date' type='date' />
          </label>
          <label>
            Gender:
            <select id="gender">
              <option value=''>Select Gender</option>
              <option value='male'>Male</option>
              <option value='female'>Female</option>
            </select>
          </label>
          <label style={{ display: `${isDoctor ? `block` : `none`}` }}>
            Specialization:
            <input id="specialization" type='text' />
          </label>


        </form>
        <button type="submit" onClick={ski} className='btn1'>Sign Up</button>
      </div>
      <ul class="background">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  );
}

export default Signup;
