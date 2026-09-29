import React, { useEffect, useState } from 'react'
import { FaHome } from "react-icons/fa";
import { QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import NotificationDropdown from '@/admin/features/Notification/components/NotificationDropdown';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ViewModeSelector from '@/client/components/common/ViewModeSelector';

const ADMIN_VIEW_MODE_STORAGE_KEY = "admin-view-mode";
const ADMIN_VIEW_MODE_EVENT = "admin-view-mode-change";

function isMobileDeviceScreen() {
  if (typeof window === "undefined") return false;
  return Math.min(window.screen.width, window.screen.height) < 768;
}

export default function AdminHeader({ requestedViewMode }) {
  const [showViewportSwitch, setShowViewportSwitch] = useState(isMobileDeviceScreen);

  useEffect(() => {
    const syncScreenMode = () => setShowViewportSwitch(isMobileDeviceScreen());

    window.addEventListener("resize", syncScreenMode);
    window.addEventListener("orientationchange", syncScreenMode);
    return () => {
      window.removeEventListener("resize", syncScreenMode);
      window.removeEventListener("orientationchange", syncScreenMode);
    };
  }, []);

  const viewportSwitch = showViewportSwitch ? (
    <ViewModeSelector
      storageKey={ADMIN_VIEW_MODE_STORAGE_KEY}
      eventName={ADMIN_VIEW_MODE_EVENT}
      desktopWidth={1180}
      variant="toggle"
    />
  ) : null;

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

        {viewportSwitch}
        <LanguageSwitcher />
        <NotificationDropdown size={20} className="text-slate-600 hover:text-[#9d1159]" />
      </div>
    </header>
  )
}
