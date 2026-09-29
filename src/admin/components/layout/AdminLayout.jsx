import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

const ADMIN_VIEW_MODE_STORAGE_KEY = "admin-view-mode";
const ADMIN_VIEW_MODE_EVENT = "admin-view-mode-change";

function getSavedAdminViewMode() {
  if (typeof window === "undefined") return "mobile";

  const savedMode = localStorage.getItem(ADMIN_VIEW_MODE_STORAGE_KEY);
  return savedMode === "desktop" || savedMode === "mobile" ? savedMode : "mobile";
}

function getInitialSidebarState() {
  if (typeof window === "undefined") return 2;
  return getSavedAdminViewMode() === "desktop" || window.innerWidth >= 768 ? 2 : 0;
}

export default function AdminLayout() {
  const [sidebarState, setSidebarState] = useState(getInitialSidebarState)
  const [requestedViewMode, setRequestedViewMode] = useState(getSavedAdminViewMode)
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0)
    }
  }, [pathname])

  useEffect(() => {
    const handleViewModeChange = (event) => {
      const nextMode = event.detail?.mode;
      if (nextMode !== "desktop" && nextMode !== "mobile") return;

      setRequestedViewMode(nextMode);
      setSidebarState(nextMode === "desktop" || window.innerWidth >= 768 ? 2 : 0);
    };

    window.addEventListener(ADMIN_VIEW_MODE_EVENT, handleViewModeChange);
    return () => {
      window.removeEventListener(ADMIN_VIEW_MODE_EVENT, handleViewModeChange);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[#fcfafb] overflow-hidden font-sans">
      <AdminSidebar
        sidebarState={sidebarState}
        setSidebarState={setSidebarState}
        requestedViewMode={requestedViewMode}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader
          requestedViewMode={requestedViewMode}
        />
        <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-[#fcfafb]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
