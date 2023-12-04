import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../components/Header";
const Notification = () => {
  return (
    <div>
         <Header></Header>
      <Outlet />
    </div>
  );
};

export default Notification;