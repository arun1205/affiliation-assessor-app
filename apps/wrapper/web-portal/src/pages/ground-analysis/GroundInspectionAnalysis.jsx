import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
const GroundInspectionAnalysis = () => {
  return (
    <div >
        <Header></Header>
      <Outlet />
    </div>
  );
};

export default GroundInspectionAnalysis;
