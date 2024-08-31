import React, { useState, useEffect } from 'react';
import '../DoctorDetails.css';
import { Navigate, Link } from 'react-router-dom';


import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";

const PatientAccept = ({ }) => {

  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(false);
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


  const [data, setData] = useState([]);

  async function ski(obj) {
    const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
    const port = '';
    const token = {
      'X-API-Key': 'LFIoc7BZFY4CAAHfCC2at53vp5ZabBio5gAQ0ntL'
    }
    const algodclient = new algosdk.Algodv2(token, baseServer, port);
    const suggestedParams = await algodclient.getTransactionParams().do();
    const contract = new algosdk.ABIContract(appspec.contract);
    const atc = new algosdk.AtomicTransactionComposer();
    console.log("ac add", accountAddress);

    atc.addMethodCall({
      appID: 480211975,
      method: algosdk.getMethodByName(contract.methods, 'add_access_hash'),
      methodArgs: [obj.current_hash],
      note: new Uint8Array(Buffer.from(JSON.stringify(obj).length < 1024 ? JSON.stringify(obj) : '')),
      sender: accountAddress,
      suggestedParams: suggestedParams,
      signer: peraWalletSigner(peraWallet),
      onComplete: OnApplicationComplete.NoOpOC
    })
    console.log(atc);

    atc.execute(algodclient, 4)
      .then(async result => {
        console.log(result);
        const response = await restapi.post("/update_access_hash", JSON.stringify({
          obj: obj,
        }),
          {
            headers: {
              "Content-Type": "application/json",
            }
          }
        );
        const responseData = response.data;
        if (responseData.statusCode === 302) {

          console.log(responseData);
          window.location.href = "/";
        }
        if (responseData.statusCode === 200) {
          console.log(responseData);
          alert(responseData.notify);
          window.location.reload();
        }
        else {
          alert(responseData.notify);
        }
      })
      .catch(error => {
        // console.error(error);
        alert(error)
      });
  }

  async function handleButtonClick(index, status, uuid) {
    console.log(index, status, uuid);
    var authClient = await AuthClient.create();
    const identity = await authClient.getIdentity();
    var actor = createActor(canisterId, {
      agentOptions: {
        identity,
      },
    });
    var resp = await actor.patientAccept(uuid, status);
    if (resp.statusCode == BigInt(200)) {
      alert(resp.msg) ? "" : location.reload();
    } else if (resp.statusCode == BigInt(400)) {
      alert(resp.msg) ? "" : location.reload();
    } else {
      alert(resp.msg) ? "" : location.href = "/";
    }
  }

  useEffect(() => {
    async function sendRequest() {
      try {
        var authClient = await AuthClient.create();
        const identity = await authClient.getIdentity();
        var actor = createActor(canisterId, {
          agentOptions: {
            identity,
          },
        });
        let resp = await actor.patientRequests();
        console.log(resp);

        if (resp.statusCode === BigInt(200)) {
          for (var i = 0; i < resp.data[0].length; i++) {
            resp.data[0][i].sno = i + 1;
            resp.data[0][i].date = DateFromTimestamp(resp.data[0][i].date);
            resp.data[0][i].status = Object.keys(resp.data[0][i].status)[0];
            resp.data[0][i].access_given_on = DateFromTimestamp(resp.data[0][i].access_given_on);
          }
          setData(resp.data[0]);
        }
        else {
          alert(resp.msg) ? "" : window.location.href = "/";
        }
      } catch (error) {
        console.log(error);
      }
    }
    sendRequest();
  }
    , []);

  const renderTable = () => {
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
              <th>Note</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>{(data.length > 0) ?
            (data.map((row, index) => (
              <tr key={index} >
                <td>{row.sno}</td>
                <td>{row.date}</td>
                <td>{row.doctor_name}</td>
                <td>{row.note}</td>
                <td>{row.access_status ? <><button onClick={() => handleButtonClick(index, { Accept: null }, row.uuid)} className='button1'>Accept</button><span> </span><button onClick={() => handleButtonClick(index, { Reject: null }, row.uuid)} className='button1'>Decline</button></> : (row.status === "Reject") ? 'Access Declined on ' + row.access_given_on : 'Access Given on ' + row.access_given_on}</td>
              </tr>
            ))) : (<tr><td colSpan={5} style={{ textAlign: "center" }}>No Data Available</td></tr>)}
          </tbody>
        </table>
      </div>
    );
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
    <div className="navbar-container patientaccept-body">
      {(!isPatient) ? (<Navigate to="/" />) : (null)}
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
        <h1 className="center-heading">Request Logs</h1>
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
};

export default PatientAccept;
