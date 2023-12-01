import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from "../../components/Header";
function ManageUser() {
    return (
    <div >
         <Header></Header>
        <Outlet />
    </div>
  )
}

export default ManageUser
