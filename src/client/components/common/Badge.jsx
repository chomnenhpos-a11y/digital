export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    discount: "bg-red-600 text-white",
    stock: "bg-blue-50 text-blue-600",
  }

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${variants[variant]}`}>
      {children}
    </span>
  )
  
}