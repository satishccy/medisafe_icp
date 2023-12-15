// AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './Home.jsx';
import Signup from './Signup.jsx';
import PatientNavbarProfile from './PatientNavbarProfile.jsx';
import NavbarProfile from './NavbarProfile.jsx';
import ScanQR from './ScanQR.jsx';
import DoctorAccess from './DoctorAccess.jsx';
import PatientAccept from './PatientAccept.jsx';
import { Navigate } from 'react-router-dom';
import PatientScanQR from './PatientScanQR.jsx';
import PatientAdd from './Patientadd.jsx';
import PatientReports from './PatientReports.jsx';
import PatientContacts from './PatientContacts.jsx';
import { backend } from "../declarations/backend";
import { AuthClient } from "@dfinity/auth-client";
import { canisterId, createActor } from "../declarations/backend";
import { Principal } from "@dfinity/principal";


const AppRouter = () => {

  console.log("ko");

  

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/doctorprofile" element={<NavbarProfile />} />
        <Route path="/patientprofile" element={<PatientNavbarProfile />} />
        <Route path="/profile_qr" element={<ScanQR />} />
        <Route path="/doctor_access" element={<DoctorAccess />} />
        <Route path="/patient_logs" element={<PatientAccept />} />
        <Route path="/patient_reports" element={<PatientReports />} />
        <Route path="/patient_qr" element={<PatientScanQR />} />
        {/*<Route path="/patient_add" element={<PatientAdd handleDisconnectWalletClick={handleDisconnectWalletClick} />} />
        <Route path="/patient_contacts" element={<PatientContacts handleDisconnectWalletClick={handleDisconnectWalletClick} />} /> */}
      </Routes>
    </Router>
  );
};

export default AppRouter;
