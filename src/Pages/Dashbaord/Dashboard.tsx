// import React from 'react'
import { useNavigate } from 'react-router-dom'
import LogoutButton from '../../components/shared/LogoutButton'

export default function Dashboard() {


  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
 dashboard
   <button   onClick={() => navigate('/customer')}>Customers</button>
   <button onClick={() => navigate('/requests')}>requests</button>
      <LogoutButton />
      </div>
     
    </div>
  )
}
