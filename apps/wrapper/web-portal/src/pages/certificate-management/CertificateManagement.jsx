import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
const CertificateManagement = () => {
  return (
    <div >
      <Header></Header>
      <Outlet />
    </div>
  );
};

export default CertificateManagement;