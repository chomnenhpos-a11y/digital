import { ArrowRight } from "lucide-react";
import { Icon } from "@iconify/react";

export default function SectionHeader({
  title,
  subtitle,
  action,
  icon,
  iconHeight = "1em",
}) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 leading-khmer">
        {icon && (
          <Icon
            icon={icon}
            height={iconHeight}
            style={{ color: "#d1a500" }}
            aria-hidden="true"
          />
        )}

        {title}
      </h2>

      {subtitle && (
        <p className="text-sm text-slate-500">
          {subtitle}
        </p>
      )}

      {action && (
        <div className="flex items-center gap-1 ml-auto">
          {action}
          <ArrowRight size={16} />
        </div>
      )}
    </div>
  );
}