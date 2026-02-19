import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

const navItemsByRole = {
  BUYER: [
    { to: '/buyer/dashboard', label: 'Dashboard' },
    { to: '/buyer/tenders', label: 'My Tenders' },
    { to: '/buyer/open-tenders', label: 'Browse Vendors' }
  ],
  VENDOR: [
    { to: '/vendor/dashboard', label: 'Dashboard' },
    { to: '/vendor/tenders', label: 'Open Tenders' },
    { to: '/vendor/orders', label: 'Orders' }
  ],
  ADMIN: [
    { to: '/admin/dashboard', label: 'Analytics' },
    { to: '/admin/users', label: 'Users' }
  ]
};

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const items = user ? navItemsByRole[user.role] || [] : [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="px-6 py-4 border-b">
          <div className="text-xl font-bold text-primary-600">TenderHub</div>
          {user && (
            <div className="mt-2 text-sm text-slate-500">
              {user.name} • {user.role}
            </div>
          )}
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname.startsWith(item.to)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {user && (
          <button
            onClick={logout}
            className="m-4 px-3 py-2 text-sm rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-left"
          >
            Logout
          </button>
        )}
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="w-full bg-white border-b px-4 py-3 flex items-center justify-between md:hidden">
          <span className="font-semibold text-primary-600">TenderHub</span>
          {user && (
            <button onClick={logout} className="text-xs text-slate-600 underline">
              Logout
            </button>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

