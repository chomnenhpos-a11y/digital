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
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
  warning,
  note,
  link
}) {
  const { t } = useTranslation();
  const style = colorStyles[color] || colorStyles.blue;
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-md font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </p>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${style.bg}`}
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
          className={`text-xs ${warning ? "text-amber-600" : "text-slate-400"}`}
        >
          {note}
        </p>
      ) : null}
    </>
  );
  return link ? (
    <Link
      to={link}
      className={`block bg-white border border-slate-200 border-l-4 ${style.border} rounded-2xl p-5 cursor-pointer hover:shadow-md transition-shadow`}
    >
      {cardContent}
    </Link>
  ) : (
    <div
      className={`bg-white border border-slate-200 border-l-4 ${style.border} rounded-2xl p-5`}
    >
      {cardContent}
    </div>
  );
}
