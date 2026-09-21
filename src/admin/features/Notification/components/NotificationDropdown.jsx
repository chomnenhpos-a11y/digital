import React from 'react';
import { IoNotifications } from "react-icons/io5";
import { Filter, ShoppingBag, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotification';
import { useTranslation } from "react-i18next";

export default function NotificationDropdown() {
  const { t } = useTranslation();
  const {
    isOpen,
    dropdownRef,
    activeTab,
    setActiveTab,
    typeFilter,
    setTypeFilter,
    filteredNotifications,
    unreadCount,
    markAllAsRead,
    toggleDropdown,
    handleNotificationClick
  } = useNotifications();

  // Helper for relative time (frontend-only fallback)
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const diffInSeconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    
    if (diffInSeconds < 60) return t('notifications.justNow');
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} ${t('notifications.minutesAgo')}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${t('notifications.hoursAgo')}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t('notifications.yesterday');
    return `${diffInDays} ${t('notifications.daysAgo')}`;
  };

  const renderIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingBag className="text-[#870d4c]" size={20} />;
      case 'low_stock': return <AlertTriangle className="text-amber-600" size={20} />;
      case 'out_of_stock': return <AlertCircle className="text-red-700" size={20} />;
      default: return <IoNotifications className="text-slate-500" size={20} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button using IoNotifications */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-slate-600 px-2 py-1.5 border-[2px] hover:bg-[#870d4c]/20 rounded-md transition-colors flex items-center justify-center"
        aria-label="Notifications"
      >
        <IoNotifications size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#9d1159] rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {/* Pop-up Card */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="text-lg font-bold text-slate-900">{t('notifications.title')}</h3>
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-[#870d4c] hover:text-[#9d1159] transition-colors"
            >
              {t('notifications.markAllAsRead')}
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center justify-between px-5 border-b border-slate-100">
            <div className="flex gap-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-3 border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('notifications.all')}
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'unread'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('notifications.unread')}
                {unreadCount > 0 && (
                  <span className="bg-[#fcfafb] text-slate-600 px-1.5 py-0.5 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('read')}
                className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'read'
                    ? 'border-slate-900 text-slate-900 font-semibold'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {t('notifications.read')}
              </button>
            </div>
            <div className="text-slate-400 pb-3 flex items-center gap-1">
              <Filter size={16} />
            </div>
          </div>

          {/* Type Filters */}
          <div className="px-5 py-3 flex gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-50">
            {[
              { id: 'all', label: t('notifications.all') },
              { id: 'order', label: t('notifications.orders') },
              { id: 'low_stock', label: t('notifications.lowStock') },
              { id: 'out_of_stock', label: t('notifications.outOfStock') }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setTypeFilter(filter.id)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  typeFilter === filter.id 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-[#fcfafb] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`flex items-start gap-2 px-4 py-1.5 hover:bg-pink-400/20 transition-colors cursor-pointer ${
                    !item.read ? 'bg-[#fcfafb]/60' : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center bg-[#f9acd960]">
                    {renderIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 font-medium">
                      {item.type === 'order' && t('notifications.newOrder')}
                      {item.type === 'low_stock' && t('notifications.lowStock')}
                      {item.type === 'out_of_stock' && t('notifications.outOfStock')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {item.type === 'order' && `${item.orderNo} - $${item.totalAmount}`}
                      {item.type === 'low_stock' && `${item.name} (${t('notifications.onlyItemsLeft').replace('{{count}}', item.stockQuantity)})`}
                      {item.type === 'out_of_stock' && `${item.name} - ${t('notifications.outOfStockMessage')}`}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  {!item.read && (
                    <span className="w-2 h-2 bg-[#9d1159] rounded-full shrink-0 self-center mt-1"></span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-sm">
                {t('notifications.empty')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}