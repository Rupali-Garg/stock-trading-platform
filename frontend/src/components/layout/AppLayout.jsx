import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const AppLayout = () => (
  <div className="min-h-screen bg-slate-950">
    <Navbar />
    <Sidebar />
    {/* Main content — offset by navbar height + sidebar width */}
    <main className="pt-16 pl-16 lg:pl-56">
      <div className="p-6 max-w-7xl mx-auto">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AppLayout;