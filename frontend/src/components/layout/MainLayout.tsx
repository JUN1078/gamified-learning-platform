import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Header />

        <main className="flex-1 p-6 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
