import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../components/sidebar/SideBar';
import NavBar from '../../components/navbar/NavBar';

export default function MasterLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <NavBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0 lg:ml-20'
      } mt-16 p-6`}>
        <Outlet />
      </main>
    </div>
  );
}