import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
        
function DesktopAnalysis() {
  return (
    <div>
      <Header></Header>
      <Outlet />
    </div>
  );
}

export default DesktopAnalysis;
