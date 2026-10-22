import { cn } from "../../../lib/utils";

export default function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    discount: "bg-[#870d4c] text-white",
    stock: "bg-blue-50 text-blue-600",
    inStock: "bg-green-600 text-white",
    lowStock: "bg-yellow-500 text-white",
    outOfStock: "bg-red-500 text-white",
    save: "bg-[#870d4c]/10 text-[#870d4c]",
  }

  const sizes = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1 rounded-md",
    md: "text-xs px-2 py-1 gap-1 rounded-md",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap font-medium",
        sizes[size],
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
