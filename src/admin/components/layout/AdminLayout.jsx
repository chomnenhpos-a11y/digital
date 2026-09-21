import React, { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout() {
  const [sidebarState, setSidebarState] = useState(window.innerWidth < 768 ? 0 : 2)
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0)
    }
  }, [pathname])

  return (
    <div className="flex h-screen bg-[#fcfafb] overflow-hidden font-sans">
      <AdminSidebar sidebarState={sidebarState} setSidebarState={setSidebarState} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader sidebarState={sidebarState} setSidebarState={setSidebarState} />
        <main ref={mainRef} className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-[#fcfafb]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}