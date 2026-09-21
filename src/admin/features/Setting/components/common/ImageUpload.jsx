import React from 'react';
import { Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImageUpload = ({
  id,
  preview,
  onChange,
  onClear,
  icon: Icon,
  uploadText,
  accept = "image/png,image/jpeg,image/webp",
  className = "w-40 h-40 rounded-2xl border border-slate-200 bg-[#fcfafb]",
  iconSize = 20,
  hint = "PNG, JPG, WEBP"
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center">
      <div className={`relative group overflow-hidden ${className}`}>
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain p-4 bg-white"
            />

            <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                <Upload size={17} className="text-white" />
              </div>

              <span className="text-xs font-semibold text-white">
                {t("settings.change", "Change")}
              </span>
            </div>
          </>
        ) : (
          <label
            htmlFor={id}
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3">
              <Icon size={iconSize} className="text-slate-400" />
            </div>

            <span className="text-xs font-semibold text-slate-600 text-center px-2">
              {uploadText}
            </span>

            {hint && (
              <span className="text-[10px] text-slate-400 mt-1">
                {hint}
              </span>
            )}
          </label>
        )}

        <input
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onChange}
        />

        {preview && (
          <label
            htmlFor={id}
            className="absolute inset-0 cursor-pointer"
          />
        )}
      </div>

      {preview && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
        >
          <X size={13} />
          {t("common.delete", "Remove")}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
