import React from 'react'
import { useAuth } from '../../../store/AuthContext/AuthContext'

export default function Request() {

  const {role} = useAuth();




  return (
   <div>
      <h2>Users List</h2>
      {/* جدول المستخدمين */}
      
      {/* زرار حذف يظهر فقط للـ SuperAdmin */}
      {role === "superAdmin" ? (
        <button className="bg-red-500 text-white px-4 py-2 rounded">
         superAdmin
        </button>
      ) : <button className="bg-green-500 text-white px-4 py-2 rounded">
          admin
        </button>}
    </div>
  )
}
