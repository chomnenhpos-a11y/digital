import React from 'react';

const SettingFormField = ({
  label,
  error,
  required = false,
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {error && <p className="text-xs text-red-500 mt-1.5">{error.message}</p>}
    </div>
  );
};

export default SettingFormField;
