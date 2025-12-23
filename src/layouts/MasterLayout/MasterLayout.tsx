// import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../../components/sidebar/SideBar'
import NavBar from '../../components/navbar/NavBar'

export default function MasterLayout() {
  return (
    <div>
      <NavBar/>
     <SideBar/>

        <Outlet />
    </div>
  )
}
