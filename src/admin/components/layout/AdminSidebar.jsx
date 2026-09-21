import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  ClipboardList,
  Users,
  Layers,
  Image,
  Settings,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  QrCode,
  Truck,
  BadgeCheck,
  Store,
} from "lucide-react";
import Swal from "sweetalert2";
import { useSettingsQuery } from "../../../queries/settings/useSettingQueries";

export default function AdminSidebar({ sidebarState, setSidebarState }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const shopCode = user?.shop?.code;

  const { data: settingData = {}, isLoading } = useSettingsQuery(shopCode);

  const [imgError, setImgError] = useState(false);

  const shopName = settingData?.shop_name || "Shop";
  const rawLogo = settingData?.logo;

  const baseUrl = useMemo(
    () => import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "",
    []
  );

  const logoUrl = useMemo(() => {
    if (!rawLogo) return "";

    if (rawLogo.startsWith("http")) {
      return rawLogo;
    }

    return `${baseUrl}${rawLogo.startsWith("/") ? "" : "/"}${rawLogo}`;
  }, [rawLogo, baseUrl]);

  useEffect(() => {
    setImgError(false);
  }, [logoUrl]);

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: t("common.logoutConfirmationTitle"),
      text: t("common.logoutConfirmationText"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("common.logout"),
      cancelButtonText: t("common.cancel"),
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/login", { replace: true });
      }
    });
  }, [t, logout, navigate]);

  useEffect(() => {
    let resizeFrame = null;

    const handleResize = () => {
      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }

      resizeFrame = requestAnimationFrame(() => {
        const isMobile = window.innerWidth < 768;

        setSidebarState((prev) => {
          if (isMobile) {
            return prev === 0 ? prev : 0;
          }

          return prev === 0 ? 1 : prev;
        });
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);

      if (resizeFrame) {
        cancelAnimationFrame(resizeFrame);
      }
    };
  }, [setSidebarState]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarState((prev) => (prev === 0 ? prev : 0));
    }
  }, [location.pathname, setSidebarState]);

  const handleToggle = useCallback(() => {
    const isMobile = window.innerWidth < 768;

    setSidebarState((prev) => {
      if (isMobile) {
        return prev === 2 ? 0 : 2;
      }

      return prev === 2 ? 1 : 2;
    });
  }, [setSidebarState]);

  const isFull = sidebarState === 2;
  const isHidden = sidebarState === 0;

  // Keep every animated child on the same timing curve as the sidebar.
  // This prevents the labels from resizing at a different speed than the shell.
  const contentVisibility = isFull
    ? "opacity-100 translate-x-0 delay-75"
    : "opacity-0 -translate-x-2 pointer-events-none";

  const menuSections = useMemo(
    () => [
      {
        title: t("navigation.main"),
        items: [
          {
            label: t("navigation.dashboard"),
            path: "/admin",
            icon: LayoutDashboard,
          },
          {
            label: t("navigation.orders"),
            path: "/admin/orders",
            icon: ClipboardList,
          },
          {
            label: t("navigation.saleForm"),
            path: "/admin/sale-form",
            icon: PlusCircle,
          },
        ],
      },
      {
        title: t("navigation.catalog"),
        items: [
          {
            label: t("navigation.products"),
            path: "/admin/products",
            icon: ShoppingBag,
          },
          {
            label: t("navigation.categories"),
            path: "/admin/categories",
            icon: Layers,
          },
          {
            label: t("navigation.promotions"),
            path: "/admin/promotions",
            icon: Image,
          },
        ],
      },
      {
        title: t("navigation.system"),
        items: [
          {
            label: t("navigation.users"),
            path: "/admin/users",
            icon: Users,
          },
          {
            label: t("navigation.deliveryProviders"),
            path: "/admin/delivery-providers",
            icon: Truck,
          },
          {
            label: t("navigation.qrCode"),
            path: "/admin/qr-code",
            icon: QrCode,
          },
          {
            label: t("navigation.settings"),
            path: "/admin/settings",
            icon: Settings,
          },
        ],
      },
    ],
    [t]
  );

  return (
    <>
      <div
        className={`md:hidden fixed inset-0 bg-[#44092e]/10 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          !isHidden
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarState(0)}
      />

      <aside
        className={`
          fixed md:relative z-50 h-full text-white flex flex-col
          border-r border-[#870d4c]/30
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          select-none shadow-2xl md:shadow-none
          will-change-[width,transform]
          ${
            isHidden
              ? "-translate-x-full md:translate-x-0 w-[80px]"
              : "translate-x-0"
          }
          ${sidebarState === 1 ? "w-[80px]" : ""}
          ${sidebarState === 2 ? "w-64" : ""}
        `}
        style={{
          backgroundColor: "#44092e",
        }}
      >
        <button
          onClick={handleToggle}
          className="absolute -right-5 top-1/2 -translate-y-1/2 bg-[#870d4c] text-white flex items-center justify-center w-5 h-20 hover:bg-[#9d1159] rounded-r-xl shadow-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 z-10"
          aria-label="Toggle Sidebar"
          type="button"
        >
          {isFull ? (
            <ChevronsLeft size={18} />
          ) : (
            <ChevronsRight size={18} />
          )}
        </button>

        <div className="p-6 h-[76px] font-bold text-lg text-white border-b border-[#870d4c]/30 flex items-center overflow-hidden shrink-0">
          <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden flex items-center justify-center border border-[#870d4c]/50 bg-white/5 shadow-inner">
            {logoUrl && !imgError ? (
              <img
                src={logoUrl}
                alt={shopName}
                className="object-cover w-full h-full"
                loading="eager"
                decoding="async"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-8 h-8 md:w-14 md:h-14 bg-red-100 text-red-800 rounded-md flex items-center justify-center shrink-0">
                <Store size={18} />
              </div>
            )}
          </div>

          <div
            className={`ml-4 min-w-0 whitespace-nowrap transition-[opacity,transform] duration-200 ease-out ${contentVisibility}`}
          >
            <div className="overflow-hidden whitespace-nowrap relative w-full flex flex-col justify-center">
              {isLoading || shopName.length <= 12 ? (
                <span
                  className="text-white text-xl font-bold leading-tight truncate"
                  title={shopName}
                >
                  {isLoading ? "N/A" : shopName}
                </span>
              ) : (
                <div
                  className="flex w-max animate-marquee-reverse-custom"
                  title={shopName}
                >
                  <span className="text-white text-xl font-bold leading-tight pr-8">
                    {shopName}
                  </span>

                  <span
                    className="text-white text-xl font-bold leading-tight pr-8"
                    aria-hidden="true"
                  >
                    {shopName}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 mt-0.5 overflow-hidden">
                <span className="text-white/60 text-xs font-medium leading-tight truncate">
                  Hello {user?.name ? `, ${user.name}` : ""}
                </span>

                {user?.role?.toLowerCase() === "admin" && (
                  <BadgeCheck
                    size={14}
                    className="text-white fill-blue-500 shrink-0"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto overflow-x-hidden scroll-smooth overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(135,13,76,0.5)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#870d4c]/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#870d4c]">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div
                className={`h-5 overflow-hidden transition-[height,opacity,transform,margin] duration-200 ease-out ${
                  isFull
                    ? "opacity-100 translate-x-0 mb-2"
                    : "h-0 opacity-0 -translate-x-2 mb-0"
                }`}
              >
                <div>
                  <h2 className="px-4 text-[11px] font-bold text-white/50 tracking-widest whitespace-nowrap uppercase">
                    {section.title}
                  </h2>
                </div>
              </div>

              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm transition-colors duration-150 relative group overflow-hidden ${
                      isActive
                        ? "bg-[#870d4c] text-white font-semibold shadow-md"
                        : "hover:bg-[#870d4c]/40 hover:text-white text-white/70"
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <Icon
                        size={18}
                        className={`shrink-0 transition-transform duration-150 ease-out ${
                          isActive
                            ? ""
                            : "group-hover:scale-110"
                        }`}
                      />

                      <div
                        className={`ml-3 whitespace-nowrap transition-[opacity,transform] duration-200 ease-out ${contentVisibility}`}
                      >
                        <span className="leading-normal">
                          {item.label}
                        </span>
                      </div>
                    </div>

                    {!isFull && !isHidden && (
                      <div className="absolute left-[calc(100%+8px)] px-2.5 py-1.5 bg-[#870d4c] text-white font-medium text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 ease-out z-50 whitespace-nowrap shadow-xl">
                        {item.label}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[#870d4c]/30 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm transition-colors duration-150 relative group overflow-hidden hover:bg-red-500/20 hover:text-red-400 text-white/70"
            title={t("common.logout")}
            type="button"
          >
            <div className="flex items-center min-w-0">
              <LogOut
                size={18}
                className="shrink-0 transition-transform duration-150 ease-out group-hover:-translate-x-1"
              />

              <div
                className={`ml-3 whitespace-nowrap transition-[opacity,transform] duration-200 ease-out ${contentVisibility}`}
              >
                <span className="leading-normal">
                  {t("common.logout")}
                </span>
              </div>
            </div>

            {!isFull && !isHidden && (
              <div className="absolute left-[calc(100%+8px)] px-2.5 py-1.5 bg-red-600 text-white font-medium text-xs rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-150 ease-out z-50 whitespace-nowrap shadow-xl">
                <div>{t("common.logout")}</div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
