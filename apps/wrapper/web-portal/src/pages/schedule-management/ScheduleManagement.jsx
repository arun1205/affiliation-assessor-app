import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from "../../components/Header";
function ScheduleManagement() {
  return (
    
    <div>
      <Header></Header>
        <Outlet/>
    </div>
  )
}

export default ScheduleManagement