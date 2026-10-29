import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
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

function getTrendMagnitude(trend, t) {
  const abs = Math.abs(Number(trend) || 0);
  if (abs === 0) return t('dashboard.noChange', { defaultValue: 'No change' });
  if (abs <= 10) return t('dashboard.smallChange', { defaultValue: 'Small change' });
  if (abs <= 30) return t('dashboard.moderateChange', { defaultValue: 'Moderate change' });
  if (abs <= 100) return t('dashboard.largeChange', { defaultValue: 'Large change' });
  return t('dashboard.veryLargeChange', { defaultValue: 'Very large change' });
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  invertTrendColor = false,
  trendLabel,
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

  const parsedTrend = trend !== undefined && trend !== null ? Number(trend) : null;
  const numTrend = Number.isFinite(parsedTrend)
    ? Math.max(-100, Math.min(100, parsedTrend))
    : null;
  const hasTrend = numTrend !== null;
  const isPositive = numTrend !== null && numTrend > 0;
  const isNegative = numTrend !== null && numTrend < 0;

  const trendColorClass = invertTrendColor
    ? isPositive
      ? "text-red-500"
      : isNegative
        ? "text-emerald-600"
        : "text-slate-500"
    : isPositive
      ? "text-emerald-600"
      : isNegative
        ? "text-red-500"
        : "text-slate-500";

  const formattedTrend = numTrend === null
    ? ""
    : Number.isInteger(numTrend)
      ? String(numTrend)
      : numTrend.toFixed(1);
  const prefix = isPositive ? "+" : "";
  const trendTitle = hasTrend
    ? `${getTrendMagnitude(parsedTrend, t)} (${prefix}${formattedTrend}%${Math.abs(parsedTrend) > 100 ? ", display capped at 100%" : ""})`
    : "";

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

      {hasTrend ? (
        <p
          className={`text-xs font-semibold flex items-center gap-1.5 ${trendColorClass}`}
          title={trendTitle}
        >
          <span className="inline-flex items-center gap-1">
            {isPositive && <TrendingUp className="w-3.5 h-3.5 shrink-0 text-emerald-600" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5 shrink-0 text-red-500" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5 shrink-0 text-slate-500" />}
            <span>{prefix}{formattedTrend}%</span>
          </span>
          <span className="text-slate-400 font-normal">
            {trendLabel || t('dashboard.comparedToLastMonth')}
          </span>
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
