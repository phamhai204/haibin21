
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: 'fa-user-circle', label: 'Hồ sơ tài chính' },
    { path: '/create', icon: 'fa-plus-square', label: 'Tạo đơn hàng' },
    { path: '/orders', icon: 'fa-tasks', label: 'Quản lý đơn hàng' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen sticky top-0 border-r border-slate-800 flex flex-col p-6">
      <div className="flex items-center gap-3 mb-10">
        <div 
          className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl cursor-pointer"
          onClick={() => navigate('/')}
        >
          <i className="fas fa-shield-halved"></i>
        </div>
        <h1 
          className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate('/')}
        >
          BNPL Demo
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
              location.pathname === item.path
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <div className="bg-slate-800/50 p-4 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
            Hệ thống Fintech
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mô phỏng quy trình chấm điểm tín dụng & quản lý rủi ro.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
