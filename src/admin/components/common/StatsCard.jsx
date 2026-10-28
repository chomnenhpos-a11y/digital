import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const colorStyles = {
  emerald: {
    bg: "bg-[#870d4c]/10",
    text: "text-[#870d4c]",
    border: "border-l-[#5d0a35]",
  },
  green: {
    bg: "bg-[#870d4c]/10",
    text: "text-[#870d4c]",
    border: "border-l-[#5d0a35]",
  },
  blue: {
    bg: "bg-[#9d1159]/10",
    text: "text-[#9d1159]",
    border: "border-l-[#9d1159]",
  },
  purple: {
    bg: "bg-[#5d0a35]/10",
    text: "text-[#5d0a35]",
    border: "border-l-[#5d0a35]",
  },
  amber: {
    bg: "bg-[#c92a7e]/10",
    text: "text-[#c92a7e]",
    border: "border-l-[#c92a7e]",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-l-rose-500",
  },
  red: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-l-rose-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-l-indigo-500",
  },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  warning,
  note,
  link,
  onClick,
  isActive = false,
  className = "",
}) {
  const { t } = useTranslation();
  const style = colorStyles[color] || colorStyles.blue;
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider truncate">
          {title}
        </p>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ml-2 ${style.bg}`}
          >
            <Icon size={18} className={style.text} />
          </div>
        )}
      </div>

      <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>

      {trend !== undefined && trend !== null ? (
        <p
          className={`text-xs font-semibold flex items-center gap-1 ${
            Number(trend) >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          <span>
            {Number(trend) >= 0 ? "+" : ""}
            {trend}%
          </span>
          <span className="text-slate-400 font-normal">{t('dashboard.comparedToLastMonth')}</span>
        </p>
      ) : note ? (
        <p
          className={`text-xs ${warning ? "text-amber-600" : "text-slate-400"} truncate`}
        >
          {note}
        </p>
      ) : null}
    </>
  );
  const interactiveClasses = onClick
    ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 select-none"
    : "";
  const activeClasses = isActive ? "ring-2 ring-[#870d4c] shadow-sm" : "";

  return link ? (
    <Link
      to={link}
      onClick={onClick}
      className={`block bg-white border border-slate-200 border-l-4 ${style.border} rounded-2xl p-4 sm:p-5 hover:shadow-md transition-shadow ${activeClasses} ${className}`}
    >
      {cardContent}
    </Link>
  ) : (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 border-l-4 ${style.border} rounded-2xl p-4 sm:p-5 ${interactiveClasses} ${activeClasses} ${className}`}
    >
      {cardContent}
    </div>
  );
}
