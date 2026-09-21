import React from 'react'
import { FaHome } from "react-icons/fa";
import { QrCode, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationDropdown from '@/admin/features/Notification/components/NotificationDropdown';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminHeader({ sidebarState, setSidebarState }) {
  const handleMenuToggle = () => {
    if (window.innerWidth < 768) {
      setSidebarState(sidebarState === 0 ? 2 : 0);
    } else {
      setSidebarState(sidebarState === 2 ? 1 : 2);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-xl shrink-0">
      {/* Left — hamburger (mobile) */}
        {/* Home */}
      <div className="flex items-center gap-2 text-slate-600 text-xl">
        <Link
          to="/admin"
          className="text-slate-600 px-2 py-1.5 border-[2px] hover:bg-[#870d4c]/20 rounded-md hover:text-[#9d1159] transition-colors"
        >
          <FaHome size={18} />
        </Link>
        <Link
          to="qr-code"
          className="px-2 py-1.5 border-[2px] hover:bg-[#870d4c]/20 rounded-md hover:text-[#9d1159] transition-colors"
        >
          <QrCode size={18} className="text-slate-600 hover:text-[#9d1159]" />
        </Link>

      </div>
      {/* Right — actions */}
      <div className="flex items-center gap-2 text-slate-600 text-xl">
        {/* Notifications Dropdown Component */}

        <LanguageSwitcher />
        <NotificationDropdown size={20} className="text-slate-600 hover:text-[#9d1159]" />
      </div>
    </header>
  )
}