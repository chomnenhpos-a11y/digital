import React from 'react';

const SectionHeader = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-[#fcfafb] flex items-center justify-center shrink-0">
        <Icon size={19} className="text-slate-700" />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>

        {description && (
          <p className="text-xs text-slate-500 mt-1 leading-5">{description}</p>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
