import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../../components/common/PageHeader';
import GeneralSettings from '../components/GeneralSettings';
import ProfileSettings from '../components/ProfileSettings';
// import PermissionSettings from '../components/PermissionSettings';
import { Store, User, ShieldCheck, Settings2 } from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: Store },
    { id: 'profile', label: t('settings.profile'), icon: User },
    // { id: 'permissions', label: t('settings.permissions'), icon: Settings2 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-52 shrink-0 space-y-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#870d4c]/5 text-[#9d1159] shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-[#870d4c]' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === 'general' && <GeneralSettings />}
          {activeTab === 'profile' && <ProfileSettings />}
          {/* {activeTab === 'permissions' && <PermissionSettings />} */}
        </div>
      </div>
    </div>
  );
}